from fastapi import APIRouter
from schemas.phase3 import QuizGeneratePayload, QuizSubmitPayload, QuizResultResponse
from services.quiz_service import quiz_service

router = APIRouter(prefix="/quizzes", tags=["Adaptive Practice & Quizzes"])

@router.post("/generate")
async def generate_adaptive_quiz(payload: QuizGeneratePayload):
    """Generate adaptive quiz across 9 question formats."""
    return await quiz_service.generate_quiz(payload)

@router.post("/evaluate", response_model=QuizResultResponse)
async def evaluate_quiz_submission(payload: QuizSubmitPayload):
    """Grade quiz submission, calculate XP, coins, and return detailed feedback breakdown."""
    # Mock quiz data fallback evaluation
    mock_quiz_data = {
        "questions": [
            {"id": 1, "question_type": "mcq", "question": "Sample Question", "correct_answer": "Fundamental Theorem", "explanation": "Core principle."},
            {"id": 2, "question_type": "true_false", "question": "Sample T/F", "correct_answer": "True", "explanation": "Universal law."}
        ]
    }
    return await quiz_service.evaluate_quiz(payload, mock_quiz_data)
