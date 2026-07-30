import json
import logging
from typing import Dict, Any
from schemas.phase2 import ContentGenRequest
from services.ai_provider import ai_provider

logger = logging.getLogger("content_service")

class ContentGeneratorService:
    async def generate_content(self, req: ContentGenRequest) -> Dict[str, Any]:
        prompt = f"""
Generate an educational {req.content_type.upper()} for:
Class: {req.class_name}
Subject: {req.subject}
Topic/Chapter: {req.topic}
Custom Context: {req.custom_notes or "NCERT pattern"}

Return strictly a JSON object formatted cleanly based on content type:
For 'worksheet': {{"title": "...", "sections": [{{"heading": "...", "questions": ["..."]}}]}}
For 'flashcard': {{"title": "...", "cards": [{{"front": "...", "back": "..."}}]}}
For 'mindmap': {{"title": "...", "central_node": "...", "branches": [{{"name": "...", "subnodes": ["..."]}}]}}
For 'rubric': {{"title": "...", "criteria": [{{"aspect": "...", "excellent": "...", "good": "...", "needs_improvement": "..."}}]}}
"""
        try:
            raw = await ai_provider.chat_completion(
                messages=[
                    {"role": "system", "content": "You are a master educational content generator."},
                    {"role": "user", "content": prompt}
                ],
                response_format_json=True
            )
            if raw:
                return json.loads(raw)
        except Exception as e:
            logger.error(f"Content generation fallback: {e}")

        # Intelligent Fallbacks
        if req.content_type == 'flashcard':
            return {
                "title": f"Flashcards: {req.topic}",
                "cards": [
                    {"front": "What is the primary formula?", "back": "Refer to NCERT core equation."},
                    {"front": "Define key term 1", "back": "Fundamental definition with S.I. unit."},
                    {"front": "Common exam pitfall", "back": "Remember to write proper state symbols."}
                ]
            }
        elif req.content_type == 'mindmap':
            return {
                "title": f"Mind Map: {req.topic}",
                "central_node": req.topic,
                "branches": [
                    {"name": "Core Principles", "subnodes": ["Definitions", "Laws & Theories", "Key Formulas"]},
                    {"name": "Experimental Setup", "subnodes": ["Reagents", "Observations", "Safety Precautions"]},
                    {"name": "NCERT Applications", "subnodes": ["Real-world uses", "Numerical examples"]}
                ]
            }
        elif req.content_type == 'rubric':
            return {
                "title": f"Assessment Rubric: {req.topic}",
                "criteria": [
                    {"aspect": "Concept Accuracy", "excellent": "Complete precision, zero errors", "good": "Minor technical flaws", "needs_improvement": "Fundamental misunderstandings"},
                    {"aspect": "Mathematical Steps", "excellent": "All units and step derivations clear", "good": "Correct answer, skipped steps", "needs_improvement": "Calculation errors"},
                    {"aspect": "Diagram & Labeling", "excellent": "Neat, perfectly labeled", "good": "Partially labeled", "needs_improvement": "Missing diagram"}
                ]
            }
        else: # Default worksheet
            return {
                "title": f"Worksheet: {req.topic}",
                "sections": [
                    {"heading": "Section A: Conceptual Recall", "questions": [f"Explain the primary mechanism of {req.topic}.", "State two key real-world applications."]},
                    {"heading": "Section B: Numerical & HOTS", "questions": ["Calculate the expected outcome when values double.", "Analyze the experimental error in sample data."]}
                ]
            }

content_service = ContentGeneratorService()
