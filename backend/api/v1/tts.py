from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from services.tts_service import tts_service, DEFAULT_VOICE

router = APIRouter(prefix="/tts", tags=["Text-to-Speech Engine"])

class SpeakRequest(BaseModel):
    text: str
    voice: Optional[str] = DEFAULT_VOICE
    rate: Optional[str] = "+0%"

@router.get("/voices")
async def list_voices():
    """List available authentic Indian English and Hindi neural voices."""
    return {
        "status": "success",
        "default_voice": DEFAULT_VOICE,
        "voices": tts_service.get_available_voices()
    }

@router.get("/speak")
async def speak_get(
    text: str = Query(..., description="Text content to speak"),
    voice: str = Query(DEFAULT_VOICE, description="Voice ID e.g. en-IN-NeerjaNeural or hi-IN-SwaraNeural"),
    rate: str = Query("+0%", description="Speech speed adjustment e.g. -5%, +0%, +5%")
):
    """Stream low-latency natural Indian accent audio via GET request."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text parameter cannot be empty.")

    try:
        audio_stream = tts_service.generate_speech_stream(text, voice=voice, rate=rate)
        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=3600",
                "Accept-Ranges": "bytes"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")

@router.post("/speak")
async def speak_post(payload: SpeakRequest):
    """Stream low-latency natural Indian accent audio via POST request for larger text."""
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    try:
        audio_stream = tts_service.generate_speech_stream(
            payload.text,
            voice=payload.voice or DEFAULT_VOICE,
            rate=payload.rate or "+0%"
        )
        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=3600",
                "Accept-Ranges": "bytes"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")
