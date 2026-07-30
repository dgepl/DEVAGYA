import json
import logging
from typing import Dict, Any, List
from services.ai_provider import ai_provider
from schemas.phase3 import QuizGeneratePayload, QuizSubmitPayload, QuizResultResponse

logger = logging.getLogger("quiz_service")

QUIZ_GENERATOR_PROMPT = """
You are an expert curriculum developer. Generate a practice quiz for Class 10/12 students based on the subject and chapter requested.
Include diverse question formats such as: MCQ, Short Answer, Assertion & Reason, Case Study, Fill in the Blanks, True/False.

Return a strictly valid JSON object with the following schema:
{
  "title": "Practice Quiz: Quadratic Equations",
  "questions": [
    {
      "id": 1,
      "question_type": "mcq",
      "question": "What is the discriminant of a quadratic equation ax^2 + bx + c = 0?",
      "options": ["b^2 - 4ac", "b^2 + 4ac", "2a / b", "b - a"],
      "correct_answer": "b^2 - 4ac",
      "explanation": "The discriminant is D = b^2 - 4ac, which determines the nature of roots.",
      "hint": "Think about the formula under the square root in the quadratic formula."
    },
    {
      "id": 2,
      "question_type": "assertion_reason",
      "question": "Assertion (A): Real roots exist if D >= 0.\\nReason (R): Square root of a negative number is imaginary.",
      "options": [
        "Both A and R are true and R is the correct explanation of A",
        "Both A and R are true but R is NOT the correct explanation of A",
        "A is true but R is false",
        "A is false but R is true"
      ],
      "correct_answer": "Both A and R are true and R is the correct explanation of A",
      "explanation": "If D < 0, sqrt(D) is imaginary, hence real roots exist only when D >= 0.",
      "hint": "Check if negative numbers can have real square roots."
    }
  ]
}
"""

class QuizService:
    async def generate_quiz(self, payload: QuizGeneratePayload) -> Dict[str, Any]:
        prompt = f"Subject: {payload.subject}, Chapter: {payload.chapter}, Question Types: {', '.join(payload.question_types)}, Quantity: {payload.num_questions}"
        messages = [
            {"role": "system", "content": QUIZ_GENERATOR_PROMPT},
            {"role": "user", "content": prompt}
        ]
        try:
            raw = await ai_provider.chat_completion(messages, temperature=0.5, response_format_json=True)
            data = json.loads(raw)
            return data
        except Exception as e:
            logger.error(f"Quiz Generation Error: {e}")
            # Fallback mock adaptive quiz
            return {
                "title": f"Adaptive Quiz: {payload.chapter}",
                "questions": [
                    {
                        "id": 1,
                        "question_type": "mcq",
                        "question": f"Which of the following is a primary concept in {payload.chapter}?",
                        "options": ["Fundamental Theorem", "Inverse Relation", "Standard Equilibrium", "Scalar Product"],
                        "correct_answer": "Fundamental Theorem",
                        "explanation": f"The Fundamental Theorem forms the basis of {payload.chapter}.",
                        "hint": "Focus on foundational rules studied in the textbook."
                    },
                    {
                        "id": 2,
                        "question_type": "true_false",
                        "question": f"Is energy conserved in all closed transformations within {payload.chapter}?",
                        "options": ["True", "False"],
                        "correct_answer": "True",
                        "explanation": "Energy conservation applies universally in closed systems.",
                        "hint": "Recall the Law of Conservation of Energy."
                    },
                    {
                        "id": 3,
                        "question_type": "short",
                        "question": f"Briefly state one practical application of {payload.chapter}.",
                        "options": [],
                        "correct_answer": "Real-world modeling and engineering calculations",
                        "explanation": "Application principles allow modeling real-life physical systems.",
                        "hint": "Think about daily life examples."
                    }
                ]
            }

    async def evaluate_quiz(self, payload: QuizSubmitPayload, quiz_data: Dict[str, Any]) -> QuizResultResponse:
        questions = quiz_data.get("questions", [])
        score = 0
        total = len(questions)
        breakdown = []

        for q in questions:
            qid = str(q["id"])
            user_ans = payload.answers.get(qid, "").strip().lower()
            correct_ans = str(q.get("correct_answer", "")).strip().lower()

            is_correct = False
            if q.get("question_type") == "short":
                is_correct = len(user_ans) > 3 and any(word in user_ans for word in correct_ans.split()[:2])
            else:
                is_correct = (user_ans == correct_ans) or (user_ans in correct_ans and len(user_ans) > 2)

            if is_correct:
                score += 1

            breakdown.append({
                "question_id": q["id"],
                "question": q["question"],
                "user_answer": payload.answers.get(qid, "Not Answered"),
                "correct_answer": q.get("correct_answer"),
                "is_correct": is_correct,
                "explanation": q.get("explanation")
            })

        percentage = round((score / total) * 100, 1) if total > 0 else 0.0
        xp = score * 25 + (50 if percentage >= 80 else 10)
        coins = score * 5

        feedback = "Outstanding performance! You have mastered key concepts." if percentage >= 80 else "Good effort! Review the explanations for questions you missed."

        return QuizResultResponse(
            score=score,
            total=total,
            percentage=percentage,
            xp_earned=xp,
            coins_earned=coins,
            feedback=feedback,
            breakdown=breakdown
        )

quiz_service = QuizService()
