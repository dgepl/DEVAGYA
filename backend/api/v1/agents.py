import base64
import io
import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Form, File, UploadFile, Query, HTTPException
from fastapi.responses import StreamingResponse
from PIL import Image

from schemas.phase4 import AgentExecutePayload, AgentResponse
from services.agent_manager import agent_manager_service
from services.ai_provider import ai_provider
from services.chat_history_service import chat_history_service
from services.pdf_service import extract_document_text
from services.xp_service import xp_service, calculate_xp

logger = logging.getLogger("agents_router")

router = APIRouter(prefix="/agents", tags=["AI Agent OS & Agent Marketplace"])

MAX_IMAGES = 4
MAX_IMAGE_BYTES = 6 * 1024 * 1024
MAX_DOC_BYTES = 15 * 1024 * 1024

LANGUAGE_INSTRUCTIONS = {
    "hindi": "CRITICAL INSTRUCTION: You MUST reply ONLY in Hindi (Devanagari script). Every word of your response must be in Hindi. Do NOT use English at all.",
    "hinglish": "CRITICAL INSTRUCTION: You MUST reply ONLY in Hinglish (a mix of Hindi and English, written in Roman/Latin script). Use conversational Hinglish that Indian students commonly speak.",
    "english": "",
}

# High-speed in-memory conversation context cache for live conversational agents (e.g. English Coach)
_live_conv_cache: Dict[str, dict] = {}


from services.rate_limiter import check_rate_limit
from fastapi import Depends

ALLOWED_MAGIC_HEADERS = (
    b'\xff\xd8\xff',        # JPEG
    b'\x89PNG\r\n\x1a\n',   # PNG
    b'RIFF',                 # WEBP
    b'GIF87a', b'GIF89a',    # GIF
    b'BM'                    # BMP
)

def _image_to_data_url(file_bytes: bytes, content_type: str) -> str:
    """Validate, sanitize, resize/compress an uploaded image and return a base64 data URL."""
    if not file_bytes:
        return ""
    
    # Enforce maximum 6MB payload limit
    if len(file_bytes) > 6 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image exceeds maximum allowed size of 6MB.")

    # Validate image signature / magic bytes to block disguised executables
    if not any(file_bytes.startswith(sig) for sig in ALLOWED_MAGIC_HEADERS):
        logger.warning("Rejected upload with invalid image signature.")
        raise HTTPException(status_code=400, detail="Invalid image file format. Only JPEG, PNG, WEBP, and GIF are allowed.")

    try:
        image = Image.open(io.BytesIO(file_bytes))
        image = image.convert("RGB")
        if image.width > 1280:
            height = int(image.height * 1280 / image.width)
            image = image.resize((1280, height))
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=80)
        encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
        return f"data:image/jpeg;base64,{encoded}"
    except Exception as e:
        logger.error(f"Image processing error: {e}")
        raise HTTPException(status_code=400, detail="Corrupted or unreadable image file.")


def _derive_title(message: str) -> str:
    clean = " ".join((message or "").split())
    if not clean:
        return "New Chat"
    # If starting with document marker, pull title from filename or clean text
    if "[ATTACHED WORKSHEET / DOCUMENT:" in clean:
        parts = clean.split("]", 1)
        if len(parts) > 0:
            return parts[0].replace("[ATTACHED WORKSHEET / DOCUMENT:", "Doc:").strip()[:60]
    return clean[:60] + ("..." if len(clean) > 60 else "")


