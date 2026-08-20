import json
import logging
import time
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from services.ai_provider import ai_provider

logger = logging.getLogger("paper_service")

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

PAPERS_FILE = DATA_DIR / "admin_papers.json"

# Seed default papers if missing
DEFAULT_PAPERS = [
    {
        "id": "paper-101",
        "title": "Class 10 CBSE Science Mid-Term Examination 2026",
        "class_name": "Class 10",
        "subject": "Science",
        "board": "CBSE",
        "chapter": "Light, Electricity, Acids & Bases",
        "difficulty": "medium",
        "total_marks": 40,
        "time_allowed_mins": 90,
        "school_name": "DEVGYA GLOBAL ACADEMY",
        "source": "manual",
        "created_at": "2026-08-20 10:00:00",
        "published": True,
        "instructions": [
            "All questions are compulsory.",
            "Section A contains MCQs (1 mark each).",
            "Section B contains Short Answer Questions (3 marks each).",
            "Section C contains Long Answer Questions (5 marks each)."
        ],
        "questions": [
            {
                "id": 1,
                "question_number": 1,
                "question_type": "mcq",
                "question_text": "The focal length of a concave mirror is 15 cm. At what distance should an object be placed to form a real image 3 times magnified?",
                "marks": 1,
                "options": ["(A) -20 cm", "(B) -10 cm", "(C) -30 cm", "(D) -40 cm"],
                "answer": "(A) -20 cm",
                "explanation": "Using magnification m = -v/u = -3 => v = 3u. Mirror formula 1/f = 1/v + 1/u yields u = -20 cm."
            },
            {
                "id": 2,
                "question_number": 2,
                "question_type": "short",
                "question_text": "State Ohm's Law. Draw a circuit diagram to verify Ohm's law in a physics laboratory.",
                "marks": 3,
                "answer": "Ohm's Law states that electric current flowing through a metallic conductor is directly proportional to potential difference across its ends, provided temperature remains constant (V = IR).",
                "explanation": "Circuit diagram must include battery, ammeter in series, voltmeter in parallel across resistor, rheostat, and key."
            },
            {
                "id": 3,
                "question_number": 3,
                "question_type": "long",
                "question_text": "Describe the chlor-alkali process with balanced chemical equations. List three industrial uses of sodium hydroxide and chlorine gas.",
                "marks": 5,
                "answer": "When electricity is passed through an aqueous solution of sodium chloride (brine), it decomposes to form sodium hydroxide: 2NaCl(aq) + 2H2O(l) -> 2NaOH(aq) + Cl2(g) + H2(g). Chlorine gas is given off at anode, hydrogen gas at cathode.",
                "explanation": "Uses of NaOH: soap manufacturing, paper making, petroleum refining. Uses of Cl2: water disinfection, PVC, bleaching powder."
            }
        ]
    }
]

