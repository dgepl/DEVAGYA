import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from services.english_coach_service import english_coach_service, get_curriculum_modules

logger = logging.getLogger("english_coach_api")
router = APIRouter(prefix="/english-coach", tags=["English Speaking Coach"])


class DiagnosticSubmitRequest(BaseModel):
    user_id: str
    user_role: str = "student"
    answers: Dict[str, int] = Field(..., description="Mapping of question id string to selected option index")


class LectureStepCompleteRequest(BaseModel):
    user_id: str
    user_role: str = "student"
    module_index: int
    step_id: str


class PublicSpeakingCritiqueRequest(BaseModel):
    user_id: str
    speech_text: str
    topic: str
    user_level: str = "Intermediate"


class FinalizeReportRequest(BaseModel):
    user_id: str
    user_role: str = "student"
    student_name: str = "Student"
    capstone_transcript: str


class ResetCycleRequest(BaseModel):
    user_id: str
    user_role: str = "student"


@router.get("/diagnostic-questions")
async def get_diagnostic_questions():
    """Returns the 10 fixed questions without the answer key for the user's initial test."""
    questions = english_coach_service.get_diagnostic_questions_for_client()
    return {"questions": questions, "total": len(questions)}


@router.get("/state")
async def get_coach_state(user_id: str, user_role: str = "student"):
    """Fetches user's current progress, diagnostic status, unlocked lectures, and 30-day expiry timer."""
    track = english_coach_service.get_user_track(user_id, user_role=user_role)
    modules = get_curriculum_modules(
        track.get("fluency_level", "Intermediate"),
        track.get("weak_points", [])
    )
    return {
        "track": track,
        "modules": modules
    }


@router.post("/diagnostic-submit")
async def submit_diagnostic_test(payload: DiagnosticSubmitRequest):
    """Grades the 10-mark test, detects weak points, unlocks module 1, and initializes roadmap."""
    try:
        result = english_coach_service.submit_diagnostic(
            user_id=payload.user_id,
            user_answers=payload.answers,
            user_role=payload.user_role
        )
        return result
    except Exception as e:
        logger.error(f"Error submitting diagnostic test: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/lecture-complete")
async def complete_lecture_step(payload: LectureStepCompleteRequest):
    """Marks step complete, strictly prevents skipping, and unlocks next module when done."""
    try:
        result = english_coach_service.complete_lecture_step(
            user_id=payload.user_id,
            module_index=payload.module_index,
            step_id=payload.step_id,
            user_role=payload.user_role
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error completing lecture step: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/public-speaking-critique")
async def critique_public_speaking(payload: PublicSpeakingCritiqueRequest):
    """AI adjudicator evaluates spoken presentation for fillers, grammar, and live corrections."""
    try:
        evaluation = await english_coach_service.evaluate_public_speaking(
            speech_text=payload.speech_text,
            topic=payload.topic,
            user_level=payload.user_level
        )
        return evaluation
    except Exception as e:
        logger.error(f"Error evaluating public speaking: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/finalize-report")
async def finalize_mastery_report(payload: FinalizeReportRequest):
    """Generates official Spoken English Mastery Report Card after the final capstone."""
    try:
        report = await english_coach_service.generate_mastery_report(
            user_id=payload.user_id,
            capstone_transcript=payload.capstone_transcript,
            user_role=payload.user_role,
            student_name=payload.student_name
        )
        return report
    except Exception as e:
        logger.error(f"Error finalizing mastery report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/parent-report/{student_id}")
async def get_parent_report(student_id: str):
    """Returns child's latest English speaking diagnostic and mastery report for parent portal."""
    track = english_coach_service.get_user_track(student_id, user_role="student")
    return {
        "student_id": student_id,
        "diagnostic_completed": track.get("diagnostic_completed", False),
        "diagnostic_score": track.get("diagnostic_score", 0),
        "fluency_level": track.get("fluency_level", "Unassessed"),
        "weak_points": track.get("weak_points", []),
        "completed_modules": track.get("unlocked_module_index", 0),
        "mastery_report": track.get("mastery_report"),
        "cycle_valid_until": track.get("expires_at")
    }


@router.post("/reset-cycle")
async def reset_coach_cycle(payload: ResetCycleRequest):
    """Resets progress so user can restart the 30-day mastery cycle and re-take the diagnostic test."""
    track = english_coach_service.get_user_track(payload.user_id, user_role=payload.user_role)
    track["diagnostic_completed"] = False
    track["diagnostic_score"] = 0
    track["current_module_index"] = 0
    track["unlocked_module_index"] = 0
    track["completed_steps"] = []
    track["mastery_report"] = None
    track["is_expired"] = False
    track["expires_at"] = english_coach_service._get_expiry_iso()
    english_coach_service.save_user_track(payload.user_id, track, user_role=payload.user_role)
    return {"status": "success", "message": "English speaking cycle has been reset. Please retake the diagnostic test."}
