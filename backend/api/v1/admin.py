import os
import json
import time
import uuid
import logging
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, Query, Body, Header, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from services.supabase_service import supabase_service
from services.olympiad_service import olympiad_service
from services.paper_service import paper_service
from services.activity_service import activity_service

logger = logging.getLogger("admin_api")

ADMIN_DATA_DIR = Path(__file__).parent.parent.parent / "data"
ADMIN_DATA_DIR.mkdir(parents=True, exist_ok=True)
ADMIN_SESSION_FILE = ADMIN_DATA_DIR / "admin_session.json"

class AdminSessionManager:
    """Manages single-device session enforcement. When an admin logs in, all previous sessions on any device are revoked."""
    def __init__(self):
        self.current_token: Optional[str] = None
        self.username: str = "admin"
        self.logged_in_at: Optional[str] = None
        self.device_info: Optional[str] = None
        self._load()

    def _load(self):
        if ADMIN_SESSION_FILE.exists():
            try:
                with open(ADMIN_SESSION_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.current_token = data.get("current_token")
                    self.username = data.get("username", "admin")
                    self.logged_in_at = data.get("logged_in_at")
                    self.device_info = data.get("device_info", "")
            except Exception as e:
                logger.warning(f"Error loading admin session: {e}")

    def _save(self):
        try:
            with open(ADMIN_SESSION_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "current_token": self.current_token,
                    "username": self.username,
                    "logged_in_at": self.logged_in_at,
                    "device_info": self.device_info
                }, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to persist admin session: {e}")

    def create_session(self, username: str = "admin", device_info: str = "") -> str:
        new_token = f"devgya_adm_{int(time.time())}_{uuid.uuid4().hex}"
        self.current_token = new_token
        self.username = username
        self.logged_in_at = datetime.utcnow().isoformat()
        self.device_info = device_info
        self._save()
        logger.info(f"Created active admin session: {new_token[:16]}... Previous sessions revoked.")
        return new_token

    def verify_session(self, token: Optional[str]) -> bool:
        if not token or not self.current_token:
            return False
        return token.strip() == self.current_token.strip()

    def invalidate_session(self):
        self.current_token = None
        self._save()
        logger.info("Admin session invalidated.")

    def get_session_info(self) -> Dict[str, Any]:
        return {
            "active": bool(self.current_token),
            "logged_in_at": self.logged_in_at,
            "device_info": self.device_info
        }

admin_session_manager = AdminSessionManager()

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
async def admin_login(payload: AdminLoginPayload, request: Request):
    """Authenticate Admin user with credentials admin / admin123. Invalidates any other admin sessions on other devices."""
    if payload.username.strip() == "admin" and payload.password.strip() == "admin123":
        ua = request.headers.get("user-agent", "")
        session_token = admin_session_manager.create_session(username="admin", device_info=ua)
        return {
            "status": "success",
            "message": "Super Admin access granted. Any previous active session on another device has been logged out.",
            "token": session_token,
            "session_id": session_token
        }
    raise HTTPException(status_code=401, detail="Invalid Super Admin credentials. Use username: admin, password: admin123")

@router.get("/session-verify")
async def verify_admin_session(
    x_admin_token: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """Checks whether the admin session token is still active and valid. Returns 401 SESSION_REVOKED if another device logged in."""
    token = x_admin_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="MISSING_TOKEN",
            headers={"X-Admin-Session": "missing"}
        )

    if not admin_session_manager.verify_session(token):
        raise HTTPException(
            status_code=401,
            detail="SESSION_REVOKED",
            headers={"X-Admin-Session": "revoked"}
        )

    return {
        "status": "active",
        "valid": True,
        "message": "Admin session active",
        "session_info": admin_session_manager.get_session_info()
    }

@router.post("/logout")
async def admin_logout():
    """Explicitly terminates the current admin session."""
    admin_session_manager.invalidate_session()
    return {"status": "success", "message": "Admin session logged out successfully."}

@router.get("/stats")
async def get_admin_dashboard_stats():
    profiles = await supabase_service.get_all_profiles()
    submissions = olympiad_service.get_all_submissions()
    papers = paper_service.get_all_papers()
    
    from services.recruitment_service import recruitment_service
    all_schools = recruitment_service.get_all_schools()
    pending_schools = [s for s in all_schools if s.get("verification_status") == "pending_verification"]
    
    total_users = len(profiles)
    teachers_count = len([p for p in profiles if p.get("role") == "teacher"])
    students_count = len([p for p in profiles if p.get("role") == "student"])
    parents_count = len([p for p in profiles if p.get("role") == "parent"])
    schools_count = len(all_schools)

    return {
        "metrics": {
            "total_users": total_users,
            "teachers_count": teachers_count,
            "students_count": students_count,
            "parents_count": parents_count,
            "schools_count": schools_count,
            "pending_schools_count": len(pending_schools),
            "total_submissions": len(submissions),
            "total_papers": len(papers),
            "pending_submissions": len([s for s in submissions if s.get("review_status") == "pending_admin_review"]),
            "published_submissions": len([s for s in submissions if s.get("published") is True]),
            "active_board_subscriptions": {"CBSE": 28, "ICSE": 10, "STATE": 4}
        },
        "profiles": profiles,
        "submissions": submissions,
        "papers": papers,
        "schools": all_schools
    }

@router.get("/users")
async def get_all_users():
    """Fetch real user profiles from Supabase Cloud enriched with today's live activity tracking and parent-child relations."""
    from services.student_parent_service import student_parent_service
    profiles = await supabase_service.get_all_profiles()
    today_summary = activity_service.get_today_active_users_summary()
    
    for p in profiles:
        email = (p.get("email") or "").strip().lower()
        act = today_summary.get(email)
        if act:
            p["is_active_today"] = True
            p["last_active_today"] = act.get("last_active")
            p["last_active_display"] = act.get("last_active_display")
            p["features_used_today"] = act.get("features_used", [])
            p["features_summary"] = act.get("features_summary", [])
            p["actions_today_count"] = act.get("actions_count", 0)
            p["total_feature_uses"] = act.get("total_feature_uses", 0)
        else:
            p["is_active_today"] = False
            p["last_active_today"] = None
            p["last_active_display"] = None
            p["features_used_today"] = []
            p["features_summary"] = []
            p["actions_today_count"] = 0
            p["total_feature_uses"] = 0

        # Attach enrolled children if user is parent (or has children accounts)
        try:
            children = await student_parent_service.get_parent_children(email)
            for ch in children:
                u_name = ch.get("username")
                if u_name:
                    q_list = await student_parent_service.get_child_quizzes(u_name)
                    n_list = await student_parent_service.get_child_notes(u_name)
                    ch["quizzes_count"] = len(q_list)
                    ch["notes_count"] = len(n_list)
                    if q_list:
                        ch["latest_quiz"] = q_list[0]
                        avg_pct = round(sum(q.get("percentage", 0) for q in q_list) / len(q_list))
                        ch["avg_score_pct"] = avg_pct
                    else:
                        ch["latest_quiz"] = None
                        ch["avg_score_pct"] = None
            p["children"] = children
            p["children_count"] = len(children)
        except Exception:
            p["children"] = []
            p["children_count"] = 0

    return {
        "status": "success",
        "count": len(profiles),
        "active_today_count": sum(1 for p in profiles if p.get("is_active_today")),
        "users": profiles
    }

@router.delete("/users/{user_id:path}")
async def delete_user(user_id: str):
    """Permanently delete a user profile from Supabase Cloud and local caches."""
    from urllib.parse import unquote
    clean_id = unquote(user_id).strip()
    success = await supabase_service.delete_profile(clean_id)
    return {
        "status": "success" if success else "error",
        "message": "User deleted successfully" if success else "Failed to delete user profile"
    }

@router.get("/users/{email}/activity")
async def get_user_activity(email: str, limit: int = Query(50)):
    """Fetch detailed chronological event activity timeline and numerical feature usage counts for a specific user or student."""
    from services.student_parent_service import student_parent_service
    res = activity_service.get_user_timeline(email, limit=limit)
    if isinstance(res, dict):
        timeline = list(res.get("timeline", []))
        features_summary = list(res.get("features_summary", []))
        total_feature_uses = res.get("total_feature_uses", len(timeline))
    else:
        timeline = list(res)
        features_summary = []
        total_feature_uses = len(timeline)

    # Check if student username or has quizzes/notes
    clean_id = (email or "").strip().lower()
    try:
        quizzes = await student_parent_service.get_child_quizzes(clean_id)
        existing_q_ids = {item.get("id") for item in timeline}
        for q in quizzes:
            q_eid = f"quiz_{q.get('id', '')}"
            if q_eid not in existing_q_ids:
                timeline.append({
                    "id": q_eid,
                    "email": clean_id,
                    "name": clean_id,
                    "role": "student",
                    "action": "complete_quiz",
                    "feature_id": "practice-quiz",
                    "feature_name": "Practice & Quizzes",
                    "path": "/dashboard/student/practice",
                    "details": {
                        "quiz_title": q.get("quiz_title"),
                        "subject": q.get("subject"),
                        "score": f"{q.get('score', 0)}/{q.get('total', 0)} ({q.get('percentage', 0)}%)",
                        "percentage": q.get("percentage")
                    },
                    "timestamp": q.get("timestamp") or "",
                    "time_display": q.get("timestamp", "")[-8:] if q.get("timestamp") else "Recent",
                    "date": q.get("timestamp", "")[:10] if q.get("timestamp") else "Today"
                })

        notes = await student_parent_service.get_child_notes(clean_id)
        for n in notes:
            n_eid = f"note_{n.get('id', '')}"
            if n_eid not in existing_q_ids:
                timeline.append({
                    "id": n_eid,
                    "email": clean_id,
                    "name": clean_id,
                    "role": "student",
                    "action": "create_note",
                    "feature_id": "notion-smart-notes",
                    "feature_name": "Notion Smart Notes",
                    "path": "/dashboard/student/notes",
                    "details": {
                        "title": n.get("title"),
                        "subject": n.get("subject")
                    },
                    "timestamp": n.get("updated_at") or "",
                    "time_display": "Recent",
                    "date": n.get("updated_at", "")[:10] if n.get("updated_at") else "Today"
                })

        # Re-sort newest first
        timeline = sorted(timeline, key=lambda x: x.get("timestamp", ""), reverse=True)
        total_feature_uses = len(timeline)
    except Exception as e:
        logger.warning(f"Notice: Student activity enrichment: {e}")

    return {
        "status": "success",
        "email": email,
        "count": len(timeline),
        "timeline": timeline,
        "features_summary": features_summary,
        "total_feature_uses": total_feature_uses
    }

@router.get("/analytics/detailed")
async def get_admin_detailed_analytics():
    """Fetch detailed real-time platform analytics."""
    analytics = activity_service.get_detailed_site_analytics()
    return {
        "status": "success",
        "analytics": analytics
    }

# --- SUPER ADMIN SCHOOL VERIFICATION ENDPOINTS ---

@router.get("/schools")
async def get_admin_schools(status: Optional[str] = Query(None)):
    """Fetch registered schools with filter by status (pending_verification, verified, rejected)."""
    from services.recruitment_service import recruitment_service
    schools = recruitment_service.get_all_schools(status=status)
    return {
        "status": "success",
        "count": len(schools),
        "schools": schools
    }

class VerifySchoolPayload(BaseModel):
    notes: Optional[str] = ""

@router.post("/schools/{school_id}/verify")
async def verify_school_dashboard(school_id: str, payload: Optional[VerifySchoolPayload] = None):
    """Approve school verification and unlock their dashboard."""
    from services.recruitment_service import recruitment_service
    try:
        notes = payload.notes if payload else ""
        school = recruitment_service.update_school_verification(school_id, status="verified", notes=notes)
        return {
            "status": "success",
            "message": f"School '{school.get('school_name')}' verified successfully! Dashboard is now unlocked.",
            "school": school
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/schools/{school_id}/reject")
async def reject_school_dashboard(school_id: str, payload: Optional[VerifySchoolPayload] = None):
    """Reject or suspend a school."""
    from services.recruitment_service import recruitment_service
    try:
        notes = payload.notes if payload else ""
        school = recruitment_service.update_school_verification(school_id, status="rejected", notes=notes)
        return {
            "status": "success",
            "message": f"School '{school.get('school_name')}' verification has been rejected.",
            "school": school
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

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

# --- PLATFORM & AI TOOLS CONFIGURATION MANAGEMENT ---
import os
import json
import threading
import httpx

TOOLS_STORE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "platform_tools_config.json")
INQUIRIES_STORE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "inquiries.json")

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://amlvyskjrencrolnppgs.supabase.co").strip().rstrip("/")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

supabase_headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def _load_tools_store() -> List[Dict[str, Any]]:
    # 1. Try Supabase Cloud first
    if SERVICE_KEY and SUPABASE_URL:
        try:
            with httpx.Client(timeout=5.0) as client:
                res = client.get(
                    f"{SUPABASE_URL}/rest/v1/ai_conversations?session_title=eq.DEVGYA_PLATFORM_CONFIG&select=chat_history&limit=1",
                    headers=supabase_headers
                )
                if res.status_code == 200 and res.json():
                    ch = res.json()[0].get("chat_history")
                    if isinstance(ch, dict) and isinstance(ch.get("tools"), list):
                        tools_data = ch["tools"]
                        os.makedirs(os.path.dirname(TOOLS_STORE_PATH), exist_ok=True)
                        with open(TOOLS_STORE_PATH, "w", encoding="utf-8") as f:
                            json.dump(tools_data, f, indent=2, ensure_ascii=False)
                        return tools_data
        except Exception:
            pass

    # 2. Fallback to local cache
    if not os.path.exists(TOOLS_STORE_PATH):
        return []
    try:
        with open(TOOLS_STORE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _sync_tools_to_cloud(tools_data: List[Dict[str, Any]]):
    if not SERVICE_KEY or not SUPABASE_URL:
        return
    try:
        with httpx.Client(timeout=8.0) as client:
            client.post(
                f"{SUPABASE_URL}/rest/v1/ai_conversations",
                headers=supabase_headers,
                json={
                    "session_title": "DEVGYA_PLATFORM_CONFIG",
                    "chat_history": {"tools": tools_data}
                }
            )
    except Exception as e:
        logger.warning(f"Cloud tools sync notice: {e}")

def _save_tools_store(tools_data: List[Dict[str, Any]]):
    os.makedirs(os.path.dirname(TOOLS_STORE_PATH), exist_ok=True)
    with open(TOOLS_STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(tools_data, f, indent=2, ensure_ascii=False)
    threading.Thread(target=_sync_tools_to_cloud, args=(tools_data,), daemon=True).start()

class ToolsUpdatePayload(BaseModel):
    tools: List[Dict[str, Any]]

@router.get("/tools")
async def get_all_platform_tools():
    """Get all platform tool configurations, custom titles, greetings, and permission enabled/disabled flags."""
    tools = _load_tools_store()
    cleaned = []
    for t in tools:
        t_copy = dict(t)
        if "is_coming_soon" in t_copy:
            del t_copy["is_coming_soon"]
        if "is_enabled" not in t_copy:
            t_copy["is_enabled"] = True
        cleaned.append(t_copy)
    return {
        "status": "success",
        "count": len(cleaned),
        "tools": cleaned
    }

@router.put("/tools")
async def update_all_platform_tools(payload: ToolsUpdatePayload):
    """Admin update for platform tools permission and configuration with instant persistence."""
    try:
        cleaned = []
        for t in payload.tools:
            t_copy = dict(t)
            if "is_coming_soon" in t_copy:
                del t_copy["is_coming_soon"]
            if "is_enabled" not in t_copy:
                t_copy["is_enabled"] = True
            cleaned.append(t_copy)
        _save_tools_store(cleaned)
        return {
            "status": "success",
            "message": "Platform tools configuration updated successfully",
            "count": len(cleaned)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to persist tool configurations: {str(e)}")

# --- CONTACT US INQUIRY PIPELINE ---
def _load_inquiries() -> List[Dict[str, Any]]:
    # 1. Fetch from Supabase Cloud
    cloud_inquiries = []
    if SERVICE_KEY and SUPABASE_URL:
        try:
            with httpx.Client(timeout=6.0) as client:
                res = client.get(
                    f"{SUPABASE_URL}/rest/v1/ai_conversations?session_title=like.DEVGYA_INQUIRY:*&select=chat_history&order=created_at.desc&limit=500",
                    headers=supabase_headers
                )
                if res.status_code == 200:
                    rows = res.json()
                    for r in rows:
                        inq = r.get("chat_history")
                        if isinstance(inq, dict) and inq.get("id"):
                            cloud_inquiries.append(inq)
        except Exception:
            pass

    # 2. Local store
    local_inquiries = []
    if os.path.exists(INQUIRIES_STORE_PATH):
        try:
            with open(INQUIRIES_STORE_PATH, "r", encoding="utf-8") as f:
                local_inquiries = json.load(f)
        except Exception:
            local_inquiries = []

    seen_ids = set()
    merged = []
    for item in cloud_inquiries + local_inquiries:
        inq_id = item.get("id")
        if inq_id and inq_id not in seen_ids:
            seen_ids.add(inq_id)
            merged.append(item)

    if merged and not local_inquiries:
        os.makedirs(os.path.dirname(INQUIRIES_STORE_PATH), exist_ok=True)
        with open(INQUIRIES_STORE_PATH, "w", encoding="utf-8") as f:
            json.dump(merged, f, indent=2, ensure_ascii=False)

    return merged

def _save_inquiries(inquiries_data: List[Dict[str, Any]]):
    os.makedirs(os.path.dirname(INQUIRIES_STORE_PATH), exist_ok=True)
    with open(INQUIRIES_STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(inquiries_data, f, indent=2, ensure_ascii=False)

def _sync_inquiry_to_cloud(inquiry: Dict[str, Any]):
    if not SERVICE_KEY or not SUPABASE_URL:
        return
    try:
        inq_id = inquiry.get("id") or f"inq_{int(time.time())}"
        with httpx.Client(timeout=8.0) as client:
            client.post(
                f"{SUPABASE_URL}/rest/v1/ai_conversations",
                headers=supabase_headers,
                json={
                    "session_title": f"DEVGYA_INQUIRY:{inq_id}",
                    "chat_history": inquiry
                }
            )
    except Exception as e:
        logger.warning(f"Cloud inquiry sync notice: {e}")

class ContactInquiryPayload(BaseModel):
    name: str
    email: str
    phone: str
    role: Optional[str] = "Educator"
    subject: Optional[str] = "General Inquiry"
    message: str

@router.post("/contact/inquiry")
async def submit_contact_inquiry(payload: ContactInquiryPayload):
    """Public endpoint for submitting an inquiry via the Contact Us form."""
    if not payload.name.strip() or not payload.email.strip() or not payload.phone.strip():
        raise HTTPException(status_code=400, detail="Name, Email, and Mobile Number are required.")
    
    inquiries = _load_inquiries()
    new_inquiry = {
        "id": f"inq_{int(time.time())}_{uuid.uuid4().hex[:6]}",
        "name": payload.name.strip(),
        "email": payload.email.strip(),
        "phone": payload.phone.strip(),
        "role": payload.role or "Educator",
        "subject": payload.subject or "General Inquiry",
        "message": payload.message.strip(),
        "status": "new",
        "created_at": datetime.utcnow().isoformat()
    }
    inquiries.insert(0, new_inquiry)
    _save_inquiries(inquiries)
    threading.Thread(target=_sync_inquiry_to_cloud, args=(new_inquiry,), daemon=True).start()

    # Track activity for analytics
    try:
        activity_service.record_activity(
            user_id="anonymous",
            user_email=payload.email.strip(),
            user_name=payload.name.strip(),
            user_role=payload.role or "visitor",
            action="contact_inquiry_submitted",
            feature_id="contact-page",
            feature_name="Contact Us Inquiry Form",
            path="/contact"
        )
    except Exception:
        pass

    return {
        "status": "success",
        "message": "Inquiry submitted successfully! Our team will contact you shortly.",
        "inquiry": new_inquiry
    }

@router.get("/inquiries")
async def get_all_inquiries():
    """Admin endpoint to fetch all contact form inquiries."""
    inquiries = _load_inquiries()
    return {
        "status": "success",
        "count": len(inquiries),
        "inquiries": inquiries
    }

@router.delete("/inquiries/{inquiry_id}")
async def delete_inquiry(inquiry_id: str):
    """Admin endpoint to delete/archive an inquiry."""
    inquiries = _load_inquiries()
    initial_count = len(inquiries)
    updated = [inq for inq in inquiries if inq.get("id") != inquiry_id]
    if len(updated) == initial_count:
        raise HTTPException(status_code=404, detail="Inquiry not found.")
    _save_inquiries(updated)
    return {
        "status": "success",
        "message": "Inquiry deleted successfully",
        "deleted_id": inquiry_id
    }

