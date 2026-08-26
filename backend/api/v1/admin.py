from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from services.supabase_service import supabase_service
from services.olympiad_service import olympiad_service
from services.paper_service import paper_service

router = APIRouter(prefix="/admin", tags=["Super Admin"])

class AdminLoginPayload(BaseModel):
    username: str
    password: str

class UpdateSubmissionPayload(BaseModel):
    score_percentage: Optional[float] = None
    official_feedback: Optional[str] = None
    published: Optional[bool] = None
    review_status: Optional[str] = None

class AddQuestionPayload(BaseModel):
    subject: str
    level: str
    scenario_type: str
    difficulty_score: float
    question_text: str
    options: List[str]
    correct_answer: int
    explanation: str
    tags: List[str] = []

class AIPaperPromptPayload(BaseModel):
    prompt_text: str
    title: Optional[str] = "AI Generated MCQ Question Paper"
    class_name: Optional[str] = "Class 10"
    subject: Optional[str] = "Science"
    board: Optional[str] = "CBSE"
    difficulty: Optional[str] = "medium"
    total_marks: Optional[int] = 20
    time_allowed_mins: Optional[int] = 30
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    school_name: Optional[str] = "DEVGYA GLOBAL EDUTECH"

class ManualPaperPayload(BaseModel):
    title: str
    class_name: str
    subject: str
    board: str
    chapter: Optional[str] = "Full Syllabus"
    difficulty: Optional[str] = "medium"
    total_marks: int = 20
    time_allowed_mins: int = 30
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    school_name: Optional[str] = "DEVGYA GLOBAL ACADEMY"
    instructions: List[str] = []
    questions: List[Dict[str, Any]] = []

class Generate100TSOPayload(BaseModel):
    subject: str = "Science"
    class_name: str = "Secondary (Classes 9–10)"
    title: Optional[str] = None
    difficulty: Optional[str] = "medium"
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    school_name: Optional[str] = "DEVGYA GLOBAL EDUTECH"

class UpdateQuestionPayload(BaseModel):
    question_text: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[int] = None
    explanation: Optional[str] = None
    module: Optional[str] = None
    section: Optional[str] = None

class UpdateSchedulePayload(BaseModel):
    title: Optional[str] = None
    start_time: str
    end_time: str
    published: bool = True

@router.post("/login")
async def admin_login(payload: AdminLoginPayload):
    """Authenticate Admin user with credentials admin / admin123."""
    if payload.username.strip() == "admin" and payload.password.strip() == "admin123":
        return {
            "status": "success",
            "message": "Super Admin access granted",
            "token": "devgya-super-admin-auth-token-9999"
        }
    raise HTTPException(status_code=401, detail="Invalid Super Admin credentials. Use username: admin, password: admin123")

@router.get("/stats")
async def get_admin_dashboard_stats():
    profiles = await supabase_service.get_all_profiles()
    submissions = olympiad_service.get_all_submissions()
    papers = paper_service.get_all_papers()
    
    total_users = len(profiles)
    teachers_count = len([p for p in profiles if p.get("role") == "teacher"])
    students_count = len([p for p in profiles if p.get("role") == "student"])
    parents_count = len([p for p in profiles if p.get("role") == "parent"])

    return {
        "metrics": {
            "total_users": total_users,
            "teachers_count": teachers_count,
            "students_count": students_count,
            "parents_count": parents_count,
            "total_submissions": len(submissions),
            "total_papers": len(papers),
            "pending_submissions": len([s for s in submissions if s.get("review_status") == "pending_admin_review"]),
            "published_submissions": len([s for s in submissions if s.get("published") is True]),
            "active_board_subscriptions": {"CBSE": 28, "ICSE": 10, "STATE": 4}
        },
        "profiles": profiles,
        "submissions": submissions,
        "papers": papers
    }

@router.get("/users")
async def get_all_users():
    """Fetch real user profiles from Supabase Cloud."""
    profiles = await supabase_service.get_all_profiles()
    return {
        "status": "success",
        "count": len(profiles),
        "users": profiles
    }

# --- SUPER ADMIN OLYMPIAD SUBMISSION & RESULT DECLARATION ENDPOINTS ---

@router.get("/olympiad/submissions")
async def get_all_olympiad_submissions():
    """Fetch all Olympiad exam submissions across all papers."""
    submissions = olympiad_service.get_all_submissions()
    return {
        "status": "success",
        "count": len(submissions),
        "submissions": submissions
    }

@router.put("/olympiad/submissions/{submission_id}")
async def update_olympiad_submission(submission_id: str, updates: Dict[str, Any] = Body(...)):
    """Declare result / update evaluation score and published status for a single candidate."""
    res = olympiad_service.update_submission_evaluation(submission_id, updates)
    if res.get("status") == "success":
        return res
    raise HTTPException(status_code=400, detail=res.get("message", "Failed to update submission."))

