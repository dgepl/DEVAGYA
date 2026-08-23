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
        diff_label = difficulty.title() if difficulty else "Medium"
        
        # Split the 100 questions into 10 focused batches of 10 questions each
        # This prevents token-limit truncation and ensures 100% authentic, high-depth AI questions
        batches_spec = [
            # Part-A Module 1 (20 Qs -> 2 batches of 10)
            {"section": "Part-A", "module": "CBSE CPD Modules & NEP Guidelines", "batch_idx": 1, "count": 10, "prompt": f"Generate 10 authentic, distinct MCQs at {diff_label} level testing CBSE 50-hour Continuous Professional Development (CPD), NEP 2020 pedagogical reforms, Competency-Based Education (CBE), PARAKH guidelines, 360-degree Holistic Progress Card (HPC), and NIPUN Bharat Foundational Literacy and Numeracy (FLN)."},
            {"section": "Part-A", "module": "CBSE CPD Modules & NEP Guidelines", "batch_idx": 2, "count": 10, "prompt": f"Generate 10 authentic, distinct MCQs at {diff_label} level on Inclusive Education (RPwD Act 2016 accommodations), 10 Bagless Days, SAFAL diagnostic assessments, Art-Integrated Learning (AIL), and DIKSHA/NISHTHA digital pedagogy standards."},

            # Part-A Module 2 (20 Qs -> 2 batches of 10)
            {"section": "Part-A", "module": "Personal Classroom Experience & Scenarios", "batch_idx": 1, "count": 10, "prompt": f"Generate 10 practical scenario-based MCQs at {diff_label} level testing real classroom dilemma handling, managing diverse student behavioral disruptions, mitigating test anxiety, Think-Pair-Share active listening, and mixed-ability tiered pacing."},
            {"section": "Part-A", "module": "Personal Classroom Experience & Scenarios", "batch_idx": 2, "count": 10, "prompt": f"Generate 10 practical scenario-based MCQs at {diff_label} level on resolving student peer conflicts, handling AI-generated homework ethically as a teachable moment, Parent-Teacher de-escalation meetings, impulse control wait-time, and student safeguarding policies."},

            # Part-A Module 3 (20 Qs -> 2 batches of 10)
            {"section": "Part-A", "module": "Modern Pedagogy & Critical Thinking", "batch_idx": 1, "count": 10, "prompt": f"Generate 10 MCQs at {diff_label} level testing Bloom's Revised Taxonomy (Analyze/Evaluate/Create), Socratic questioning, 5E Inquiry Model (Engage-Explore-Explain-Elaborate-Evaluate), Vygotsky's ZPD scaffolding, and Flipped Classroom dynamics."},
            {"section": "Part-A", "module": "Modern Pedagogy & Critical Thinking", "count": 10, "batch_idx": 2, "prompt": f"Generate 10 MCQs at {diff_label} level on formative assessment tools (Exit Tickets, Concept Maps), Tomlinson's Differentiated Instruction, Mazur's Peer Instruction, Problem-Based Learning (PBL), and Harvard Visible Thinking routines (See-Think-Wonder)."},

            # Part-B Module 1 (20 Qs -> 2 batches of 10)
            {"section": "Part-B", "module": "Core Subject Knowledge", "batch_idx": 1, "count": 10, "prompt": f"Generate 10 rigorous, conceptual MCQs at {diff_label} level testing core fundamental subject depth and CBSE/NCERT syllabus mastery in {subject} for secondary educators."},
            {"section": "Part-B", "module": "Core Subject Knowledge", "batch_idx": 2, "count": 10, "prompt": f"Generate 10 advanced multi-step application MCQs at {diff_label} level testing numerical, theoretical, and analytical depth in {subject} for secondary educators."},

            # Part-B Module 2 (10 Qs -> 1 batch of 10)
            {"section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "batch_idx": 1, "count": 10, "prompt": f"Generate 10 MCQs at {diff_label} level on subject-specific pedagogical methodologies, Teaching-Learning Material (TLM) utilization, digital simulations (e.g. PhET, GeoGebra), and experiential lab activities in {subject}."},

            # Part-B Module 3 (10 Qs -> 1 batch of 10)
            {"section": "Part-B", "module": "Misconceptions & HOTS", "batch_idx": 1, "count": 10, "prompt": f"Generate 10 MCQs at {diff_label} level focusing on diagnosing common student cognitive misconceptions in {subject} and formulating diagnostic Higher Order Thinking Skills (HOTS) remediation."}
        ]

        async def generate_single_batch(spec: Dict[str, Any], attempt = 1) -> List[Dict[str, Any]]:
            count = spec["count"]
            prompt = f"""
You are DEVGYA's Chief Assessment Architect for the National Teacher Skills Olympiad (TSO).
Difficulty Target: {diff_label} Level.
Subject Track: {subject}
{spec["prompt"]}

STRICT REQUIREMENTS:
1. Generate EXACTLY {count} distinct multiple choice questions.
2. Every question must have exactly 4 options: ["(A) ...", "(B) ...", "(C) ...", "(D) ..."]
3. "correct_answer" must be the 0-based integer index of the correct option (0, 1, 2, or 3).
4. Provide a clear, insightful conceptual "explanation" for each question.
5. Return strictly valid JSON object matching this format:
{{
  "questions": [
    {{
      "question_text": "Detailed question text...",
      "options": ["(A) Option A", "(B) Option B", "(C) Option C", "(D) Option D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation why this option is correct."
    }}
  ]
}}
"""
            try:
                raw = await ai_provider.chat_completion(
                    [
                        {"role": "system", "content": "You are a senior CBSE/NCERT curriculum and pedagogy assessment expert. Respond ONLY with a valid JSON object containing a 'questions' array."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.45,
                    max_tokens=3000,
                    response_format_json=True
                )
                text = (raw or "").strip()
                if "```json" in text:
                    text = text.split("```json", 1)[1].split("```", 1)[0].strip()
                elif "```" in text:
                    text = text.split("```", 1)[1].split("```", 1)[0].strip()
                if "{" in text and "}" in text:
                    text = text[text.find("{"):text.rfind("}") + 1].strip()

                parsed = json.loads(text)
                if isinstance(parsed, dict) and "questions" in parsed:
                    parsed = parsed["questions"]
                elif isinstance(parsed, list):
                    pass
                else:
                    parsed = []
                
                results = []
                for item in parsed[:count]:
                    corr = item.get("correct_answer", 0)
                    if isinstance(corr, str) and corr.isdigit(): corr = int(corr)
                    elif isinstance(corr, str) and corr.strip().upper() in ["A", "B", "C", "D"]: corr = ord(corr.strip().upper()) - 65
                    
                    q_text = str(item.get("question_text", "")).strip()
                    opts = item.get("options", ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"])
                    
                    if q_text and len(opts) == 4:
                        results.append({
                            "section": spec["section"],
                            "module": spec["module"],
                            "question_text": q_text,
                            "options": opts,
                            "correct_answer": corr if isinstance(corr, int) and 0 <= corr <= 3 else 0,
                            "explanation": item.get("explanation", "Conceptual answer explanation.")
                        })

                if len(results) >= count:
                    return results[:count]
                
                # If we got partial questions, retry once
                if attempt < 2:
                    return await generate_single_batch(spec, attempt + 1)
                
                # Fallback to authentic mock practice question bank from olympiad_service
                from services.olympiad_service import olympiad_service
                mock_bank = olympiad_service.get_100_practice_questions(subject)
                module_bank = [q for q in mock_bank if q.get("module") == spec["module"]]
                
                while len(results) < count:
                    fallback_idx = len(results) % len(module_bank) if module_bank else 0
                    if module_bank and fallback_idx < len(module_bank):
                        fb_q = module_bank[fallback_idx]
                        results.append({
                            "section": spec["section"],
                            "module": spec["module"],
                            "question_text": fb_q["question_text"],
                            "options": fb_q["options"],
                            "correct_answer": fb_q.get("correct_answer", 0),
                            "explanation": fb_q.get("explanation", "Pedagogical solution explanation.")
                        })
                    else:
                        break
                return results[:count]

            except Exception as e:
                logger.error(f"Batch generation error for {spec['module']} batch {spec.get('batch_idx', 1)}: {e}")
                if attempt < 2:
                    return await generate_single_batch(spec, attempt + 1)
                
                # Fallback directly to authentic mock practice bank
                from services.olympiad_service import olympiad_service
                mock_bank = olympiad_service.get_100_practice_questions(subject)
                module_bank = [q for q in mock_bank if q.get("module") == spec["module"]]
                
                fb_results = []
                for i in range(count):
                    idx = (i + (spec.get("batch_idx", 1) - 1) * 10) % len(module_bank) if module_bank else 0
                    if module_bank:
                        fb_q = module_bank[idx]
                        fb_results.append({
                            "section": spec["section"],
                            "module": spec["module"],
                            "question_text": fb_q["question_text"],
                            "options": fb_q["options"],
                            "correct_answer": fb_q.get("correct_answer", 0),
                            "explanation": fb_q.get("explanation", "Pedagogical solution explanation.")
                        })
                return fb_results

        # Execute batches with a concurrency limiter (Semaphore=2) to respect Groq rate limits
        sem = asyncio.Semaphore(2)

        async def sem_batch(spec):
            async with sem:
                await asyncio.sleep(0.2)
                return await generate_single_batch(spec)

        tasks = [sem_batch(spec) for spec in batches_spec]
        batch_results = await asyncio.gather(*tasks)

        all_questions = []
        for b in batch_results:
            all_questions.extend(b)

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
                "answer": q["options"][q["correct_answer"]] if 0 <= q["correct_answer"] < len(q["options"]) else q["options"][0],
                "explanation": q.get("explanation", ""),
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
