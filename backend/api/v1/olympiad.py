from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from services.olympiad_service import olympiad_service

router = APIRouter(prefix="/olympiad", tags=["Teachers Skill Olympiad"])

class ExamSubmissionPayload(BaseModel):
    teacher_email: str
    teacher_name: str
    answers: Dict[str, int]
    tab_switch_count: int = 0
    webcam_active: bool = True
    submitted_at: Optional[str] = None

class PracticeEvaluatePayload(BaseModel):
    question_id: str
    selected_option: int

@router.get("/questions")
async def get_olympiad_questions():
    """Fetch proctored Olympiad exam question bank with tags & scenario difficulty."""
    questions = olympiad_service.get_exam_questions()
    return {
        "status": "success",
        "total": len(questions),
        "questions": questions
    }

@router.post("/submit")
async def submit_olympiad_exam(payload: ExamSubmissionPayload):
    """Submit proctored Olympiad exam with anti-cheating log. Results are hidden & held for Admin review."""
    result = olympiad_service.submit_exam(payload.dict())
    if result.get("status") == "success":
        return result
    raise HTTPException(status_code=400, detail=result.get("message", "Exam submission failed"))

@router.get("/practice")
async def get_practice_questions(subject: Optional[str] = Query(None)):
    """Fetch practice questions for Olympiad preparation zone."""
    questions = olympiad_service.get_practice_questions(subject=subject)
    return {
        "status": "success",
        "total": len(questions),
        "questions": questions
    }

@router.post("/practice/evaluate")
async def evaluate_practice(payload: PracticeEvaluatePayload):
    """Evaluate a single practice question with instant feedback & pedagogical explanation."""
    return olympiad_service.evaluate_practice_answer(payload.question_id, payload.selected_option)

@router.get("/results/published")
async def get_published_results(email: Optional[str] = Query(None)):
    """Fetch officially published Olympiad evaluation results."""
    results = olympiad_service.get_published_results(teacher_email=email)
    return {
        "status": "success",
        "count": len(results),
        "results": results
    }
