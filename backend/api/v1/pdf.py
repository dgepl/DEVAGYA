from fastapi import APIRouter, Response, HTTPException
from schemas.question import GeneratedPaperResponse
from services.pdf_service import pdf_generator_service

router = APIRouter(prefix="/pdf", tags=["PDF Engine"])

@router.post("/generate")
async def generate_pdf(paper: GeneratedPaperResponse, include_answers: bool = False):
    try:
        pdf_bytes = pdf_generator_service.generate_question_paper_pdf(paper, include_answers=include_answers)
        filename = f"{paper.subject}_{paper.class_name}_{'AnswerKey' if include_answers else 'QuestionPaper'}.pdf"
        filename = filename.replace(" ", "_")
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
