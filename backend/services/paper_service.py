import json
import logging
import time
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from services.ai_provider import ai_provider

logger = logging.getLogger("paper_service")

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

PAPERS_FILE = DATA_DIR / "admin_papers.json"

# Seed default papers with 100% MCQ questions & schedule window
DEFAULT_PAPERS = [
    {
        "id": "paper-101",
        "title": "Class 10 CBSE Science Olympiad & Assessment 2026",
        "class_name": "Class 10",
        "subject": "Science",
        "board": "CBSE",
        "chapter": "Light, Electricity, Acids & Bases",
        "difficulty": "medium",
        "total_marks": 10,
        "time_allowed_mins": 20,
        "school_name": "DEVGYA GLOBAL EDUTECH",
        "source": "manual",
        "created_at": "2026-08-20 10:00:00",
        "start_time": "2026-08-01 00:00:00",
        "end_time": "2026-12-31 23:59:59",
        "published": True,
        "instructions": [
            "All questions are compulsory Multiple Choice Questions (MCQs).",
            "Select the single correct option for each question.",
            "Results will be evaluated by the Official Admin Board."
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
                "question_type": "mcq",
                "question_text": "Which of the following circuit components is connected in parallel across a resistor to measure potential difference?",
                "marks": 1,
                "options": ["(A) Voltmeter", "(B) Ammeter", "(C) Galvanometer", "(D) Rheostat"],
                "answer": "(A) Voltmeter",
                "explanation": "Voltmeters have high resistance and must be connected in parallel to measure potential difference across components."
            },
            {
                "id": 3,
                "question_number": 3,
                "question_type": "mcq",
                "question_text": "During the chlor-alkali process, which gas is released at the anode during electrolysis of brine?",
                "marks": 1,
                "options": ["(A) Chlorine Gas (Cl2)", "(B) Hydrogen Gas (H2)", "(C) Oxygen Gas (O2)", "(D) Nitrogen Gas (N2)"],
                "answer": "(A) Chlorine Gas (Cl2)",
                "explanation": "Electrolysis of aqueous NaCl produces chlorine gas at anode, hydrogen gas at cathode, and sodium hydroxide in solution."
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
            
            # Ensure all questions are forced to MCQ type and normalize correct_answer
            for idx, q in enumerate(paper_data.get("questions", [])):
                q["question_type"] = "mcq"
                q["question_number"] = idx + 1
                
                # Normalize correct_answer index
                raw_corr = q.get("correct_answer")
                corr_idx = 0
                if isinstance(raw_corr, int):
                    corr_idx = raw_corr
                elif isinstance(raw_corr, str):
                    if raw_corr.isdigit():
                        corr_idx = int(raw_corr)
                    elif raw_corr.strip().upper() in ["A", "B", "C", "D"]:
                        corr_idx = ord(raw_corr.strip().upper()) - 65
                q["correct_answer"] = corr_idx
                
                options = q.get("options", [])
                if 0 <= corr_idx < len(options):
                    q["answer"] = options[corr_idx]

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
        title: str = "AI Generated MCQ Question Paper",
        class_name: str = "Class 10",
        subject: str = "Science",
        board: str = "CBSE",
        difficulty: str = "medium",
        total_marks: int = 20,
        time_allowed_mins: int = 30,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        school_name: str = "DEVGYA GLOBAL EDUTECH"
    ) -> Dict[str, Any]:
        """Generate STRICT 100% MCQ question paper JSON from Admin text prompt using Groq AI provider."""
        prompt = f"""
You are DEVGYA's Master Assessment Synthesizer for {board} {class_name} {subject}.
Generate an official Examination Question Paper strictly containing ONLY Multiple Choice Questions (MCQs) based on this prompt:

Admin Custom Prompt: "{prompt_text}"

Paper Details:
- Title: {title}
- Target Grade: {class_name}
- Subject: {subject}
- Board: {board}
- Difficulty: {difficulty}
- Total Marks: {total_marks}
- Time Allowed: {time_allowed_mins} minutes
- School Name: {school_name}

MANDATORY CONSTRAINT:
- ALL QUESTIONS MUST BE 100% MULTIPLE CHOICE QUESTIONS (MCQs). DO NOT INCLUDE ANY SHORT OR LONG ANSWER QUESTIONS.
- Every question MUST have exactly 4 options: (A), (B), (C), (D).

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
    "All questions are compulsory Multiple Choice Questions (MCQs).",
    "Select the single correct option for each question."
  ],
  "questions": [
    {{
      "id": 1,
      "question_number": 1,
      "question_type": "mcq",
      "question_text": "Sample MCQ Question Text?",
      "marks": 1,
      "options": ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"],
      "answer": "(A) Option 1",
      "explanation": "NCERT conceptual reason explanation."
    }},
    {{
      "id": 2,
      "question_number": 2,
      "question_type": "mcq",
      "question_text": "Second Sample MCQ Question Text?",
      "marks": 1,
      "options": ["(A) Choice 1", "(B) Choice 2", "(C) Choice 3", "(D) Choice 4"],
      "answer": "(B) Choice 2",
      "explanation": "Detailed explanation."
    }}
  ]
}}
"""
        messages = [
            {"role": "system", "content": "You are a specialized AI question paper synthesizer. Return strictly JSON containing ONLY MCQ questions."},
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
            paper_json["start_time"] = start_time or time.strftime("%Y-%m-%d %H:%M:%S")
            paper_json["end_time"] = end_time or "2026-12-31 23:59:59"

            # Enforce 100% MCQ type
            for idx, q in enumerate(paper_json.get("questions", [])):
                q["question_type"] = "mcq"
                q["question_number"] = idx + 1

            # Save to repository
            papers = self.get_all_papers()
            papers.insert(0, paper_json)
            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump(papers, f, indent=2)

            return {"status": "success", "paper": paper_json}
        except Exception as e:
            logger.error(f"Error generating AI paper from prompt: {e}")
            return {"status": "error", "message": f"AI generation error: {str(e)}"}

    def get_previous_papers(self) -> List[Dict[str, Any]]:
        """Fetch past/archived Olympiad papers whose end_time has passed or marked archived."""
        try:
            papers = self.get_all_papers()
            now_str = time.strftime("%Y-%m-%d %H:%M:%S")
            archived = []
            for p in papers:
                end_t = p.get("end_time")
                if end_t and end_t < now_str:
                    archived.append(p)
            return archived
        except Exception as e:
            logger.error(f"Error fetching previous papers: {e}")
            return []

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
