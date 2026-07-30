from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from schemas.phase2 import ChatRequest
from services.ai_provider import ai_provider

router = APIRouter(prefix="/chat", tags=["AI Chat Studio"])

@router.post("/message")
async def chat_message(req: ChatRequest):
    messages = [
        {"role": "system", "content": "You are Academix AI, an elite AI Teaching Assistant for Indian Schools. Respond in clear Markdown with formatting, tables, lists, and code blocks where applicable."},
        {"role": "user", "content": req.message}
    ]

    if req.stream:
        async def event_generator():
            async for chunk in ai_provider.stream_chat_completion(messages):
                yield chunk

        return StreamingResponse(event_generator(), media_type="text/plain")
    else:
        content = await ai_provider.chat_completion(messages)
        return {"response": content}
