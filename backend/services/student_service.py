import json
import logging
from typing import Dict, Any, List
from services.ai_provider import ai_provider
from schemas.phase3 import StudyPlanGeneratePayload

logger = logging.getLogger("student_service")

PLANNER_PROMPT = """
You are an expert AI Study Planner. Create a realistic, highly effective study schedule for a Class 10/12 student.
Consider available study hours, weak subjects that require extra time, and upcoming exam deadlines.

Return a strictly valid JSON object with key "schedule":
{
  "period": "weekly",
  "total_study_hours": 18,
  "daily_breakdown": [
    {
      "day": "Monday",
      "focus_subject": "Mathematics",
      "tasks": [
        {"time": "4:00 PM - 5:00 PM", "topic": "Quadratic Equations Practice", "type": "practice_quiz"},
        {"time": "5:15 PM - 6:00 PM", "topic": "Formula Revision", "type": "flashcards"}
      ]
    }
  ],
  "ai_tips": ["Break long study sessions with 5-minute Pomodoro rests.", "Solve weak topic questions first when energy is highest."]
}
"""

class StudentService:
    async def get_student_dashboard_data(self, student_id: str = "std-1") -> Dict[str, Any]:
        return {
            "student_info": {
                "name": "Aarav Sharma",
                "class_name": "Class 10-A",
                "school": "Apex International Academy",
                "avatar": "A",
                "xp_points": 480,
                "coins": 150,
                "level": 5,
                "learning_streak": 7,
                "leaderboard_rank": 3,
                "opt_out_leaderboard": False
            },
            "today_study_plan": [
                {"id": "t1", "time": "04:30 PM", "subject": "Science", "topic": "Refraction at Spherical Surfaces", "duration": "45 mins", "completed": True},
                {"id": "t2", "time": "05:30 PM", "subject": "Mathematics", "topic": "Quadratic Word Problems", "duration": "60 mins", "completed": False},
                {"id": "t3", "time": "07:00 PM", "subject": "English", "topic": "Grammar & Letter Writing", "duration": "30 mins", "completed": False}
            ],
            "homework_list": [
                {"id": "h1", "title": "Science Worksheet #4", "subject": "Science", "due_date": "Tomorrow", "status": "pending"},
                {"id": "h2", "title": "Math NCERT Ex 4.3 Q1-Q8", "subject": "Mathematics", "due_date": "In 2 days", "status": "in_progress"}
            ],
            "upcoming_tests": [
                {"id": "e1", "subject": "Mathematics", "test_name": "Mid-Term Unit Test", "date": "Aug 05, 2026", "days_left": 7},
                {"id": "e2", "subject": "Science", "test_name": "Physics Chapter Quiz", "date": "Aug 10, 2026", "days_left": 12}
            ],
            "goals": {
                "daily_xp_target": 100,
                "daily_xp_current": 75,
                "weekly_hours_target": 15,
                "weekly_hours_current": 11.5
            },
            "ai_recommendations": [
                "Practice 5 Assertion & Reason questions in Science to lock in 100% conceptual clarity.",
                "Review weak topics in Quadratic Equations word problems using Socratic AI."
            ],
            "badges": [
                {"code": "streak_7", "title": "7-Day Warrior", "icon": "Flame", "description": "Studied for 7 consecutive days"},
                {"code": "quiz_master", "title": "Quiz Master", "icon": "Trophy", "description": "Scored 100% on 5 quizzes"},
                {"code": "socratic_thinker", "title": "Socratic Thinker", "icon": "Brain", "description": "Used AI Tutor for 10 problems"}
            ],
            "recent_notes": []
        }

    async def generate_study_plan(self, payload: StudyPlanGeneratePayload) -> Dict[str, Any]:
        prompt = f"Available Hours: {payload.available_hours_per_day}, Weak Subjects: {', '.join(payload.weak_subjects)}, Period: {payload.target_period}"
        messages = [
            {"role": "system", "content": PLANNER_PROMPT},
            {"role": "user", "content": prompt}
        ]
        try:
            raw = await ai_provider.chat_completion(messages, temperature=0.5, response_format_json=True)
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Study Planner Error: {e}")
            return {
                "period": payload.target_period,
                "total_study_hours": payload.available_hours_per_day * 7,
                "daily_breakdown": [
                    {
                        "day": "Monday",
                        "focus_subject": "Mathematics",
                        "tasks": [
                            {"time": "04:30 PM - 05:30 PM", "topic": "Quadratic Formula Practice", "type": "practice_quiz"},
                            {"time": "05:45 PM - 06:30 PM", "topic": "Weak Topic Socratic Tutor", "type": "socratic_tutor"}
                        ]
                    },
                    {
                        "day": "Tuesday",
                        "focus_subject": "Science",
                        "tasks": [
                            {"time": "04:30 PM - 05:30 PM", "topic": "Optics Ray Diagrams", "type": "revision"},
                            {"time": "05:45 PM - 06:30 PM", "topic": "Physics Flashcards", "type": "flashcards"}
                        ]
                    }
                ],
                "ai_tips": ["Schedule weak topics during peak energy hours.", "Review flashcards right before sleep to improve long-term memory consolidation."]
            }

student_service = StudentService()
