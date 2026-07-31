from fastapi import APIRouter, Query
from typing import Dict, Any
from schemas.phase3 import ParentCoachPayload
from services.parent_service import parent_service

router = APIRouter(prefix="/parent", tags=["Parent Portal & Parenting Coach"])

@router.get("/dashboard")
async def get_parent_dashboard(
    parent_id: str = Query("prt-1"),
    child_id: str = Query("std-1")
):
    """Fetch complete parent overview for linked child."""
    return await parent_service.get_child_overview(parent_id, child_id)

from services.groq_service import groq_service

@router.post("/coach")
async def ask_parenting_coach(payload: ParentCoachPayload):
    """24/7 AI Parenting Coach & Child Psychology Guidance Engine powered by Groq AI."""
    guidance = await groq_service.parenting_coach_guidance(
        query_type=payload.category or "general",
        query_text=payload.query,
        child_age_or_grade="Class 10"
    )
    return {
        "status": "success",
        "category": payload.category,
        "advice": guidance.get("advice", ""),
        "practical_steps": guidance.get("practical_steps", []),
        "communication_script": guidance.get("communication_script", ""),
        "when_to_seek_help": guidance.get("when_to_seek_help", "")
    }

@router.get("/notifications")
async def get_parent_notifications(parent_id: str = Query("prt-1")):
    """Fetch real-time notifications for parent monitoring."""
    return [
        {"id": "n1", "title": "Homework Completed", "message": "Aarav completed Science Worksheet #4 with 95% accuracy.", "time": "2 hours ago", "type": "success"},
        {"id": "n2", "title": "Quiz Mastered!", "message": "Aarav scored 100% on Mathematics Practice Quiz.", "time": "Yesterday", "type": "achievement"},
        {"id": "n3", "title": "Upcoming Exam Reminder", "message": "Mathematics Mid-Term Unit Test is scheduled in 7 days.", "time": "2 days ago", "type": "warning"},
        {"id": "n4", "title": "Weekly Report Ready", "message": "Aarav logged 14.5 study hours this week, exceeding target by 2 hours!", "time": "3 days ago", "type": "info"}
    ]
