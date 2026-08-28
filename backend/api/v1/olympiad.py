from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import time
from datetime import datetime
from services.olympiad_service import olympiad_service
from services.paper_service import paper_service

router = APIRouter(prefix="/olympiad", tags=["Teacher Skills Olympiad (TSO)"])

class TSORegistrationPayload(BaseModel):
    email: str
    name: str
    phone: Optional[str] = ""
    state: Optional[str] = ""
    district: Optional[str] = ""
    tso_subject: Optional[str] = "Science"
    category_level: Optional[str] = "Secondary"
    medium: Optional[str] = "English"

class Submit100Payload(BaseModel):
    teacher_email: str
    teacher_name: str
    subject: str = "Science"
    state: Optional[str] = ""
    district: Optional[str] = ""
    paper_id: Optional[str] = "tso-national-2026"
    answers: Dict[str, int] = {}
    time_taken_seconds: int = 3600
    proctor_incidents: int = 0

class PracticeEvaluatePayload(BaseModel):
    question_id: str
    selected_option: int
    subject: Optional[str] = "Science"

@router.get("/exam-paper")
async def get_100_exam_paper(
    subject: str = Query("Science"),
    level: str = Query("Secondary")
):
    """
    Fetch the official Super Admin published 100-MCQ TSO Exam Paper.
    Includes Admin scheduled start_time and end_time.
    """
    paper = olympiad_service.get_active_exam_paper(subject=subject, level=level)
    return {
        "status": "success",
        "paper": paper
    }

@router.get("/practice")
async def get_practice_questions(
    subject: str = Query("Science"),
    module: Optional[str] = Query("all")
):
    """
    Fetch 100 dedicated practice mock questions partitioned into Part A and Part B.
    """
    questions = olympiad_service.get_100_practice_questions(subject=subject, module=module)
    return {
        "status": "success",
        "total": len(questions),
        "questions": questions
    }

@router.post("/practice/evaluate")
async def evaluate_practice_answer(payload: PracticeEvaluatePayload):
    """
    Instantly evaluate a candidate's answer in the practice mock hall.
    """
    res = olympiad_service.evaluate_practice_answer(
        question_id=payload.question_id,
        selected_option=payload.selected_option,
        subject=payload.subject or "Science"
    )
    return res

@router.post("/register-tso")
async def register_for_tso(payload: TSORegistrationPayload):
    """Register teacher for Free TSO with subject, level, medium, state, and district."""
    res = olympiad_service.register_tso_candidate(payload.email, payload.dict())
    return res

@router.get("/tso-registration")
async def get_tso_registration_status(email: str = Query(...)):
    """Fetch user's TSO registration details & 15-day trial status."""
    reg = olympiad_service.get_tso_registration(email)
    return {
        "status": "success",
        "registered": bool(reg),
        "details": reg
    }

@router.post("/submit-100")
async def submit_100_exam_paper(payload: Submit100Payload):
    """
    Submit candidate's 100-MCQ assessment responses.
    Responses are safely archived in database for administration evaluation.
    No instant score is returned to candidate.
    """
    res = olympiad_service.submit_100_exam(payload.dict())
    if res.get("status") == "success":
        return res
    raise HTTPException(status_code=400, detail=res.get("message", "Submission failed"))

@router.get("/attempt-status")
async def get_user_attempt_status(
    email: str = Query(...),
    paper_id: Optional[str] = Query(None),
    subject: Optional[str] = Query(None)
):
    """Check if candidate has already submitted the current active 100-MCQ Olympiad assessment."""
    submissions = olympiad_service.get_all_submissions()
    clean = email.strip().lower()
    clean_subj = (subject or "").strip().lower()

    # Match by candidate email and subject/paper_id
    user_sub = None
    for s in submissions:
        s_email = str(s.get("teacher_email") or s.get("email") or s.get("user_email") or "").strip().lower()
        if s_email != clean:
            continue
        
        # Match subject or paper_id if specified
        s_subj = str(s.get("subject") or "").strip().lower()
        s_pid = str(s.get("paper_id") or s.get("id") or "").strip().lower()
        
        if clean_subj and (clean_subj == s_subj or clean_subj in s_subj or s_subj in clean_subj):
            user_sub = s
            break
        if paper_id and (str(paper_id).strip().lower() == s_pid or str(paper_id).strip().lower() in s_pid or s_pid in str(paper_id).strip().lower()):
            user_sub = s
            break
        if not user_sub:
            user_sub = s

    # Mask scores and question evaluations if admin has not declared results
    safe_sub = None
    if user_sub:
        safe_sub = dict(user_sub)
        is_published = safe_sub.get("published") is True or safe_sub.get("review_status") == "published"
        if not is_published:
            safe_sub["published"] = False
            safe_sub["review_status"] = safe_sub.get("review_status", "pending_admin_review")
            safe_sub["question_evaluations"] = None
            safe_sub["score_percentage"] = None
            safe_sub["official_score"] = None
            safe_sub["correct_count"] = None
            safe_sub["wrong_count"] = None
            safe_sub["merit_rank"] = None
            safe_sub["state_rank"] = None
            safe_sub["district_rank"] = None

    return {
        "status": "success",
        "has_attempted": bool(user_sub),
        "submission": safe_sub,
        "active_paper_id": paper_id
    }

@router.get("/results")
@router.get("/results/published")
async def get_published_results(email: Optional[str] = Query(None)):
    """Fetch officially published results and merit rankings (Admin declared)."""
    results = olympiad_service.get_published_results(teacher_email=email)
    return {
        "status": "success",
        "count": len(results),
        "results": results
    }

@router.get("/submissions/{submission_id}")
async def get_submission_detail(submission_id: str):
    """Fetch a single submission record with complete question-by-question evaluations for review."""
    submissions = olympiad_service.get_all_submissions()
    sub = next((s for s in submissions if str(s.get("id")) == str(submission_id)), None)
    if sub:
        return {
            "status": "success",
            "submission": sub
        }
    raise HTTPException(status_code=404, detail="Submission not found")
