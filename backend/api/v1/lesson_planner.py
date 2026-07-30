from fastapi import APIRouter, Response, HTTPException
from schemas.phase2 import LessonPlanRequest, LessonPlanItem
from services.lesson_service import lesson_service

router = APIRouter(prefix="/lesson-planner", tags=["AI Lesson Planner"])

@router.post("/generate", response_model=LessonPlanItem)
async def generate_plan(request: LessonPlanRequest):
    try:
        return await lesson_service.generate_lesson_plan(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export-pdf")
async def export_lesson_pdf(plan: LessonPlanItem):
    try:
        pdf_bytes = lesson_service.generate_lesson_plan_pdf(plan)
        filename = f"LessonPlan_{plan.class_name}_{plan.subject}_{plan.chapter}.pdf".replace(" ", "_")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