@router.post("/olympiad/publish-all")
async def bulk_publish_olympiad_results(paper_id: Optional[str] = Query(None)):
    """1-Click Declare & Publish results for all candidates to the live public leaderboard."""
    res = olympiad_service.bulk_publish_submissions(paper_id=paper_id)
    if res.get("status") == "success":
        return res
    raise HTTPException(status_code=400, detail=res.get("message", "Failed to bulk publish results."))

@router.delete("/olympiad/submissions/{submission_id}")
async def delete_single_olympiad_submission(submission_id: str):
    """Permanently delete a single candidate submission record."""
    res = olympiad_service.delete_submission(submission_id)
    if res.get("status") == "success":
        return res
    raise HTTPException(status_code=400, detail=res.get("message", "Failed to delete submission."))

@router.delete("/olympiad/submissions")
async def bulk_delete_olympiad_submissions(paper_id: Optional[str] = Query(None)):
    """Permanently delete all candidate submissions or for a specific paper."""
    res = olympiad_service.bulk_delete_submissions(paper_id=paper_id)
    if res.get("status") == "success":
        return res
    raise HTTPException(status_code=400, detail=res.get("message", "Failed to bulk delete submissions."))

# --- TSO 100-MCQ AI GENERATOR & MANAGEMENT ENDPOINTS ---

@router.post("/tso/generate-100-ai")
async def generate_100_tso_paper(payload: Generate100TSOPayload):
    """
    Generate complete 100-MCQ TSO Question Paper with AI adhering to 60/40 Hybrid Structure:
    Part A (60 MCQs): CPD/NEP (20 Qs), Classroom Scenarios (20 Qs), Modern Pedagogy (20 Qs).
    Part B (40 MCQs): Core Subject (20 Qs), Subject Pedagogy & TLM (10 Qs), Misconceptions & HOTS (10 Qs).
    """
    res = await paper_service.generate_100_tso_paper_ai(
        subject=payload.subject,
        class_name=payload.class_name,
        title=payload.title,
        difficulty=payload.difficulty or "medium",
        start_time=payload.start_time,
        end_time=payload.end_time,
        school_name=payload.school_name
    )
    if res.get("status") == "success":
        return res
    raise HTTPException(status_code=400, detail=res.get("message", "TSO AI generation failed"))

@router.put("/tso/papers/{paper_id}/questions/{q_id}")
async def update_tso_question(paper_id: str, q_id: int, payload: UpdateQuestionPayload):
    """Admin can edit question text, options, answer index, or explanation."""
    res = paper_service.update_paper_question(paper_id, q_id, payload.dict(exclude_unset=True))
    if res.get("status") == "success":
        return res
    raise HTTPException(status_code=400, detail=res.get("message", "Question update failed"))

@router.put("/tso/papers/{paper_id}/schedule")
async def update_tso_schedule(paper_id: str, payload: UpdateSchedulePayload):
    """Admin can edit test start date/time, end date/time, title, and published activation."""
    res = paper_service.update_paper_schedule(
        paper_id=paper_id,
        title=payload.title,
        start_time=payload.start_time,
        end_time=payload.end_time,
        published=payload.published
    )
    if res.get("status") == "success":
        return res
    raise HTTPException(status_code=400, detail=res.get("message", "Schedule update failed"))

# --- SUPER ADMIN PAPER MAKER STUDIO ENDPOINTS ---

@router.get("/papers")
async def get_admin_papers():
    papers = paper_service.get_all_papers()
    return {
        "status": "success",
        "count": len(papers),
        "papers": papers
    }

@router.get("/papers/{paper_id}")
async def get_paper_detail(paper_id: str):
    paper = paper_service.get_paper_by_id(paper_id)
    if paper:
        return {"status": "success", "paper": paper}
    raise HTTPException(status_code=404, detail="Question paper not found")

@router.post("/papers/manual")
async def create_paper_manual(payload: ManualPaperPayload):
    result = paper_service.create_paper_manual(payload.dict())
    if result.get("status") == "success":
        return result
    raise HTTPException(status_code=400, detail=result.get("message", "Failed to create paper"))

@router.put("/papers/{paper_id}")
async def update_paper(paper_id: str, updates: Dict[str, Any]):
    result = paper_service.update_paper(paper_id, updates)
    if result.get("status") == "success":
        return result
    raise HTTPException(status_code=400, detail=result.get("message", "Failed to update paper"))

@router.delete("/papers/{paper_id}")
async def delete_paper(paper_id: str):
    result = paper_service.delete_paper(paper_id)
    if result.get("status") == "success":
        return result
    raise HTTPException(status_code=400, detail=result.get("message", "Failed to delete paper"))
