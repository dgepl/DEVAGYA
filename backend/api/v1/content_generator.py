from fastapi import APIRouter, HTTPException
from schemas.phase2 import ContentGenRequest
from services.content_service import content_service

router = APIRouter(prefix="/content", tags=["AI Content Generator"])

@router.post("/generate")
async def generate_educational_content(req: ContentGenRequest):
    try:
        data = await content_service.generate_content(req)
        return {"status": "success", "content_type": req.content_type, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
