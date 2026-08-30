import json
import logging
import time
import os
import re
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

    def get_active_olympiad_paper(self, subject: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Returns the currently active published Olympiad paper for candidates."""
        papers = self.get_all_papers()
        if not papers:
            return None

        # 1. Match published paper for this specific subject track
        if subject:
            subj_clean = subject.strip().lower()
            for p in papers:
                p_subj = p.get("subject", "").strip().lower()
                if p.get("published") is True and (p_subj == subj_clean or subj_clean in p_subj or p_subj in subj_clean):
                    return p

        # 2. Fallback to latest published paper
        for p in papers:
            if p.get("published") is True:
                return p

        # 3. If no paper is published, return None to lock assessment
        return None

    def create_paper_manual(self, paper_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            papers = self.get_all_papers()
            new_id = f"paper-{int(time.time() * 1000) % 1000000:06d}"
            
            is_published = paper_data.get("published", True)
            subj = paper_data.get("subject", "Science")

            if is_published:
                # Deactivate previously active paper for this subject track
                for p in papers:
                    if p.get("subject", "").strip().lower() == subj.strip().lower():
                        p["published"] = False

            created_paper = {
                "id": new_id,
                "title": paper_data.get("title", f"TSO 2026 Official Paper — {subj}"),
                "class_name": paper_data.get("class_name", "Class 10"),
                "subject": subj,
                "board": paper_data.get("board", "CBSE"),
                "chapter": paper_data.get("chapter", "Full Syllabus 60/40 Blueprint"),
                "difficulty": paper_data.get("difficulty", "medium"),
                "total_marks": len(paper_data.get("questions", [])) or paper_data.get("total_marks", 100),
                "time_allowed_mins": paper_data.get("time_allowed_mins", 60),
                "school_name": paper_data.get("school_name", "DEVGYA GLOBAL EDUTECH"),
                "source": "manual",
                "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "start_time": paper_data.get("start_time") or time.strftime("%Y-%m-%d %H:%M:%S"),
                "end_time": paper_data.get("end_time") or "2026-12-31 23:59:59",
                "published": is_published,
                "instructions": paper_data.get("instructions", [
                    "Total 100 Multiple Choice Questions (1 Mark Each • No Negative Marking).",
                    "Part-A carries 60% weightage (60 Questions) covering CBSE CPD, Scenarios & Modern Pedagogy.",
                    "Part-B carries 40% weightage (40 Questions) covering Core Subject Depth, TLM & HOTS.",
                    "Total Duration: 60 Minutes."
                ]),
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
        AI-Powered Generator for the Master 100-MCQ 60/40 Hybrid Structure.
        """
        try:
            paper_title = title or f"National Teacher Skills Olympiad 2026 — {subject.upper()}"
            
            from services.olympiad_service import generate_100_practice_mock_questions
            base_100 = generate_100_practice_mock_questions(subject=subject)

            # Attempt dynamic AI generation for Part-B (40 MCQs strictly for selected subject)
            ai_part_b_qs = []
            try:
                prompt = f"""You are the Chief Examination Controller for the National Teacher Skills Olympiad (TSO).
Generate 40 Advanced Multiple Choice Questions (MCQs) for teachers strictly in subject '{subject}'.
Structure:
- Module 4: Core {subject} Knowledge & Theoretical/Numerical Concepts (20 MCQs)
- Module 5: {subject} Pedagogical Content Knowledge & TLM/Labs/Simulations (10 MCQs)
- Module 6: {subject} Common Student Cognitive Misconceptions & HOTS Remediation (10 MCQs)

STRICT REQUIREMENTS:
1. All 40 questions MUST be 100% focused on {subject}.
2. Every question must have 4 options: ["(A) ...", "(B) ...", "(C) ...", "(D) ..."]
3. "correct_answer" must be 0, 1, 2, or 3.
4. Return strictly valid JSON matching:
{{"questions": [{{"module": "Core Subject Knowledge", "question_text": "...", "options": ["(A)...", "(B)...", "(C)...", "(D)..."], "correct_answer": 0, "explanation": "..."}}]}}"""

                raw = await asyncio.wait_for(
                    ai_provider.chat_completion(
                        messages=[
                            {"role": "system", "content": f"You are an expert CBSE/NCERT curriculum and examination designer specialized in {subject}. Respond ONLY in valid JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.7,
                        max_tokens=4000,
                        response_format_json=True
                    ),
                    timeout=10.0
                )
                parsed = json.loads(raw)
                ai_list = parsed.get("questions") or parsed.get("mcqs") or []
                for item in ai_list:
                    if isinstance(item, dict) and item.get("question_text") and len(item.get("options", [])) >= 4:
                        corr = item.get("correct_answer", 0)
                        if isinstance(corr, str) and corr.isdigit(): corr = int(corr)
                        elif isinstance(corr, str) and corr.strip().upper() in ["A", "B", "C", "D"]: corr = ord(corr.strip().upper()) - 65
                        else: corr = int(corr) if isinstance(corr, (int, float)) else 0
                        
                        mod_name = item.get("module") or f"{subject} Mastery"
                        ai_part_b_qs.append({
                            "section": f"Part-B: Subject Depth & Discipline Mastery (40% Weightage) — {subject}",
                            "module": mod_name,
                            "question_text": re.sub(r'^\s*\[.*?\]\s*', '', str(item["question_text"])).strip(),
                            "options": item["options"][:4],
                            "correct_answer": corr % 4,
                            "explanation": item.get("explanation", f"Core pedagogical and conceptual principle in {subject}.")
                        })
            except Exception as ai_err:
                logger.info(f"[TSO Synthesis] AI generation fallback to domain-verified {subject} bank: {ai_err}")

            # Assemble unified 100 questions: Part-A (1..60 Pedagogy) + Part-B (61..100 Subject)
            final_questions = []
            for idx in range(100):
                q_num = idx + 1
                if idx >= 60 and (idx - 60) < len(ai_part_b_qs):
                    q = ai_part_b_qs[idx - 60]
                    corr = q["correct_answer"]
                    opts = q["options"]
                    cleaned_stem = q["question_text"]
                    sec = q["section"]
                    mod = q["module"]
                    expl = q.get("explanation", "")
                else:
                    base_q = base_100[idx] if idx < len(base_100) else base_100[idx % len(base_100)]
                    cleaned_stem = re.sub(r'^\s*\[.*?\]\s*', '', str(base_q.get("question_text", ""))).strip()
                    opts = base_q.get("options", ["(A)", "(B)", "(C)", "(D)"])
                    corr = int(base_q.get("correct_answer", 0)) % len(opts)
                    sec = base_q.get("section", "Part-A" if q_num <= 60 else f"Part-B: Subject Depth — {subject}")
                    mod = base_q.get("module", "General Pedagogy" if q_num <= 60 else f"{subject} Core Mastery")
                    expl = base_q.get("explanation", "")

                final_questions.append({
                    "id": q_num,
                    "question_number": q_num,
                    "question_type": "mcq",
                    "section": sec,
                    "module": mod,
                    "question_text": cleaned_stem,
                    "options": opts,
                    "answer": opts[corr] if 0 <= corr < len(opts) else opts[0],
                    "explanation": expl,
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
            for p in papers:
                p["published"] = False
            papers.insert(0, created_paper)

            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump(papers, f, indent=2)

            return {"status": "success", "paper": created_paper}
        except Exception as e:
            logger.error(f"[TSO Generation Error]: {e}", exc_info=True)
            return {"status": "error", "message": f"TSO Synthesis Error: {str(e)}"}

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
                # Deactivate previously active paper for this subject track
                subj = target_paper.get("subject", "").strip().lower()
                for p in papers:
                    if p["id"] != paper_id and p.get("subject", "").strip().lower() == subj:
                        p["published"] = False

            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump(papers, f, indent=2)

            return {"status": "success", "updated_paper": target_paper}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def update_paper(self, paper_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Allows Super Admin to edit general paper fields like title, timings, published state, etc."""
        try:
            papers = self.get_all_papers()
            target_paper = next((p for p in papers if p["id"] == paper_id), None)
            if not target_paper:
                return {"status": "error", "message": "Paper not found"}

            for key, val in updates.items():
                if key != "id":
                    target_paper[key] = val

            if updates.get("published") is True:
                subj = target_paper.get("subject", "").strip().lower()
                for p in papers:
                    if p["id"] != paper_id and p.get("subject", "").strip().lower() == subj:
                        p["published"] = False

            with open(PAPERS_FILE, "w", encoding="utf-8") as f:
                json.dump(papers, f, indent=2)

            return {"status": "success", "paper": target_paper}
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