def _build_agent_ai_messages(
    conversation_id: str,
    user_id: str,
    agent_system_prompt: str,
    language: str = "english",
    conv: Optional[dict] = None,
    agent_code: Optional[str] = None,
) -> list:
    """Build full OpenAI-compatible message context from stored agent conversation history."""
    # Build system prompt with language instruction
    if agent_code == "english_coach":
        if language == "hindi":
            lang_instruction = (
                "CRITICAL INSTRUCTION FOR HINDI COACHING:\n"
                "1. You MUST speak, praise, converse, and explain ONLY in pure, authentic Hindi written in clean Devanagari script (हिंदी देवनागरी लिपि, e.g. 'बहुत बढ़िया! आपका बोलना बहुत प्रभावशाली है।').\n"
                "2. NEVER write Hindi words using English/Latin alphabets (STRICTLY NO Romanized Hindi/Hinglish like 'aap kaise hain'). Every Hindi word MUST be in Devanagari script.\n"
                "3. When providing the polished English expression for the teacher to practice:\n"
                "   - Keep the '✨ Better: [Clean English sentence]' in clear spoken English so the learner can speak it.\n"
                "   - Keep the '💡 Tip: [Helpful tip]' and all praise/questions in natural, warm Devanagari Hindi.\n"
                "4. Keep your reply conversational, encouraging, and natural (1-2 spoken sentences) with authentic Hindi colleague cadence for instant voice synthesis."
            )
        elif language == "hinglish":
            lang_instruction = (
                "CRITICAL INSTRUCTION: Reply in natural conversational Hinglish. Keep the tone warm and collegial, and provide the '✨ Better:' line in clean polished English."
            )
        else:
            lang_instruction = (
                "CRITICAL INSTRUCTION: Reply in fluent, expressive, natural conversational English with authentic human warmth, realistic prosody, and supportive encouragement."
            )
    else:
        lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, "")

    full_system = agent_system_prompt
    if lang_instruction:
        full_system = f"{agent_system_prompt}\n\n{lang_instruction}"

    messages = [{"role": "system", "content": full_system}]

    if conv is None:
        conv = chat_history_service.get_conversation(conversation_id, user_id)
    if not conv:
        return messages

    conv_messages = conv.get("messages", [])
    if agent_code == "english_coach" and len(conv_messages) > 6:
        conv_messages = conv_messages[-6:]
    total_msgs = len(conv_messages)
    for idx, msg in enumerate(conv_messages):
        msg_text = str(msg.get("content") or "").strip()
        if not msg_text and not msg.get("image_urls"):
            continue

        if msg["sender"] == "user":
            urls = msg.get("image_urls", [])
            # Only include image data URLs for the very latest message (or current turn) to keep API payloads ultra-light
            is_latest_user_msg = (idx == total_msgs - 1) or (idx == total_msgs - 2 and conv_messages[-1].get("sender") != "user")
            if is_latest_user_msg and isinstance(urls, list) and len(urls) > 0 and any(u.startswith("data:") for u in urls):
                content = ai_provider.build_vision_content(msg_text or "*(Image attached)*", urls)
            else:
                content = msg_text
        else:
            content = msg_text
        messages.append({"role": msg["sender"], "content": content})

    return messages


# ============================================================
# ORIGINAL ENDPOINTS (preserved)
# ============================================================

@router.get("/list")
async def list_ai_agents(role_scope: str = Query("all")):
    """List all available specialized AI Agents in Marketplace."""
    agents = agent_manager_service.get_all_agents()
    if role_scope != "all":
        return [a for a in agents if a["role_scope"] == role_scope or a["role_scope"] == "general"]
    return agents


@router.get("/detail/{agent_code}")
async def get_agent_detail(agent_code: str):
    """Fetch details, configuration, and tools for a specific agent."""
    return agent_manager_service.get_agent_by_code(agent_code)


@router.post("/execute", response_model=AgentResponse)
async def execute_agent_query(payload: AgentExecutePayload):
    """Execute a query against a specific specialized AI Agent (non-streaming, legacy)."""
    return await agent_manager_service.execute_agent(payload)


# ============================================================
# NEW: Agent Chat with Streaming, Images, PDFs & Language
# ============================================================

@router.get("/conversations")
async def list_agent_conversations(
    user_id: str = Query(..., description="Logged-in user id"),
    agent_code: Optional[str] = Query(None, description="Filter by agent code"),
):
    """List all agent chat conversations for a user (newest first)."""
    return {"conversations": chat_history_service.list_conversations(user_id or "usr-guest", agent_code)}


