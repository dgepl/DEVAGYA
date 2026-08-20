from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from services.supabase_service import supabase_service
from services.olympiad_service import olympiad_service

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

class UpdateUserRolePayload(BaseModel):
    role: str

class UpdateUserStatusPayload(BaseModel):
    is_active: bool

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
            "pending_submissions": len([s for s in submissions if s.get("review_status") == "pending_review"]),
            "published_submissions": len([s for s in submissions if s.get("published") is True]),
            "active_board_subscriptions": {"CBSE": 28, "ICSE": 10, "STATE": 4}
        },
        "profiles": profiles,
        "submissions": submissions
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

@router.post("/olympiad/questions")
async def add_olympiad_question(payload: AddQuestionPayload):
    """Add a new question to the Olympiad Question Bank."""
    result = olympiad_service.add_question(payload.dict())
    if result.get("status") == "success":
        return result
    raise HTTPException(status_code=400, detail=result.get("message", "Failed to add question"))
