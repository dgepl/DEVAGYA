from fastapi import APIRouter, HTTPException
from schemas.phase2 import VoiceFeedbackRequest, VoiceFeedbackResponse
from services.voice_service import voice_service

router = APIRouter(prefix="/voice", tags=["Voice AI Assistant"])

@router.post("/analyze", response_model=VoiceFeedbackResponse)
async def analyze_speech(req: VoiceFeedbackRequest):
    try:
        return await voice_service.analyze_speech(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
