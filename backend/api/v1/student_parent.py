from fastapi import APIRouter, HTTPException, Depends, Header, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging
from services.student_parent_service import student_parent_service
from services.jwt_auth_service import get_current_user_optional
from services.activity_service import activity_service

logger = logging.getLogger("student_parent_router")

router = APIRouter(prefix="", tags=["Student & Parent Management"])

# --- SCHEMAS ---

class CreateChildPayload(BaseModel):
    name: str
    username: str
    password: str
    class_name: Optional[str] = "Class 10"
    school_name: Optional[str] = ""
    board: Optional[str] = "CBSE"

class UpdateChildPayload(BaseModel):
    name: Optional[str] = None
    class_name: Optional[str] = None
    school_name: Optional[str] = None
    board: Optional[str] = None
    password: Optional[str] = None

class SaveQuizResultPayload(BaseModel):
    student_username: str
    quiz_title: str
    subject: str
    chapter: Optional[str] = ""
    score: int
    total: int
    percentage: int
    xp_earned: Optional[int] = 0
    feedback: Optional[str] = ""
    breakdown: Optional[List[Dict[str, Any]]] = []

class SaveStudentNotePayload(BaseModel):
    student_username: str
    id: Optional[str] = None
    title: str
    subject: Optional[str] = "General"
    tags: Optional[List[str]] = []
    content: str

# Helper to get parent email from JWT or fallback header
def _resolve_parent_email(
    x_user_email: Optional[str] = Header(None, alias="X-User-Email"),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
) -> str:
    if current_user and current_user.get("email"):
        return current_user["email"].strip().lower()
    if x_user_email and x_user_email.strip():
        return x_user_email.strip().lower()
    return ""

# =========================================================================
# PARENT PORTAL ENDPOINTS
# =========================================================================

@router.get("/parent/children")
async def get_parent_children(
    parent_email: Optional[str] = Query(None),
    resolved_email: str = Depends(_resolve_parent_email)
):
    """Lists all student accounts enrolled by this parent."""
    email = (parent_email or resolved_email).strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Parent email is required.")
    children = await student_parent_service.get_parent_children(email)
    return {"status": "success", "count": len(children), "children": children}

@router.post("/parent/children")
async def add_child(
    payload: CreateChildPayload,
    parent_email: Optional[str] = Query(None),
    resolved_email: str = Depends(_resolve_parent_email)
):
    """Enrolls a new child account under this parent using Username & Password only."""
    email = (parent_email or resolved_email).strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Parent email is required.")
    try:
        new_child = await student_parent_service.create_child_account(email, payload.model_dump())
        return {"status": "success", "message": "Child account created successfully!", "child": new_child}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Failed to create child account: {e}")
        raise HTTPException(status_code=500, detail="Failed to create child account. Please try again.")

@router.put("/parent/children/{username}")
async def update_child(
    username: str,
    payload: UpdateChildPayload,
    parent_email: Optional[str] = Query(None),
    resolved_email: str = Depends(_resolve_parent_email)
):
    """Updates child details or resets child password."""
    email = (parent_email or resolved_email).strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Parent email is required.")
    try:
        updated = await student_parent_service.update_child_account(email, username, payload.model_dump(exclude_unset=True))
        return {"status": "success", "message": "Child details updated successfully!", "child": updated}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Failed to update child: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/parent/children/{username}")
async def remove_child(
    username: str,
    parent_email: Optional[str] = Query(None),
    resolved_email: str = Depends(_resolve_parent_email)
):
    """Removes a child account from the parent portal."""
    email = (parent_email or resolved_email).strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Parent email is required.")
    try:
        await student_parent_service.delete_child_account(email, username)
        return {"status": "success", "message": f"Child account '{username}' removed successfully."}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/parent/children/{username}/quizzes")
async def get_child_quiz_activity(username: str):
    """Retrieves all quizzes attempted by the selected child."""
    quizzes = await student_parent_service.get_child_quizzes(username)
    return {"status": "success", "student_username": username, "count": len(quizzes), "quizzes": quizzes}

@router.get("/parent/children/{username}/notes")
async def get_child_notes_activity(username: str):
    """Retrieves all smart notes created by the selected child."""
    notes = await student_parent_service.get_child_notes(username)
    return {"status": "success", "student_username": username, "count": len(notes), "notes": notes}

# =========================================================================
# STUDENT ACTIONS (QUIZ SUBMISSIONS & NOTE SYNC)
# =========================================================================

@router.post("/student/quiz-result")
async def submit_quiz_result(payload: SaveQuizResultPayload):
    """Persists a completed quiz attempt to Supabase Cloud for student and parent observation."""
    try:
        res = await student_parent_service.record_quiz_result(payload.student_username, payload.model_dump())
        
        # Track into central activity telemetry for admin & parent activity logs
        student_user = (payload.student_username or "").strip().lower()
        if student_user:
            activity_service.record_activity(
                email=f"{student_user}@student.devgya.in",
                name=student_user.capitalize(),
                role="student",
                action="complete_quiz",
                feature_id="practice-quiz",
                feature_name="Practice & Quizzes",
                path="/dashboard/student/practice",
                details={
                    "quiz_title": payload.quiz_title,
                    "subject": payload.subject,
                    "score": f"{payload.score}/{payload.total} ({payload.percentage}%)",
                    "percentage": payload.percentage
                }
            )

        return {"status": "success", "message": "Quiz result recorded successfully!", "quiz": res}
    except Exception as e:
        logger.error(f"Failed to save quiz result: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/quizzes")
async def get_student_quizzes(username: str = Query(...)):
    """Retrieves quiz history for a student."""
    quizzes = await student_parent_service.get_child_quizzes(username)
    return {"status": "success", "quizzes": quizzes}

@router.post("/student/notes")
async def save_student_note(payload: SaveStudentNotePayload):
    """Persists a student smart note to Supabase Cloud."""
    try:
        note = await student_parent_service.save_student_note(payload.student_username, payload.model_dump())
        
        # Track into central activity telemetry for admin & parent activity logs
        student_user = (payload.student_username or "").strip().lower()
        if student_user:
            activity_service.record_activity(
                email=f"{student_user}@student.devgya.in",
                name=student_user.capitalize(),
                role="student",
                action="create_note",
                feature_id="notion-smart-notes",
                feature_name="Notion Smart Notes",
                path="/dashboard/student/notes",
                details={
                    "title": payload.title,
                    "subject": payload.subject
                }
            )

        return {"status": "success", "message": "Smart note saved to cloud!", "note": note}
    except Exception as e:
        logger.error(f"Failed to save student note: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/notes")
async def get_student_notes(username: str = Query(...)):
    """Loads all student smart notes from Supabase Cloud."""
    notes = await student_parent_service.get_child_notes(username)
    return {"status": "success", "notes": notes}

@router.delete("/student/notes/{note_id}")
async def delete_student_note(note_id: str, username: str = Query(...)):
    """Deletes a student smart note from cloud."""
    await student_parent_service.delete_student_note(username, note_id)
    return {"status": "success", "message": "Note deleted from cloud."}
