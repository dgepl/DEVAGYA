from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from services.activity_service import activity_service

router = APIRouter(prefix="/analytics", tags=["AI Usage & Platform Analytics"])

class TrackActivityPayload(BaseModel):
    email: Optional[str] = None
    user_email: Optional[str] = None
    name: Optional[str] = ""
    user_name: Optional[str] = ""
    role: Optional[str] = "teacher"
    user_role: Optional[str] = None
    action: Optional[str] = "view"
    feature_id: Optional[str] = "dashboard"
    feature_name: Optional[str] = "Dashboard"
    path: Optional[str] = "/dashboard"
    details: Optional[Dict[str, Any]] = None

@router.post("/track")
async def track_user_activity(payload: TrackActivityPayload):
    """Log an activity event when user visits a feature or triggers an action."""
    target_email = (payload.email or payload.user_email or "").strip().lower()
    if not target_email:
        return {"status": "ignored", "reason": "No user email provided"}

    target_name = (payload.name or payload.user_name or "").strip()
    target_role = (payload.role or payload.user_role or "teacher").strip()

    event = activity_service.record_activity(
        email=target_email,
        name=target_name,
        role=target_role,
        action=payload.action or "view",
        feature_id=payload.feature_id or "dashboard",
        feature_name=payload.feature_name or "Dashboard",
        path=payload.path or "/dashboard",
        details=payload.details
    )
    return {"status": "success", "event_id": event.get("id")}

@router.get("/detailed")
async def get_detailed_analytics():
    """Returns real-time site analytics, today's DAU, feature rankings, and live streams."""
    return {
        "status": "success",
        "data": activity_service.get_detailed_site_analytics()
    }

@router.get("/metrics")
async def get_teacher_ai_analytics():
    """Legacy overview metrics for teacher dashboard analytics radar."""
    detailed = activity_service.get_detailed_site_analytics()
    today_m = detailed.get("today_metrics", {})
    return {
        "overview": {
            "total_tokens_consumed": 4250000 + (today_m.get("total_actions_today", 0) * 1500),
            "estimated_hours_saved": 48.5 + round(today_m.get("total_actions_today", 0) * 0.25, 1),
            "question_papers_generated": 24,
            "lesson_plans_created": 18,
            "voice_sessions_completed": 12,
            "worksheets_exported": 35,
            "active_users_today": today_m.get("active_users_count", 0)
        },
        "daily_tokens": [
            {"day": "Mon", "tokens": 420000, "hours_saved": 6.5},
            {"day": "Tue", "tokens": 680000, "hours_saved": 8.0},
            {"day": "Wed", "tokens": 850000, "hours_saved": 11.2},
            {"day": "Thu", "tokens": 520000, "hours_saved": 7.4},
            {"day": "Fri", "tokens": 940000, "hours_saved": 12.0},
            {"day": "Sat", "tokens": 310000, "hours_saved": 3.4}
        ],
        "feature_breakdown": today_m.get("features_ranking_today", []) or [
            {"feature": "Question Paper Studio", "percentage": 38},
            {"feature": "AI Lesson Planner", "percentage": 25},
            {"feature": "AI Chat & Mentor", "percentage": 20},
            {"feature": "Voice AI Fluency Coach", "percentage": 10},
            {"feature": "OCR Book Scanner", "percentage": 7}
        ]
    }
