import json
import logging
from typing import Dict, Any, List
from services.ai_provider import ai_provider
from schemas.phase3 import ParentCoachPayload

logger = logging.getLogger("parent_service")

PARENT_COACH_PROMPT = """
You are an empathetic, evidence-based AI Parenting & Educational Coach on Academix AI platform.
Your purpose is to provide structured, actionable, and encouraging advice to parents to support their child's academic journey, focus, mental wellness, and study habits.

Format response in JSON with:
- "advice": Structured markdown advice with clear headings and bullet points.
- "actionable_tips": List of 3 specific actions the parent can try today.
- "recommended_discussion_starter": A gentle conversation prompt for the parent to talk with their child.
"""

class ParentService:
    async def process_parent_query(self, payload: ParentCoachPayload) -> Dict[str, Any]:
        prompt = f"Parent Question: {payload.question}"
        messages = [
            {"role": "system", "content": PARENT_COACH_PROMPT},
            {"role": "user", "content": prompt}
        ]
        try:
            raw = await ai_provider.chat_completion(messages, temperature=0.6, response_format_json=True)
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Parent Coach Error: {e}")
            return {
                "advice": f"Supporting your child with study habits is essential!\n\n### Strategic Suggestions for: '{payload.question}'\n\n1. **Establish a Consistent Routine**: Encourage fixed study blocks separated by short rest breaks.\n2. **Create a Distraction-Free Study Space**: Ensure good lighting and quiet surroundings.\n3. **Focus on Effort, Not Just Marks**: Praise consistency and curiosity to foster a growth mindset.",
                "actionable_tips": [
                    "Set up a joint 25-minute quiet study block together.",
                    "Ask your child to teach you one interesting concept they learned today.",
                    "Ensure electronic devices are parked away during focus hours."
                ],
                "recommended_discussion_starter": "Hey! What was the coolest thing you learned in Science or Math today?"
            }

    async def get_child_overview(self, parent_id: str = "prt-1", child_id: str = "std-1") -> Dict[str, Any]:
        return {
            "child_name": "Aarav Sharma",
            "class_name": "Class 10",
            "section": "A",
            "school_name": "Apex International Academy",
            "learning_streak": 7,
            "xp_points": 480,
            "study_hours_this_week": 14.5,
            "homework_completion_rate": 92,
            "overall_attendance_percentage": 96.5,
            "recent_quiz_average": 88.0,
            "subject_mastery": [
                {"subject": "Mathematics", "score": 85, "status": "Strong"},
                {"subject": "Science", "score": 92, "status": "Excellent"},
                {"subject": "English", "score": 88, "status": "Strong"},
                {"subject": "Social Studies", "score": 74, "status": "Needs Improvement"}
            ],
            "weak_topics": ["Quadratic Equations Word Problems", "History - Nationalism in India"],
            "strong_topics": ["Light Reflection & Refraction", "Chemical Reactions", "English Grammar"],
            "teacher_feedback": "Aarav demonstrates excellent problem-solving ability in Science. Encouraging more structured practice in History essay questions will yield top marks.",
            "ai_recommendation": "Recommend 20 minutes of daily flashcard review in Social Studies to boost retention before upcoming term exams."
        }

parent_service = ParentService()