class PaperService:
    def __init__(self):
        self._ensure_seed_data()

    def _ensure_seed_data(self):
        if not PAPERS_FILE.exists():
            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump(DEFAULT_PAPERS, f, indent=2)

    def get_all_papers(self) -> List[Dict[str, Any]]:
        try:
            if PAPERS_FILE.exists():
                with open(PAPERS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error reading admin papers: {e}")
        return DEFAULT_PAPERS

    def get_paper_by_id(self, paper_id: str) -> Optional[Dict[str, Any]]:
        papers = self.get_all_papers()
        return next((p for p in papers if p["id"] == paper_id), None)

    def create_paper_manual(self, paper_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            papers = self.get_all_papers()
            new_id = f"paper-{int(time.time() * 1000) % 1000000:06d}"
            paper_data["id"] = new_id
            paper_data["source"] = "manual"
            paper_data["created_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
            paper_data["published"] = paper_data.get("published", True)

            papers.insert(0, paper_data)
            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump(papers, f, indent=2)

            return {"status": "success", "paper": paper_data}
        except Exception as e:
            logger.error(f"Error creating manual paper: {e}")
            return {"status": "error", "message": str(e)}

    async def generate_paper_from_prompt(
        self,
        prompt_text: str,
        title: str = "AI Generated Question Paper",
        class_name: str = "Class 10",
        subject: str = "Science",
        board: str = "CBSE",
        difficulty: str = "medium",
        total_marks: int = 40,
        time_allowed_mins: int = 90,
        school_name: str = "DEVGYA GLOBAL EDUTECH"
    ) -> Dict[str, Any]:
        """Generate full question paper JSON from Admin text prompt using Groq AI provider."""
        prompt = f"""
You are DEVGYA's Master Assessment Synthesizer for {board} {class_name} {subject}.
Generate an official Examination Question Paper based on this prompt instructions:

Admin Custom Prompt: "{prompt_text}"

Paper Metadata Required:
- Title: {title}
- Target Grade: {class_name}
- Subject: {subject}
- Board: {board}
- Difficulty: {difficulty}
- Total Marks: {total_marks}
- Time Allowed: {time_allowed_mins} minutes
- School Name: {school_name}

Generate a complete question paper containing:
- 4 Multiple Choice Questions (1 mark each) with 4 options and answer explanations.
- 2 Short Answer Questions (3 marks each) with clear step-by-step model answers.
- 1 Long Answer Question (5 marks each) with complete solution.

You MUST respond strictly with a valid JSON object matching this exact structure:
{{
  "title": "{title}",
  "class_name": "{class_name}",
  "subject": "{subject}",
  "board": "{board}",
  "difficulty": "{difficulty}",
  "total_marks": {total_marks},
  "time_allowed_mins": {time_allowed_mins},
  "school_name": "{school_name}",
  "instructions": [
    "All questions are compulsory.",
    "Section A contains MCQs, Section B Short Answers, Section C Long Answer."
  ],
  "questions": [
    {{
      "id": 1,
      "question_number": 1,
      "question_type": "mcq",
      "question_text": "Sample MCQ Question?",
      "marks": 1,
      "options": ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"],
      "answer": "(A) Option 1",
      "explanation": "NCERT conceptual reason."
    }},
    {{
      "id": 2,
      "question_number": 2,
      "question_type": "short",
      "question_text": "Sample Short Answer Question?",
      "marks": 3,
      "answer": "Detailed model answer points.",
      "explanation": "Step by step marking scheme."
    }},
    {{
      "id": 3,
      "question_number": 3,
      "question_type": "long",
      "question_text": "Sample Long Answer Question?",
      "marks": 5,
      "answer": "Complete long model answer breakdown.",
      "explanation": "Comprehensive explanation."
    }}
  ]
}}
"""
        messages = [
            {"role": "system", "content": "You are a specialized AI question paper synthesizer. Return strictly JSON."},
            {"role": "user", "content": prompt}
        ]

        try:
            raw = await ai_provider.chat_completion(messages, temperature=0.5, max_tokens=4000, response_format_json=True)
            text = (raw or "").strip()
            if "```json" in text:
                text = text.split("```json", 1)[1].split("```", 1)[0].strip()
            elif "```" in text:
                text = text.split("```", 1)[1].split("```", 1)[0].strip()

            if "{" in text and "}" in text:
                text = text[text.find("{"):text.rfind("}") + 1].strip()

            paper_json = json.loads(text)
            new_id = f"paper-ai-{int(time.time() * 1000) % 1000000:06d}"
            paper_json["id"] = new_id
            paper_json["source"] = "ai_prompt"
            paper_json["created_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
            paper_json["published"] = True

            # Save to repository
            papers = self.get_all_papers()
            papers.insert(0, paper_json)
            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump(papers, f, indent=2)

            return {"status": "success", "paper": paper_json}
        except Exception as e:
            logger.error(f"Error generating AI paper from prompt: {e}")
            return {"status": "error", "message": f"AI generation error: {str(e)}"}

    def update_paper(self, paper_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        try:
            papers = self.get_all_papers()
            target = next((p for p in papers if p["id"] == paper_id), None)
            if not target:
                return {"status": "error", "message": "Paper not found"}

            target.update(updates)
            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump(papers, f, indent=2)

            return {"status": "success", "updated_paper": target}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def delete_paper(self, paper_id: str) -> Dict[str, Any]:
        try:
            papers = self.get_all_papers()
            filtered = [p for p in papers if p["id"] != paper_id]
            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump(filtered, f, indent=2)
            return {"status": "success", "message": f"Paper {paper_id} deleted"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

paper_service = PaperService()
