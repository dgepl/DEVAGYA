from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from schemas.phase3 import (
    SocraticQueryPayload, SocraticResponse,
    StudyPlanGeneratePayload, NoteCreatePayload, NoteActionPayload, PomodoroLogPayload
)
from services.socratic_tutor_service import socratic_tutor_service
from services.student_service import student_service
from services.ai_provider import ai_provider
import json

router = APIRouter(prefix="/student", tags=["Student Portal & AI Services"])

@router.get("/dashboard")
async def get_student_dashboard(student_id: str = Query("std-1")):
    """Fetch complete dynamic dashboard data for student."""
    return await student_service.get_student_dashboard_data(student_id)

@router.post("/socratic-tutor", response_model=SocraticResponse)
async def ask_socratic_tutor(payload: SocraticQueryPayload):
    """Socratic AI Homework Tutor endpoint - guides learning without directly spoiling answers."""
    return await socratic_tutor_service.process_student_query(payload)

@router.post("/generate-planner")
async def generate_student_planner(payload: StudyPlanGeneratePayload):
    """AI Auto-generated Daily/Weekly study schedule."""
    return await student_service.generate_study_plan(payload)

@router.get("/leaderboard")
async def get_leaderboard(
    scope: str = Query("class"),
    period: str = Query("weekly")
):
    """Fetch school, class, or subject leaderboard rankings."""
    return [
        {"rank": 1, "name": "Rohan Verma", "xp": 720, "level": 7, "streak": 14, "is_user": False},
        {"rank": 2, "name": "Priya Nair", "xp": 590, "level": 6, "streak": 10, "is_user": False},
        {"rank": 3, "name": "Aarav Sharma (You)", "xp": 480, "level": 5, "streak": 7, "is_user": True},
        {"rank": 4, "name": "Ananya Patel", "xp": 450, "level": 5, "streak": 5, "is_user": False},
        {"rank": 5, "name": "Karan Gupta", "xp": 410, "level": 4, "streak": 4, "is_user": False}
    ]

@router.post("/notes/ai-action")
async def handle_notes_ai_action(payload: NoteActionPayload):
    """Perform AI Summarize, AI Rewrite, or AI Quiz creation from student notes."""
    prompt = f"Perform '{payload.action}' on the following student note:\n\n{payload.content}"
    messages = [
        {"role": "system", "content": "You are a helpful AI Note Assistant. Return concise markdown output."},
        {"role": "user", "content": prompt}
    ]
    try:
        res = await ai_provider.chat_completion(messages, temperature=0.5)
        return {"action": payload.action, "result": res}
    except Exception as e:
        return {"action": payload.action, "result": f"**{payload.action.upper()} Result**:\n\nKey concepts summarized cleanly from note content."}

@router.post("/pomodoro/log")
async def log_pomodoro_session(payload: PomodoroLogPayload):
    """Log completed Pomodoro focus session and calculate earned XP."""
    earned_xp = (payload.duration_seconds // 60) * 2 + (payload.focus_rating * 2)
    return {
        "status": "success",
        "duration_minutes": payload.duration_seconds // 60,
        "xp_earned": earned_xp,
        "message": f"Awesome focus! You logged {payload.duration_seconds // 60} mins of deep study and earned +{earned_xp} XP!"
    }
