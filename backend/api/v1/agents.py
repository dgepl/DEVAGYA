import base64
import io
import logging
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
    conversation_id: str, user_id: str, agent_system_prompt: str, language: str = "english"
) -> list:
    """Build full OpenAI-compatible message context from stored agent conversation history."""
    # Build system prompt with language instruction
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, "")
    full_system = agent_system_prompt
    if lang_instruction:
        full_system = f"{agent_system_prompt}\n\n{lang_instruction}"

    messages = [{"role": "system", "content": full_system}]

    conv = chat_history_service.get_conversation(conversation_id, user_id)
    if not conv:
        return messages

    for msg in conv["messages"]:
        msg_text = str(msg.get("content") or "").strip()
        if not msg_text and not msg.get("image_urls"):
            continue

        if msg["sender"] == "user":
            urls = msg.get("image_urls", [])
            if isinstance(urls, list) and len(urls) > 0 and any(u.startswith("data:") for u in urls):
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

    # Resolve or create the conversation
    conv = None
    if conversation_id:
        conv = chat_history_service.get_conversation(conversation_id, user_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found or does not belong to this user.")
        # Update language if changed
        if conv.get("language") != language:
            chat_history_service.update_language(conversation_id, language)
    else:
        conv = chat_history_service.create_conversation(
            user_id, _derive_title(message or (doc_sections[0] if doc_sections else "Document Chat")), agent_code=agent_code, language=language
        )

    # Process uploaded images -> compressed base64 data URLs
    data_urls: List[str] = []
    for f in images[:MAX_IMAGES]:
        data = await f.read()
        if len(data) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=400, detail="Image too large. Maximum allowed size is 6 MB per image.")
        data_urls.append(_image_to_data_url(data, f.content_type or "image/jpeg"))

    # Persist the user message
    chat_history_service.add_message(
        conv["id"], "user", final_user_prompt or "*(Document attached)*", data_urls
    )
    if conv.get("title") in ("New Chat", None) and final_user_prompt:
        chat_history_service.update_title(conv["id"], _derive_title(message or (all_doc_files[0].filename if all_doc_files else "New Chat")))

    # Build AI messages from full conversation context
    ai_messages = _build_agent_ai_messages(conv["id"], user_id, agent["system_prompt"], language)

    if stream:
        async def event_generator():
            full = ""
            try:
                async for chunk in ai_provider.stream_chat_completion(ai_messages):
                    full += chunk
                    yield chunk
            except Exception as e:
                logger.error(f"Agent chat streaming error: {e}")
                if agent_code == "english_coach":
                    fallback = "I can see you on camera! If you felt a bit nervous, take a relaxed breath—your speech was actually very clear. Shall we practice the next line?"
                else:
                    fallback = f"*(Temporary AI connection delay. Please ask your question again.)*"
                full += fallback
                yield fallback
            finally:
                if not full.strip() or "processing high traffic" in full or "temporarily busy" in full:
                    if agent_code == "english_coach":
                        fallback_msg = "I can see you clearly on camera! Don't feel nervous at all—relax and smile, your pronunciation was wonderful. Let us try the next sentence together!"
                    else:
                        fallback_msg = "Hello! I'm here and ready to help. What topic or lesson would you like to explore?"
                    full = fallback_msg
                    yield fallback_msg
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
