import json
import logging
from typing import Dict, Any, List
from services.ai_provider import ai_provider
from services.academic_guardrail import attach_academic_guardrail
from schemas.phase3 import SocraticQueryPayload, SocraticResponse

logger = logging.getLogger("socratic_tutor")

SOCRATIC_SYSTEM_PROMPT = attach_academic_guardrail("""
You are an expert Socratic AI Tutor on DEVGYA platform.
Your objective is NEVER to directly reveal the final answer to homework or exam problems right away unless explicitly asked by the student after multiple attempts.
Instead, your goal is to empower the student to think critically, ask probing questions, identify missing steps, and discover the solution themselves.

Rules:
1. Praise curiosity and effort.
2. Ask 1-2 guiding questions that prompt the student's next step (e.g. "What key formula relates these variables?", "What is given in the problem statement?").
3. Provide subtle conceptual clues or real-world analogies.
4. Provide 3 quick suggested follow-up hint buttons for the student UI.
5. Format response in JSON format with fields:
   - "reply": Markdown explanation with guiding questions (Socratic style).
   - "suggested_hints": List of 3 concise hint choices (e.g., ["Remind me of Newton's 2nd Law", "Help me list the given values", "Give me an example"]).
   - "suggested_questions": List of 2 follow-up probing questions for the student to consider.
""")

DIRECT_EXPLANATION_PROMPT = attach_academic_guardrail("""
You are an encouraging AI Master Educator on DEVGYA platform. The student has explicitly requested the direct step-by-step answer or solution.
Provide a crystal-clear, structured explanation with key concepts emphasized.
Format in JSON format with fields:
   - "reply": Markdown response with step-by-step breakdown.
   - "suggested_hints": List of 3 key takeaways or summary points.
   - "suggested_questions": List of 2 practice questions to test their understanding.
""")

class SocraticTutorService:
    async def process_student_query(self, payload: SocraticQueryPayload) -> SocraticResponse:
        messages = []
        if payload.socratic_mode:
            messages.append({"role": "system", "content": SOCRATIC_SYSTEM_PROMPT})
        else:
            messages.append({"role": "system", "content": DIRECT_EXPLANATION_PROMPT})

        user_content = f"Subject: {payload.subject}\nTopic: {payload.topic}\nQuestion/Homework: {payload.message}"
        if payload.context_text:
            user_content += f"\nContext/Textbook Snippet: {payload.context_text}"
        if payload.image_url:
            user_content += f"\nUploaded Homework Image/PDF: {payload.image_url}"

        messages.append({"role": "user", "content": user_content})

        try:
            raw_response = await ai_provider.chat_completion(messages, temperature=0.6, response_format_json=True)
            data = json.loads(raw_response)
            return SocraticResponse(
                reply=data.get("reply", "Great question! What do you think is the very first step here?"),
                is_socratic=payload.socratic_mode,
                suggested_hints=data.get("suggested_hints", ["What formula applies here?", "List the given values", "Explain the core concept"]),
                suggested_questions=data.get("suggested_questions", ["What is the primary unit here?", "Can we simplify this step?"]),
                xp_gained=15 if payload.socratic_mode else 5
            )
        except Exception as e:
            logger.error(f"Socratic Tutor Error: {e}")
            # Intelligent fallback Socratic response
            return SocraticResponse(
                reply=f"That's a fantastic question about **{payload.topic}**!\n\nTo get started, let's break this down:\n1. What information do we already know from the question?\n2. What is the main goal or variable we need to solve for?\n\nTake a moment to write down the given values!",
                is_socratic=payload.socratic_mode,
                suggested_hints=["Identify given parameters", "Recall basic formula", "Show step 1 example"],
                suggested_questions=["What units are given?", "What principle governs this system?"],
                xp_gained=15
            )

socratic_tutor_service = SocraticTutorService()
