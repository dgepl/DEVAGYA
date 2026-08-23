import json
import logging
import time
import os
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from services.ai_provider import ai_provider

logger = logging.getLogger("paper_service")

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

PAPERS_FILE = DATA_DIR / "admin_papers.json"

class PaperService:
    def __init__(self):
        self._ensure_seed_data()

    def _ensure_seed_data(self):
        if not PAPERS_FILE.exists():
            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump([], f, indent=2)

    def get_all_papers(self) -> List[Dict[str, Any]]:
        try:
            if PAPERS_FILE.exists():
                with open(PAPERS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error reading admin papers: {e}")
        return []

    def get_paper_by_id(self, paper_id: str) -> Optional[Dict[str, Any]]:
        papers = self.get_all_papers()
        return next((p for p in papers if p["id"] == paper_id), None)

    def get_active_olympiad_paper(self) -> Optional[Dict[str, Any]]:
        """Returns the currently active published Olympiad paper for candidates."""
        papers = self.get_all_papers()
        # Find published TSO paper
        published = [p for p in papers if p.get("published") is True]
        if published:
            return published[0]
        return None

    def create_paper_manual(self, paper_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            papers = self.get_all_papers()
            new_id = f"paper-{int(time.time() * 1000) % 1000000:06d}"
            
            created_paper = {
                "id": new_id,
                "title": paper_data.get("title", "Custom Exam Paper"),
                "class_name": paper_data.get("class_name", "Class 10"),
                "subject": paper_data.get("subject", "Science"),
                "board": paper_data.get("board", "CBSE"),
                "chapter": paper_data.get("chapter", "Full Syllabus"),
                "difficulty": paper_data.get("difficulty", "medium"),
                "total_marks": len(paper_data.get("questions", [])) or paper_data.get("total_marks", 20),
                "time_allowed_mins": paper_data.get("time_allowed_mins", 30),
                "school_name": paper_data.get("school_name", "DEVGYA GLOBAL EDUTECH"),
                "source": "manual",
                "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "start_time": paper_data.get("start_time") or time.strftime("%Y-%m-%d %H:%M:%S"),
                "end_time": paper_data.get("end_time") or "2026-12-31 23:59:59",
                "published": paper_data.get("published", False),
                "instructions": paper_data.get("instructions", ["All questions are compulsory."]),
                "questions": paper_data.get("questions", [])
            }

            papers.insert(0, created_paper)
            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump(papers, f, indent=2)

            return {"status": "success", "paper": created_paper}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def generate_100_tso_paper_ai(
        self,
        subject: str = "Science",
        class_name: str = "Secondary (Classes 9–10)",
        title: Optional[str] = None,
        difficulty: str = "medium",
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        school_name: str = "DEVGYA GLOBAL EDUTECH"
    ) -> Dict[str, Any]:
        """
        AI-Powered Generator for the Master 100-MCQ 60/40 Hybrid Structure:
        - Part-A: Universal Pedagogy (60 MCQs)
          * Module 1: CBSE CPD Modules & NEP Guidelines (20 MCQs)
          * Module 2: Personal Classroom Experience & Scenarios (20 MCQs)
          * Module 3: Modern Pedagogy & Critical Thinking (20 MCQs)
        - Part-B: Subject Content & Pedagogy (40 MCQs)
          * Module 1: Core Subject Knowledge (20 MCQs)
          * Module 2: Subject Pedagogical Knowledge & TLM (10 MCQs)
          * Module 3: Misconceptions & HOTS (10 MCQs)
        """
        paper_title = title or f"National Teacher Skills Olympiad 2026 — {subject.upper()}"
        
        # Modules configuration with explicit difficulty tuning
        diff_label = difficulty.title() if difficulty else "Medium"
        modules_spec = [
            # Part A
            {"section": "Part-A", "module": "CBSE CPD Modules & NEP Guidelines", "count": 20, "prompt": f"Generate 20 high-quality multiple choice questions (MCQs) at {diff_label} difficulty level testing CBSE 50-hour Continuous Professional Development (CPD) modules, NEP 2020 pedagogical reforms, Competency-Based Education (CBE), PARAKH guidelines, and learning outcome assessments for school educators."},
            {"section": "Part-A", "module": "Personal Classroom Experience & Scenarios", "count": 20, "prompt": f"Generate 20 scenario-based MCQs at {diff_label} difficulty level testing real classroom situation handling, diverse student behavior management, handling test anxiety, mixed-ability teaching, and ethical decision-making for educators."},
            {"section": "Part-A", "module": "Modern Pedagogy & Critical Thinking", "count": 20, "prompt": f"Generate 20 MCQs at {diff_label} difficulty level evaluating modern pedagogical strategies: Socratic questioning, Higher Order Thinking Skills (HOTS) framing, Art-Integrated Learning (AIL), and Inclusive Education."},
            # Part B
            {"section": "Part-B", "module": "Core Subject Knowledge", "count": 20, "prompt": f"Generate 20 rigorous conceptual MCQs at {diff_label} difficulty level testing core subject depth and NCERT/CBSE curriculum mastery in {subject} for {class_name} teachers."},
            {"section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "count": 10, "prompt": f"Generate 10 MCQs at {diff_label} difficulty level on subject-specific pedagogical methodologies, Teaching-Learning Material (TLM) utilization, digital simulations (e.g. PhET, GeoGebra), and experiential lab activities in {subject}."},
            {"section": "Part-B", "module": "Misconceptions & HOTS", "count": 10, "prompt": f"Generate 10 MCQs at {diff_label} difficulty level focusing on identifying common student cognitive misconceptions in {subject} and formulating diagnostic Higher Order Thinking Skills (HOTS) remediation."}
        ]

        async def generate_module_qs(spec: Dict[str, Any]) -> List[Dict[str, Any]]:
            count = spec["count"]
            prompt = f"""
You are DEVGYA's Chief Assessment Architect for the National Teacher Skills Olympiad (TSO).
Difficulty Target: {diff_label} Level.
{spec["prompt"]}

STRICT REQUIREMENTS:
1. Generate EXACTLY {count} distinct multiple choice questions.
2. Every question must have exactly 4 options: ["(A) ...", "(B) ...", "(C) ...", "(D) ..."]
3. "correct_answer" must be the 0-based integer index of the correct option (0, 1, 2, or 3).
4. Provide a clear, insightful conceptual "explanation" for each question.
5. Return strictly valid JSON array matching this format:
[
  {{
    "question_text": "Detailed question text...",
    "options": ["(A) Option A", "(B) Option B", "(C) Option C", "(D) Option D"],
    "correct_answer": 0,
    "explanation": "Detailed explanation why this option is correct."
  }}
]
"""
            try:
                raw = await ai_provider.chat_completion(
                    [
                        {"role": "system", "content": "You are a senior CBSE/NCERT curriculum and pedagogy assessment expert. Respond ONLY with a valid JSON array of questions."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.4,
                    max_tokens=4000,
                    response_format_json=True
                )
                text = (raw or "").strip()
                if "```json" in text:
                    text = text.split("```json", 1)[1].split("```", 1)[0].strip()
                elif "```" in text:
                    text = text.split("```", 1)[1].split("```", 1)[0].strip()
                if "[" in text and "]" in text:
                    text = text[text.find("["):text.rfind("]") + 1].strip()

                parsed = json.loads(text)
                if isinstance(parsed, dict) and "questions" in parsed:
                    parsed = parsed["questions"]
                
                results = []
                for item in parsed[:count]:
                    corr = item.get("correct_answer", 0)
                    if isinstance(corr, str) and corr.isdigit(): corr = int(corr)
                    elif isinstance(corr, str) and corr.strip().upper() in ["A", "B", "C", "D"]: corr = ord(corr.strip().upper()) - 65
                    results.append({
                        "section": spec["section"],
                        "module": spec["module"],
                        "question_text": item.get("question_text", "Sample Question"),
                        "options": item.get("options", ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"]),
                        "correct_answer": corr if isinstance(corr, int) and 0 <= corr <= 3 else 0,
                        "explanation": item.get("explanation", "Conceptual answer explanation.")
                    })
                
                # Fill up to count if short
                while len(results) < count:
                    idx = len(results) + 1
                    results.append({
                        "section": spec["section"],
                        "module": spec["module"],
                        "question_text": f"[{spec['module']} - Item {idx}] Which pedagogical strategy best reinforces student conceptual mastery in {subject}?",
                        "options": [
                            "(A) Differentiated experiential learning with active scaffolding",
                            "(B) Memorizing rote definitions without application",
                            "(C) Skipping conceptual practice to finish early",
                            "(D) Restricting questions strictly to basic recall"
                        ],
                        "correct_answer": 0,
                        "explanation": "Active pedagogical scaffolding and differentiated tasks foster lasting conceptual retention."
                    })
                return results[:count]
            except Exception as e:
                logger.error(f"Error generating module {spec['module']}: {e}")
                # Fallback to structured templates
                fallback = []
                for i in range(count):
                    fallback.append({
                        "section": spec["section"],
                        "module": spec["module"],
                        "question_text": f"[{spec['module']} - Q{i+1}] In modern CBSE {subject} instruction, which competency approach best ensures deep learning?",
                        "options": [
                            "(A) Real-world problem solving and critical analysis",
                            "(B) Rote repetition of textbook formulas",
                            "(C) Eliminating classroom inquiry",
                            "(D) Purely subjective non-standardized marking"
                        ],
                        "correct_answer": 0,
                        "explanation": "Competency-based education prioritizes real-world problem solving and critical reasoning."
                    })
                return fallback

        # Generate all 6 modules
        all_questions = []
        for spec in modules_spec:
            module_qs = await generate_module_qs(spec)
            all_questions.extend(module_qs)

        # Assemble unified 100 questions with numbers and IDs
        final_questions = []
        for idx, q in enumerate(all_questions[:100]):
            q_num = idx + 1
            final_questions.append({
                "id": q_num,
                "question_number": q_num,
                "question_type": "mcq",
                "section": q["section"],
                "module": q["module"],
                "question_text": q["question_text"],
                "options": q["options"],
                "correct_answer": q["correct_answer"],
                "answer": q["options"][q["correct_answer"]] if 0 <= q["correct_answer"] < len(q["options"]) else q["options"][0],
                "explanation": q["explanation"],
                "marks": 1
            })

        new_id = f"tso-ai-{int(time.time() * 1000) % 1000000:06d}"
        created_paper = {
            "id": new_id,
            "title": paper_title,
            "class_name": class_name,
            "subject": subject,
            "board": "CBSE / National Standard",
            "chapter": "60/40 Hybrid Structure (Pedagogy + Subject Mastery)",
            "difficulty": "Advanced",
            "total_marks": 100,
            "time_allowed_mins": 60,
            "school_name": school_name,
            "source": "tso_ai_synthesizer",
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "start_time": start_time or time.strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": end_time or "2026-12-31 23:59:59",
            "published": True,  # Auto-activate for Olympiad
            "instructions": [
                "Total 100 Multiple Choice Questions (1 Mark Each • No Negative Marking).",
                "Part-A carries 60% weightage (60 Questions) covering CBSE CPD, Scenarios & Modern Pedagogy.",
                "Part-B carries 40% weightage (40 Questions) covering Core Subject Depth, TLM & HOTS.",
                "Total Duration: 60 Minutes."
            ],
            "questions": final_questions
        }

        papers = self.get_all_papers()
        # Mark other papers as unpublished if this is published
        for p in papers:
            p["published"] = False
        papers.insert(0, created_paper)

        with open(PAPERS_FILE, "w", encoding="utf-8") as f:
            json.dump(papers, f, indent=2)

        return {"status": "success", "paper": created_paper}

    def update_paper_question(self, paper_id: str, q_id: int, q_data: Dict[str, Any]) -> Dict[str, Any]:
        """Allows Super Admin to edit any question text, options, answer, or explanation."""
        try:
            papers = self.get_all_papers()
            target_paper = next((p for p in papers if p["id"] == paper_id), None)
            if not target_paper:
                return {"status": "error", "message": "Paper not found"}

            questions = target_paper.get("questions", [])
            target_q = next((q for q in questions if q.get("id") == q_id or q.get("question_number") == q_id), None)
            if not target_q:
                return {"status": "error", "message": f"Question {q_id} not found in paper"}

            if "question_text" in q_data: target_q["question_text"] = q_data["question_text"]
            if "options" in q_data: target_q["options"] = q_data["options"]
            if "correct_answer" in q_data:
                target_q["correct_answer"] = int(q_data["correct_answer"])
                if 0 <= target_q["correct_answer"] < len(target_q["options"]):
                    target_q["answer"] = target_q["options"][target_q["correct_answer"]]
            if "explanation" in q_data: target_q["explanation"] = q_data["explanation"]
            if "module" in q_data: target_q["module"] = q_data["module"]
            if "section" in q_data: target_q["section"] = q_data["section"]

            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump(papers, f, indent=2)

            return {"status": "success", "updated_question": target_q, "paper": target_paper}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def update_paper_schedule(self, paper_id: str, title: Optional[str], start_time: str, end_time: str, published: bool = True) -> Dict[str, Any]:
        """Allows Super Admin to update title, start date/time, end date/time, and activation status."""
        try:
            papers = self.get_all_papers()
            target_paper = next((p for p in papers if p["id"] == paper_id), None)
            if not target_paper:
                return {"status": "error", "message": "Paper not found"}

            if title: target_paper["title"] = title
            target_paper["start_time"] = start_time
            target_paper["end_time"] = end_time
            target_paper["published"] = published

            if published:
                # Ensure only one paper is primary active
                for p in papers:
                    if p["id"] != paper_id:
                        p["published"] = False

            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump(papers, f, indent=2)

            return {"status": "success", "updated_paper": target_paper}
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
