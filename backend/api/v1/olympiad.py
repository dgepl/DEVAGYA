from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import time
from datetime import datetime
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

def parse_dt(dt_str: Optional[str]) -> Optional[datetime]:
    if not dt_str:
        return None
    cleaned = str(dt_str).strip().replace("T", " ")
    if len(cleaned) == 16:
        cleaned += ":00"
    try:
        return datetime.strptime(cleaned[:19], "%Y-%m-%d %H:%M:%S")
    except Exception:
        return None

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

    now_dt = datetime.now()
    active_paper = papers[0]
    
    start_dt = parse_dt(active_paper.get("start_time")) or datetime(2000, 1, 1)
    end_dt = parse_dt(active_paper.get("end_time")) or datetime(2099, 12, 31, 23, 59, 59)

    is_before = now_dt < start_dt
    is_after = now_dt > end_dt
    is_live = not is_before and not is_after

    return {
        "status": "success",
        "is_live": is_live,
        "is_before": is_before,
        "is_after": is_after,
        "current_time": now_dt.strftime("%Y-%m-%d %H:%M:%S"),
        "paper": active_paper
    }

@router.get("/previous-papers")
async def get_previous_olympiad_papers():
    """Fetch archived/ended Olympiad papers from previous assessments."""
    all_papers = paper_service.get_all_papers()
    now_dt = datetime.now()
    previous = []
    for p in all_papers:
        end_dt = parse_dt(p.get("end_time"))
        if end_dt and end_dt < now_dt:
            previous.append(p)
    
    if not previous and len(all_papers) > 1:
        previous = all_papers[1:]

    return {
        "status": "success",
        "count": len(previous),
        "papers": previous
    }
