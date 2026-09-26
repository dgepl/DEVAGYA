import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.english_coach_service import english_coach_service

logger = logging.getLogger("english_coach_api")
router = APIRouter(prefix="/english-coach", tags=["English Speaking Coach"])


# ---------------------------------------------------------------------
# PYDANTIC SCHEMAS
# ---------------------------------------------------------------------
class SpokenAnswerItem(BaseModel):
    question_id: int
    category: str = "General"
    prompt: str = ""
    transcript: str = ""
    duration_seconds: Optional[float] = None


class DiagnosticSubmitRequest(BaseModel):
    user_id: str
    user_role: str = "student"
    answers: List[SpokenAnswerItem] = Field(..., description="List of 10 spoken answer transcripts from learner")


class ActivityCompleteRequest(BaseModel):
    user_id: str
    user_role: str = "student"
    level_number: int
    activity_id: str
    score: int = 100
    mistakes: Optional[List[Dict[str, Any]]] = None


class SpokenCritiqueRequest(BaseModel):
    prompt: str
    user_speech: str
    context: Optional[str] = None
    user_level: Optional[str] = "A2"


class ConversationTurnRequest(BaseModel):
    user_message: str
    conversation_history: Optional[List[Dict[str, str]]] = []
    category: Optional[str] = "Casual"
    user_level: Optional[str] = "B1"


class SessionReportRequest(BaseModel):
    conversation_turns: List[Dict[str, str]]
    category: Optional[str] = "Casual"


class ResetProfileRequest(BaseModel):
    user_id: str
    user_role: str = "student"


# ---------------------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------------------

@router.get("/diagnostic-questions")
async def get_diagnostic_questions():
    """Returns the 10 spoken diagnostic assessment questions."""
    questions = english_coach_service.get_diagnostic_questions_for_client()
    return {"questions": questions, "total": len(questions)}


@router.post("/diagnostic-submit")
async def submit_diagnostic_test(payload: DiagnosticSubmitRequest):
    """
    Submits user's 10 spoken responses for deep AI analysis.
    Computes CEFR Level, skill scores, strengths, weaknesses, and weekly roadmap.
    """
    try:
        answers_dicts = [a.model_dump() for a in payload.answers]
        result = await english_coach_service.evaluate_diagnostic_assessment(
            user_id=payload.user_id,
            user_role=payload.user_role,
            answers=answers_dicts
        )
        return result
    except Exception as e:
        logger.error(f"Error submitting diagnostic test: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/profile")
async def get_coach_profile(user_id: str, user_role: str = "student", user_name: str = "Learner"):
    """Fetches user's current coach profile and progression stats."""
    profile = english_coach_service.get_or_create_profile(user_id=user_id, user_role=user_role, user_name=user_name)
    return {"status": "success", "profile": profile}


@router.get("/state")
async def get_coach_state(user_id: str, user_role: str = "student", user_name: str = "Learner"):
    """Compatibility alias for get_coach_profile."""
    profile = english_coach_service.get_or_create_profile(user_id=user_id, user_role=user_role, user_name=user_name)
    levels = english_coach_service.get_levels_for_user(user_id=user_id, user_role=user_role)
    return {
        "status": "success",
        "profile": profile,
        "track": profile,
        "levels": levels
    }


@router.get("/levels")
async def get_levels(user_id: str, user_role: str = "student"):
    """Returns all 5 levels with personalized lock states and progress percentages."""
    levels = english_coach_service.get_levels_for_user(user_id=user_id, user_role=user_role)
    profile = english_coach_service.get_or_create_profile(user_id=user_id, user_role=user_role)
    return {
        "status": "success",
        "current_level": profile.get("current_level", 1),
        "unlocked_levels": profile.get("unlocked_levels", [1]),
        "levels": levels
    }


@router.post("/complete-activity")
async def complete_activity(payload: ActivityCompleteRequest):
    """Marks an activity complete, awards XP, and unlocks next level if 80%+ and capstone passed."""
    try:
        result = english_coach_service.complete_activity(
            user_id=payload.user_id,
            user_role=payload.user_role,
            level_number=payload.level_number,
            activity_id=payload.activity_id,
            score=payload.score,
            mistakes=payload.mistakes
        )
        return result
    except Exception as e:
        logger.error(f"Error completing activity: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/critique-spoken-response")
async def critique_spoken_response(payload: SpokenCritiqueRequest):
    """
    Analyzes single spoken utterance with constructive praise, error correction
    (❌ original vs ✅ corrected), rule explanation, and fluency scores.
    """
    try:
        result = await english_coach_service.critique_spoken_response(
            prompt=payload.prompt,
            user_speech=payload.user_speech,
            context=payload.context,
            user_level=payload.user_level or "A2"
        )
        return result
    except Exception as e:
        logger.error(f"Error critiquing spoken response: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/conversation-turn")
async def process_conversation_turn(payload: ConversationTurnRequest):
    """Real-time voice conversation turn with natural human response and gentle speaking note."""
    try:
        result = await english_coach_service.process_conversation_turn(
            user_message=payload.user_message,
            conversation_history=payload.conversation_history or [],
            category=payload.category or "Casual",
            user_level=payload.user_level or "B1"
        )
        return result
    except Exception as e:
        logger.error(f"Error in conversation turn: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session-report")
async def generate_session_report(payload: SessionReportRequest):
    """Generates an end-of-session performance report after a conversation."""
    try:
        result = await english_coach_service.generate_session_report(
            conversation_turns=payload.conversation_turns,
            category=payload.category or "Casual"
        )
        return result
    except Exception as e:
        logger.error(f"Error in session report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset")
@router.post("/reset-cycle")
async def reset_coach_cycle(payload: ResetProfileRequest):
    """Resets progress so user can restart and retake the diagnostic assessment."""
    fresh_profile = english_coach_service.reset_profile(payload.user_id, user_role=payload.user_role)
    return {
        "status": "success",
        "message": "Coach progress reset. You can now take the Spoken Diagnostic Assessment.",
        "profile": fresh_profile
    }


@router.get("/parent-report/{student_id}")
async def get_parent_report(student_id: str):
    """Returns child's latest English speaking diagnostic and mastery report for parent portal."""
    profile = english_coach_service.get_or_create_profile(student_id, user_role="student")
    levels = english_coach_service.get_levels_for_user(student_id, user_role="student")
    completed_levels = len([l for l in levels if l.get("is_completed")])
    return {
        "status": "success",
        "student_id": student_id,
        "diagnostic_completed": profile.get("has_taken_diagnostic", False),
        "overall_level": profile.get("overall_level", "Unassessed"),
        "overall_score": profile.get("overall_score", 0),
        "skills": profile.get("skills", {}),
        "strengths": profile.get("strengths", []),
        "weaknesses": profile.get("weaknesses", []),
        "priority_focus": profile.get("priority_focus", []),
        "personalized_roadmap": profile.get("personalized_roadmap", []),
        "current_level": profile.get("current_level", 1),
        "completed_levels": completed_levels,
        "total_levels": 5,
        "daily_streak": profile.get("daily_streak", 1),
        "xp": profile.get("xp", 0),
        "words_learned": profile.get("words_learned", 0)
    }
