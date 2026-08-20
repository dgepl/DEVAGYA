from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import time
from services.olympiad_service import olympiad_service
from services.paper_service import paper_service

router = APIRouter(prefix="/olympiad", tags=["Teachers Skill Olympiad"])

class ExamSubmissionPayload(BaseModel):
    teacher_email: str
    teacher_name: str
    answers: Dict[str, int]
    tab_switch_count: int = 0
    fullscreen_exits: int = 0
    face_missing_count: int = 0
    webcam_active: bool = True
    proctor_logs: List[str] = []
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

@router.get("/active-paper")
async def get_active_olympiad_paper():
    """Fetch the current published Olympiad paper and its scheduled access window status."""
    papers = paper_service.get_all_papers()
    if not papers:
        return {"status": "none", "paper": None}

    now_str = time.strftime("%Y-%m-%d %H:%M:%S")
    active_paper = papers[0]
    start_t = active_paper.get("start_time", "2000-01-01 00:00:00")
    end_t = active_paper.get("end_time", "2099-12-31 23:59:59")

    is_before = now_str < start_t
    is_after = now_str > end_t
    is_live = not is_before and not is_after

    return {
        "status": "success",
        "is_live": is_live,
        "is_before": is_before,
        "is_after": is_after,
        "current_time": now_str,
        "paper": active_paper
    }

@router.get("/previous-papers")
async def get_previous_olympiad_papers():
    """Fetch archived/ended Olympiad papers from previous assessments."""
    all_papers = paper_service.get_all_papers()
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")
    previous = [p for p in all_papers if p.get("end_time") and p.get("end_time") < now_str]
    
    # If no paper has passed its end_time yet, return all older papers except current one for archive history
    if not previous and len(all_papers) > 1:
        previous = all_papers[1:]

    return {
        "status": "success",
        "count": len(previous),
        "papers": previous
    }