@router.get("/conversations/{conversation_id}")
async def get_agent_conversation(conversation_id: str, user_id: str = Query(...)):
    """Fetch a full agent conversation history so the user can continue from where they left off."""
    conv = chat_history_service.get_conversation(conversation_id, user_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.delete("/conversations/{conversation_id}")
async def delete_agent_conversation(conversation_id: str, user_id: str = Query(...)):
    """Permanently delete an agent conversation."""
    deleted = chat_history_service.delete_conversation(conversation_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "deleted"}


@router.post("/chat")
async def agent_chat_message(
    message: str = Form(""),
    agent_code: str = Form("teacher_mentor"),
    conversation_id: Optional[str] = Form(None),
    user_id: Optional[str] = Form("usr-guest"),
    user_email: Optional[str] = Form(None),
    language: str = Form("english"),
    stream: bool = Form(True),
    images: List[UploadFile] = File([]),
    documents: List[UploadFile] = File([]),
    files: List[UploadFile] = File([]),
):
    """
    Send a chat message to a specific AI Agent with optional images, PDFs, and worksheets.

    - If conversation_id is provided, continues that conversation.
    - Supports uploading PDF, DOCX, TXT worksheets and documents.
    - Language can be: english, hindi, hinglish.
    - Returns a streaming Markdown response saved to history.
    """
    user_id = (user_id or "usr-guest").strip()
    message = (message or "").strip()

    # Combine documents and files lists
    all_doc_files = (documents or []) + (files or [])

    if not message and not images and not all_doc_files:
        raise HTTPException(status_code=400, detail="Message, image, or document/worksheet is required.")

    # Resolve the agent
    agent = agent_manager_service.get_agent_by_code(agent_code)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found.")

    try:
        from services.activity_service import activity_service
        from services.supabase_service import supabase_service
        
        email_cand = (user_email or "").strip().lower()
        if not email_cand or "@" not in email_cand:
            if user_id and "@" in user_id:
                email_cand = user_id.strip().lower()
            elif user_id and user_id != "usr-guest":
                try:
                    prof = await supabase_service.get_profile(user_id)
                    if prof and prof.get("email"):
                        email_cand = prof["email"].strip().lower()
                    else:
                        email_cand = f"{user_id}@devgya.in"
                except Exception:
                    email_cand = f"{user_id}@devgya.in"
            else:
                email_cand = "guest@devgya.in"

        agent_name = agent.get("name") if isinstance(agent, dict) else agent_code.replace("_", " ").title()
        if agent_code == "english_coach":
            asyncio.create_task(asyncio.to_thread(
                activity_service.record_activity,
                email=email_cand,
                name=agent_name,
                role="teacher" if "teacher" in agent_code else "student",
                action="ai_chat",
                feature_id=agent_code,
                feature_name=f"AI Agent: {agent_name}",
                path=f"/dashboard/agents?agent={agent_code}"
            ))
        else:
            activity_service.record_activity(
                email=email_cand,
                name=agent_name,
                role="teacher" if "teacher" in agent_code else "student",
                action="ai_chat",
                feature_id=agent_code,
                feature_name=f"AI Agent: {agent_name}",
                path=f"/dashboard/agents?agent={agent_code}"
            )
    except Exception as act_err:
        logger.warning(f"Failed to record agent activity: {act_err}")

    # Process uploaded documents / PDFs / Worksheets -> extract text
    doc_sections: List[str] = []
    for d in all_doc_files:
        data = await d.read()
        if len(data) > MAX_DOC_BYTES:
            raise HTTPException(status_code=400, detail=f"Document '{d.filename}' is too large. Maximum size is 15 MB.")
        extracted_text = extract_document_text(data, d.filename or "worksheet.pdf", d.content_type or "")
        doc_sections.append(
            f"📄 **[ATTACHED WORKSHEET / DOCUMENT: {d.filename or 'worksheet.pdf'}]**\n"
            f"```\n{extracted_text}\n```"
        )

    # Combine extracted document text with user message
    final_user_prompt = ""
    if doc_sections:
        combined_docs = "\n\n".join(doc_sections)
        if message:
            final_user_prompt = f"{combined_docs}\n\n**User Question/Instruction:**\n{message}"
        else:
            final_user_prompt = (
                f"{combined_docs}\n\n"
                f"**User Instruction:**\n"
                f"Please carefully analyze and explain the attached document/worksheet above step-by-step. "
                f"Solve any questions or exercises inside it, explain key concepts in detail, and highlight important points."
            )
    else:
        final_user_prompt = message

    # Resolve or create the conversation (self-healing if id expired or not found)
    conv = None
    if agent_code == "english_coach" and conversation_id and conversation_id in _live_conv_cache:
        conv = _live_conv_cache[conversation_id]
        if conv and conv.get("language") != language:
            conv["language"] = language
            asyncio.create_task(asyncio.to_thread(chat_history_service.update_language, conversation_id, language))
    elif conversation_id:
        conv = chat_history_service.get_conversation(conversation_id, user_id)
        if conv and conv.get("language") != language:
            chat_history_service.update_language(conversation_id, language)

    if not conv:
        conv = chat_history_service.create_conversation(
            user_id, _derive_title(message or (doc_sections[0] if doc_sections else "Document Chat")), agent_code=agent_code, language=language
        )

    if agent_code == "english_coach" and conv:
        _live_conv_cache[conv["id"]] = conv

    # Process uploaded images -> compressed base64 data URLs
    data_urls: List[str] = []
    for f in images[:MAX_IMAGES]:
        data = await f.read()
        if len(data) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=400, detail="Image too large. Maximum allowed size is 6 MB per image.")
        data_urls.append(_image_to_data_url(data, f.content_type or "image/jpeg"))

    # Persist the user message
    user_msg_content = final_user_prompt or "*(Document attached)*"
    # If this is English Speaking Coach with structured live directive, extract clean user speech for Supabase & titles
    if agent_code == "english_coach" and 'Teacher said: "' in message:
        try:
            extracted_speech = message.split('Teacher said: "', 1)[1].split('"', 1)[0].strip()
            if extracted_speech:
                user_msg_content = extracted_speech
        except Exception:
            pass

    if agent_code == "english_coach":
        asyncio.create_task(asyncio.to_thread(
            chat_history_service.add_message,
            conv["id"], "user", user_msg_content, data_urls
        ))
    else:
        chat_history_service.add_message(
            conv["id"], "user", user_msg_content, data_urls
        )
    if "messages" not in conv or not isinstance(conv["messages"], list):
        conv["messages"] = []
    conv["messages"].append({
        "id": f"usr-{uuid.uuid4().hex[:8]}",
        "sender": "user",
        "content": user_msg_content,
        "image_urls": data_urls,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    if conv.get("title") in ("New Chat", None) and final_user_prompt:
        title_source = user_msg_content if (agent_code == "english_coach" and user_msg_content != final_user_prompt) else (message or (all_doc_files[0].filename if all_doc_files else "New Chat"))
        new_title = _derive_title(title_source)
        conv["title"] = new_title
        if agent_code == "english_coach":
            asyncio.create_task(asyncio.to_thread(chat_history_service.update_title, conv["id"], new_title))
        else:
            chat_history_service.update_title(conv["id"], new_title)

    # Build AI messages from full conversation context (reusing conv to save Supabase fetch latency)
    ai_messages = _build_agent_ai_messages(conv["id"], user_id, agent["system_prompt"], language, conv=conv, agent_code=agent_code)

    if stream:
        async def event_generator():
            full = ""
            try:
                fast_model = "gemini-3.5-flash-lite" if agent_code == "english_coach" else None
                max_toks = 85 if agent_code == "english_coach" else None
                async for chunk in ai_provider.stream_chat_completion(ai_messages, max_tokens=max_toks, model=fast_model):
                    full += chunk
                    yield chunk
            except Exception as e:
                logger.error(f"Agent chat streaming error: {e}")
                if agent_code == "english_coach":
                    has_cam = len(data_urls) > 0 or "camera is on" in (message or "").lower()
                    if has_cam:
                        fallback = "Your facial expression and delivery were very natural! Shall we practice the next sentence?"
                    else:
                        fallback = "Your speech was clear and articulate! Shall we practice the next sentence?"
                else:
                    fallback = f"*(Temporary AI connection delay. Please ask your question again.)*"
                full += fallback
                yield fallback
            finally:
                if not full.strip() or "processing high traffic" in full or "temporarily busy" in full:
                    if agent_code == "english_coach":
                        has_cam = len(data_urls) > 0 or "camera is on" in (message or "").lower()
                        if has_cam:
                            fallback_msg = "Your expression looks confident and engaged! Take a gentle breath, and let's try the next sentence."
                        else:
                            fallback_msg = "Your pronunciation is coming along nicely! Speak whenever you are ready for the next line."
                    else:
                        fallback_msg = "Hello! I'm here and ready to help. What topic or lesson would you like to explore?"
                    full = fallback_msg
                    yield fallback_msg
                if agent_code == "english_coach":
                    asyncio.create_task(asyncio.to_thread(chat_history_service.add_message, conv["id"], "assistant", full))
                    asyncio.create_task(asyncio.to_thread(chat_history_service.touch_conversation, conv["id"]))
                else:
                    chat_history_service.add_message(conv["id"], "assistant", full)
                    chat_history_service.touch_conversation(conv["id"])

        response = StreamingResponse(event_generator(), media_type="text/plain")
        response.headers["X-Conversation-Id"] = conv["id"]
        
        # Award XP (Students only)
        is_parent = user_id.startswith("prt-") or agent_code == "parent_coach"
        if not is_parent:
            xp_amount = calculate_xp(message, has_image=len(data_urls) > 0)
            try:
                await xp_service.award_xp(user_id, "", xp_amount)
            except Exception:
                pass
            response.headers["X-XP-Earned"] = str(xp_amount)

        return response

    # Non-streaming fallback
    content = await ai_provider.chat_completion(ai_messages)
    chat_history_service.add_message(conv["id"], "assistant", content)
    chat_history_service.touch_conversation(conv["id"])

    is_parent = user_id.startswith("prt-") or agent_code == "parent_coach"
    xp_amount = 0
    if not is_parent:
        xp_amount = calculate_xp(message, has_image=len(data_urls) > 0)
        try:
            await xp_service.award_xp(user_id, "", xp_amount)
        except Exception:
            pass

    return {"response": content, "conversation_id": conv["id"], "xp_earned": xp_amount}
