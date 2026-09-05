import base64
import io
import logging
from typing import List, Optional

from fastapi import APIRouter, Form, File, UploadFile, Query, HTTPException
from fastapi.responses import StreamingResponse
from PIL import Image

from services.ai_provider import ai_provider
from services.chat_history_service import chat_history_service
from services.academic_guardrail import attach_academic_guardrail

logger = logging.getLogger("chat_router")

router = APIRouter(prefix="/chat", tags=["AI Chat Studio"])

SYSTEM_PROMPT = attach_academic_guardrail(
    "You are DEVGYA AI, an educational AI assistant developed by DEVGYA GLOBAL "
    "EDUTECH PRIVATE LIMITED exclusively for educational and learning purposes across all subjects and grades. "
    "You are an expert educator, mentor and content assistant who responds in clear, structured Markdown. "
    "Use headings, bullet lists, numbered steps, bold key terms, tables, and code blocks where helpful. "
    "Always be warm, concise, accurate, encouraging, and strictly focused on educational excellence. "
    "If an image is provided, study it carefully (e.g. handwritten notes, textbook "
    "pages, or worksheets) and answer based on its contents."
)

LANGUAGE_INSTRUCTIONS = {
    "hindi": "CRITICAL INSTRUCTION: You MUST reply ONLY in Hindi (Devanagari script). Every word of your response must be in Hindi. Do NOT use English at all.",
    "hinglish": "CRITICAL INSTRUCTION: You MUST reply ONLY in Hinglish (a mix of Hindi and English, written in Roman/Latin script). Use conversational Hinglish that Indian students commonly speak.",
    "english": "",
}

MAX_IMAGES = 4
MAX_IMAGE_BYTES = 6 * 1024 * 1024


ALLOWED_MAGIC_HEADERS = (
    b'\xff\xd8\xff',        # JPEG
    b'\x89PNG\r\n\x1a\n',   # PNG
    b'RIFF',                 # WEBP
    b'GIF87a', b'GIF89a',    # GIF
    b'BM'                    # BMP
)

def _image_to_data_url(file_bytes: bytes, content_type: str) -> str:
    """Validate, sanitize, resize/compress an uploaded image and return a base64 data URL for vision models."""
    if not file_bytes:
        return ""

    if len(file_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image exceeds maximum allowed size of 6MB.")

    # Validate image signature / magic bytes to block disguised executables
    if not any(file_bytes.startswith(sig) for sig in ALLOWED_MAGIC_HEADERS):
        logger.warning("Rejected upload with invalid image signature in chat.")
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
        logger.error(f"Chat vision processing error: {e}")
        raise HTTPException(status_code=400, detail="Corrupted or unreadable image file.")


def _derive_title(message: str) -> str:
    clean = " ".join((message or "").split())
    if not clean:
        return "New Chat"
    return clean[:60] + ("..." if len(clean) > 60 else "")


def _build_ai_messages(conversation_id: str, user_id: str, language: str = "english") -> list:
    """Reconstruct full OpenAI-compatible message context from stored history."""
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, "")
    full_system = SYSTEM_PROMPT
    if lang_instruction:
        full_system = f"{SYSTEM_PROMPT}\n\n{lang_instruction}"

    conv = chat_history_service.get_conversation(conversation_id, user_id)
    messages = [{"role": "system", "content": full_system}]
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


@router.get("/conversations")
async def list_conversations(user_id: str = Query(..., description="Logged-in user id")):
    """List all chat conversations for a user (newest first)."""
    return {"conversations": chat_history_service.list_conversations(user_id or "usr-guest")}


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, user_id: str = Query(...)):
    """Fetch a full conversation history so the user can continue from where they left off."""
    conv = chat_history_service.get_conversation(conversation_id, user_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, user_id: str = Query(...)):
    """Permanently delete a conversation."""
    deleted = chat_history_service.delete_conversation(conversation_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "deleted"}


@router.post("/message")
async def chat_message(
    message: str = Form(""),
    conversation_id: Optional[str] = Form(None),
    user_id: Optional[str] = Form("usr-guest"),
    language: str = Form("english"),
    stream: bool = Form(True),
    images: List[UploadFile] = File([]),
):
    """
    Send a chat message (optionally with up to 4 images from the user's device).

    - If conversation_id is provided, the message continues that conversation.
    - Otherwise a brand-new conversation is created.
    - Language can be: english, hindi, hinglish.
    - Returns a streaming Markdown response (assistant reply) saved to history.
    """
    user_id = (user_id or "usr-guest").strip()
    message = (message or "").strip()

    if not message and not images:
        raise HTTPException(status_code=400, detail="Message or an image is required.")

    # Resolve or create the conversation (self-healing if id expired or not found)
    conv = None
    if conversation_id:
        conv = chat_history_service.get_conversation(conversation_id, user_id)
        if conv and conv.get("language") != language:
            chat_history_service.update_language(conversation_id, language)

    if not conv:
        conv = chat_history_service.create_conversation(user_id, _derive_title(message), language=language)

    # Process uploaded images -> compressed base64 data URLs
    data_urls: List[str] = []
    for f in images[:MAX_IMAGES]:
        data = await f.read()
        if len(data) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=400, detail="Image too large. Maximum allowed size is 6 MB per image.")
        data_urls.append(_image_to_data_url(data, f.content_type or "image/jpeg"))

    # Persist the user message
    chat_history_service.add_message(
        conv["id"], "user", message or "*(Image attached)*", data_urls
    )
    if conv.get("title") in ("New Chat", None) and message:
        chat_history_service.update_title(conv["id"], _derive_title(message))

    ai_messages = _build_ai_messages(conv["id"], user_id, language)

    if stream:
        async def event_generator():
            full = ""
            try:
                async for chunk in ai_provider.stream_chat_completion(ai_messages):
                    full += chunk
                    yield chunk
            except Exception as e:
                logger.error(f"Chat streaming error: {e}")
                fallback = f"*(Temporary AI connection delay. Please try again.)*"
                full += fallback
                yield fallback
            finally:
                if not full.strip():
                    fallback_msg = "Hello! I am Devgya AI, your AI Teaching Assistant. How can I help you today?"
                    full = fallback_msg
                    yield fallback_msg
                chat_history_service.add_message(conv["id"], "assistant", full)
                chat_history_service.touch_conversation(conv["id"])

        response = StreamingResponse(event_generator(), media_type="text/plain")
        response.headers["X-Conversation-Id"] = conv["id"]
        return response

    content = await ai_provider.chat_completion(ai_messages)
    chat_history_service.add_message(conv["id"], "assistant", content)
    chat_history_service.touch_conversation(conv["id"])
    return {"response": content, "conversation_id": conv["id"]}
