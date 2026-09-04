import io
import re
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from services.ppt_service import (
    ppt_service, GeneratePPTRequest, PresentationData, RefineSlideRequest, SlideItem
)

router = APIRouter(prefix="/ppt", tags=["Presentation Generator"])

@router.post("/generate", response_model=PresentationData)
async def generate_presentation_endpoint(request: GeneratePPTRequest):
    """Generate an AI-powered presentation on any study-related topic with teacher guidance."""
    return await ppt_service.generate_presentation(request)

@router.post("/refine-slide", response_model=SlideItem)
async def refine_slide_endpoint(request: RefineSlideRequest):
    """Refine or polish a single slide with AI based on teacher instructions."""
    return await ppt_service.refine_slide(request)

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
