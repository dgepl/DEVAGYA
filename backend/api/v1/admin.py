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
            "pending_submissions": len([s for s in submissions if s.get("review_status") == "pending_review"]),
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

@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Delete profile from Supabase Cloud."""
    success = await supabase_service.delete_profile(user_id)
    if success:
        return {"status": "success", "message": f"User {user_id} deleted successfully."}
    raise HTTPException(status_code=400, detail="Failed to delete user profile from database.")

# --- OLYMPIAD MANAGEMENT ENDPOINTS ---

@router.get("/olympiad/submissions")
async def get_all_olympiad_submissions():
    """Fetch all teacher Olympiad exam submissions with anti-cheating logs."""
    submissions = olympiad_service.get_all_submissions()
    return {
        "status": "success",
        "count": len(submissions),
        "submissions": submissions
    }

@router.put("/olympiad/submissions/{sub_id}")
async def update_olympiad_submission(sub_id: str, payload: UpdateSubmissionPayload):
    """Admin evaluate, override grade, add feedback, or publish/unpublish result."""
    result = olympiad_service.update_submission_result(sub_id, payload.dict(exclude_unset=True))
    if result.get("status") == "success":
        return result
    raise HTTPException(status_code=400, detail=result.get("message", "Failed to update submission"))

@router.post("/olympiad/publish-all")
async def bulk_publish_olympiad_results(paper_id: Optional[str] = Query(None)):
    """1-Click publish all teacher results for an Olympiad paper."""
    result = olympiad_service.bulk_publish_submissions(paper_id=paper_id)
    if result.get("status") == "success":
        return result
    raise HTTPException(status_code=400, detail=result.get("message", "Failed to bulk publish submissions"))

@router.post("/olympiad/questions")
async def add_olympiad_question(payload: AddQuestionPayload):
    """Add a new question to the Olympiad Question Bank."""
    result = olympiad_service.add_question(payload.dict())
    if result.get("status") == "success":
        return result
    raise HTTPException(status_code=400, detail=result.get("message", "Failed to add question"))

# --- SUPER ADMIN PAPER MAKER STUDIO ENDPOINTS ---

@router.get("/papers")
async def get_admin_papers():
    """Fetch all question papers in Super Admin Paper Repository."""
    papers = paper_service.get_all_papers()
    return {
        "status": "success",
        "count": len(papers),
        "papers": papers
    }

@router.get("/papers/{paper_id}")
async def get_paper_detail(paper_id: str):
    """Fetch a single question paper by ID."""
    paper = paper_service.get_paper_by_id(paper_id)
    if paper:
        return {"status": "success", "paper": paper}
    raise HTTPException(status_code=404, detail="Question paper not found")

@router.post("/papers/manual")
async def create_paper_manual(payload: ManualPaperPayload):
    """Manually construct and save a complete question paper."""
    result = paper_service.create_paper_manual(payload.dict())
    if result.get("status") == "success":
        return result
    raise HTTPException(status_code=400, detail=result.get("message", "Failed to create paper"))

@router.post("/papers/ai-generate")
async def generate_paper_from_prompt(payload: AIPaperPromptPayload):
    """Generate full structured question paper from AI text prompt."""
    result = await paper_service.generate_paper_from_prompt(
        prompt_text=payload.prompt_text,
        title=payload.title or "AI Generated MCQ Question Paper",
        class_name=payload.class_name or "Class 10",
        subject=payload.subject or "Science",
        board=payload.board or "CBSE",
        difficulty=payload.difficulty or "medium",
        total_marks=payload.total_marks or 20,
        time_allowed_mins=payload.time_allowed_mins or 30,
        start_time=payload.start_time,
        end_time=payload.end_time,
        school_name=payload.school_name or "DEVGYA GLOBAL EDUTECH"
    )
    if result.get("status") == "success":
        return result
    raise HTTPException(status_code=400, detail=result.get("message", "AI paper generation failed"))

@router.put("/papers/{paper_id}")
async def update_paper(paper_id: str, updates: Dict[str, Any]):
    """Update paper details or question structure."""
    result = paper_service.update_paper(paper_id, updates)
    if result.get("status") == "success":
        return result
    raise HTTPException(status_code=400, detail=result.get("message", "Failed to update paper"))

@router.delete("/papers/{paper_id}")
async def delete_paper(paper_id: str):
    """Delete paper from repository."""
    result = paper_service.delete_paper(paper_id)
    if result.get("status") == "success":
        return result
    raise HTTPException(status_code=400, detail=result.get("message", "Failed to delete paper"))
