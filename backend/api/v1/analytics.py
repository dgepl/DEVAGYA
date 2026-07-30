from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["AI Usage Analytics"])

@router.get("/metrics")
async def get_teacher_ai_analytics():
    return {
        "overview": {
            "total_tokens_consumed": 4250000,
            "estimated_hours_saved": 48.5,
            "question_papers_generated": 24,
            "lesson_plans_created": 18,
            "voice_sessions_completed": 12,
            "worksheets_exported": 35
        },
        "daily_tokens": [
            {"day": "Mon", "tokens": 420000, "hours_saved": 6.5},
            {"day": "Tue", "tokens": 680000, "hours_saved": 8.0},
            {"day": "Wed", "tokens": 850000, "hours_saved": 11.2},
            {"day": "Thu", "tokens": 520000, "hours_saved": 7.4},
            {"day": "Fri", "tokens": 940000, "hours_saved": 12.0},
            {"day": "Sat", "tokens": 310000, "hours_saved": 3.4}
        ],
        "feature_breakdown": [
            {"feature": "Question Paper Studio", "percentage": 38},
            {"feature": "AI Lesson Planner", "percentage": 25},
            {"feature": "AI Chat & Mentor", "percentage": 20},
            {"feature": "Voice AI Fluency Coach", "percentage": 10},
            {"feature": "OCR Book Scanner", "percentage": 7}
        ]
    }
