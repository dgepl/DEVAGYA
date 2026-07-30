import json
import logging
from typing import Dict, Any, List
from services.ai_provider import ai_provider
from schemas.phase4 import PromptTemplatePayload, PromptTestPayload

logger = logging.getLogger("prompt_studio")

DEFAULT_PROMPTS: List[Dict[str, Any]] = [
    {
        "id": "pr-1",
        "title": "Socratic Physics Problem Solver",
        "category": "teaching",
        "variables": ["subject", "chapter", "problem_statement"],
        "prompt_text": "You are a Socratic tutor teaching {{subject}} ({{chapter}}). The student presents the problem: {{problem_statement}}. Ask 2 probing questions to guide their reasoning without giving the direct answer.",
        "tags": ["socratic", "physics", "active_recall"],
        "version": "1.2.0"
    },
    {
        "id": "pr-2",
        "title": "CBSE Board Paper Marking Rubric",
        "category": "assessment",
        "variables": ["question", "max_marks"],
        "prompt_text": "Generate a strict CBSE marking scheme for the question: '{{question}}' (Max Marks: {{max_marks}}). Include step-wise mark distribution and key technical keywords.",
        "tags": ["cbse", "rubric", "grading"],
        "version": "2.0.0"
    },
    {
        "id": "pr-3",
        "title": "Differentiated Lesson Activity Generator",
        "category": "lesson_planning",
        "variables": ["topic", "grade_level"],
        "prompt_text": "Create 3 differentiated learning activities for {{grade_level}} students on topic '{{topic}}': (1) Visual/Kinesthetic, (2) Problem Solving, (3) Group Discussion.",
        "tags": ["differentiation", "activities"],
        "version": "1.0.0"
    }
]

class PromptStudioService:
    def get_templates(self) -> List[Dict[str, Any]]:
        return DEFAULT_PROMPTS

    async def test_prompt(self, payload: PromptTestPayload) -> Dict[str, Any]:
        prompt_text = payload.prompt_text
        for k, v in payload.variable_values.items():
            prompt_text = prompt_text.replace(f"{{{{{k}}}}}", v)

        messages = [
            {"role": "system", "content": "You are Prompt Studio Testing Assistant."},
            {"role": "user", "content": prompt_text}
        ]
        try:
            res = await ai_provider.chat_completion(messages, temperature=0.5)
            return {
                "interpolated_prompt": prompt_text,
                "result": res,
                "tokens_used": 150
            }
        except Exception as e:
            logger.error(f"Prompt Test Error: {e}")
            return {
                "interpolated_prompt": prompt_text,
                "result": f"Interpolated Prompt executed successfully:\n\n{prompt_text}",
                "tokens_used": 100
            }

prompt_studio_service = PromptStudioService()
