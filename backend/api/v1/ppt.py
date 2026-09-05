import io
import re
from typing import Optional
from fastapi import APIRouter, HTTPException, Response, Query
from pydantic import BaseModel
from services.ppt_service import (
    ppt_service, GeneratePPTRequest, PresentationData, RefineSlideRequest, SlideItem
)
from services.ppt_history_service import ppt_history_service

router = APIRouter(prefix="/ppt", tags=["Presentation Generator"])

class SavePPTRequest(BaseModel):
    user_id: str
    deck: PresentationData

@router.post("/generate", response_model=PresentationData)
async def generate_presentation_endpoint(request: GeneratePPTRequest):
    """Generate an AI-powered presentation on any study-related topic with teacher guidance."""
    deck = await ppt_service.generate_presentation(request)
    user_identifier = request.user_id or request.user_email
    if user_identifier:
        try:
            saved_id = ppt_history_service.save_deck(user_identifier, deck.dict())
            if saved_id:
                deck.id = saved_id
        except Exception as e:
            pass
    return deck

@router.post("/refine-slide", response_model=SlideItem)
async def refine_slide_endpoint(request: RefineSlideRequest):
    """Refine or polish a single slide with AI based on teacher instructions."""
    return await ppt_service.refine_slide(request)

@router.get("/history")
async def get_ppt_history_endpoint(user_id: str = Query(..., description="User ID or email")):
    """Retrieve user-specific cloud-synced PPT history."""
    decks = ppt_history_service.list_user_decks(user_id)
    return {"decks": decks}

@router.get("/detail/{deck_id}", response_model=PresentationData)
async def get_single_ppt_endpoint(deck_id: str, user_id: str = Query(...)):
    """Fetch full presentation by deck ID ensuring user ownership."""
    deck = ppt_history_service.get_user_deck(deck_id, user_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Presentation deck not found or unauthorized.")
    return deck

@router.post("/save")
async def save_ppt_endpoint(req: SavePPTRequest):
    """Save or update presentation deck in Supabase Cloud."""
    saved_id = ppt_history_service.save_deck(req.user_id, req.deck.dict())
    if not saved_id:
        raise HTTPException(status_code=500, detail="Failed to save presentation to cloud.")
    return {"status": "saved", "deck_id": saved_id}

@router.delete("/detail/{deck_id}")
async def delete_ppt_endpoint(deck_id: str, user_id: str = Query(...)):
    """Permanently delete presentation from Supabase Cloud."""
    deleted = ppt_history_service.delete_user_deck(deck_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Presentation not found or could not be deleted.")
    return {"status": "deleted", "id": deck_id}

@router.get("/search-image")
async def search_image_endpoint(query: str):
    """Search for real educational diagrams/photos matching keyword or topic."""
    img_url = await ppt_service.resolve_real_image(query, query, query)
    return {"query": query, "image_url": img_url}

@router.post("/export-pptx")
async def export_pptx_endpoint(data: PresentationData):
    """Generate and download a real 16:9 Microsoft PowerPoint (.pptx) file."""
    try:
        pptx_bytes = ppt_service.generate_pptx(data)
        safe_title = re.sub(r'[^a-zA-Z0-9_\- ]', '', data.title).strip().replace(" ", "_") or "presentation"
        filename = f"{safe_title}.pptx"
        return Response(
            content=pptx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PowerPoint file: {str(e)}")

@router.post("/export-pdf")
async def export_pdf_endpoint(data: PresentationData):
    """Generate and download a landscape slide deck PDF."""
    try:
        pdf_bytes = ppt_service.generate_pdf(data)
        safe_title = re.sub(r'[^a-zA-Z0-9_\- ]', '', data.title).strip().replace(" ", "_") or "presentation"
        filename = f"{safe_title}_slides.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Presentation PDF: {str(e)}")
