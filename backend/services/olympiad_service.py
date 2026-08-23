import json
import logging
import os
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from services.paper_service import paper_service

load_dotenv()
logger = logging.getLogger("olympiad_service")

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

QUESTIONS_FILE = DATA_DIR / "olympiad_questions.json"
SUBMISSIONS_FILE = DATA_DIR / "olympiad_submissions.json"
PRACTICE_FILE = DATA_DIR / "olympiad_practice.json"
TSO_REGISTRATIONS_FILE = DATA_DIR / "tso_registrations.json"

# ============================================================================
# 100 DEDICATED PRACTICE MOCK QUESTIONS (PART-A 60 Qs + PART-B 40 Qs)
# ============================================================================

def generate_100_practice_mock_questions(subject: str = "Science") -> List[Dict[str, Any]]:
    """Generates 100 structured practice questions for the Mock Practice Hall."""
    mock_qs = []
    
    # --- PART A: 60 UNIVERSAL PEDAGOGY QUESTIONS ---
    # A1: CBSE CPD & NEP (20 Qs)
    for i in range(1, 21):
        mock_qs.append({
            "id": f"prac-cpd-{i}",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": f"[Practice CPD/NEP #{i}] Under CBSE & NEP 2020 framework, what is the core requirement for continuous professional development?",
            "options": [
                "(A) Minimum 50 mandatory annual training hours in competency pedagogy & leadership",
                "(B) 5 hours of administrative paperwork only",
                "(C) Purely theoretical rote examinations",
                "(D) Voluntary attendance without learning outcomes"
            ],
            "correct_answer": 0,
            "explanation": "NEP 2020 mandates at least 50 hours of continuous professional development per year for teachers to continuously upgrade pedagogical competency."
        })

    # A2: Classroom Scenarios & Experience (20 Qs)
    for i in range(1, 21):
        mock_qs.append({
            "id": f"prac-scen-{i}",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": f"[Practice Classroom Scenario #{i}] When students struggle with conceptual grasp in a mixed-ability classroom, which teacher intervention is most effective?",
            "options": [
                "(A) Providing tiered scaffolding, visual models, and collaborative peer learning",
                "(B) Punishing students who ask doubts repeatedly",
                "(C) Skipping the topic to maintain syllabus timeline",
                "(D) Asking students to memorize solutions verbatim"
            ],
            "correct_answer": 0,
            "explanation": "Scaffolding and peer collaboration provide multi-sensory reinforcement and psychological safety in diverse classrooms."
        })

    # A3: Modern Pedagogy & Critical Thinking (20 Qs)
    for i in range(1, 21):
        mock_qs.append({
            "id": f"prac-ped-{i}",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": f"[Practice Pedagogy #{i}] How does Higher Order Thinking Skills (HOTS) framing benefit secondary school learners?",
            "options": [
                "(A) It develops analytical synthesis, hypothesis testing, and logical evaluation",
                "(B) It reduces examination pass percentages",
                "(C) It replaces all hands-on lab experiments",
                "(D) It limits questions to simple one-word recall"
            ],
            "correct_answer": 0,
            "explanation": "HOTS questions challenge students beyond rote memory into Bloom's upper cognitive domains (Analyze, Evaluate, Create)."
        })

    # --- PART B: 40 SUBJECT PRACTICE QUESTIONS ---
    # B1: Core Subject Knowledge (20 Qs)
    for i in range(1, 21):
        mock_qs.append({
            "id": f"prac-core-{i}",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": f"[Practice {subject} Core #{i}] In NCERT/CBSE curriculum for {subject}, which fundamental principle is key to progressive conceptual mastery?",
            "options": [
                f"(A) Connecting concrete empirical phenomena to abstract {subject} principles",
                "(B) Memorizing formulas without understanding derivation",
                "(C) Ignoring intermediate grade prerequisites",
                "(D) Treating chapters as disconnected theoretical facts"
            ],
            "correct_answer": 0,
            "explanation": f"Establishing conceptual bridges from empirical observations to formal theoretical models ensures lasting mastery in {subject}."
        })

    # B2: Subject Pedagogical Knowledge & TLM (10 Qs)
    for i in range(1, 11):
        mock_qs.append({
            "id": f"prac-tlm-{i}",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": f"[Practice {subject} TLM #{i}] Which Teaching-Learning Material (TLM) best supports experiential learning in {subject}?",
            "options": [
                f"(A) Interactive dynamic digital simulations (PhET / 3D models) and hands-on kits",
                "(B) Monochrome textbook diagrams without discussion",
                "(C) Passive one-way chalkboard lectures only",
                "(D) Reading definitions in silence"
            ],
            "correct_answer": 0,
            "explanation": f"Interactive TLMs and simulations help students construct intuitive models of abstract {subject} phenomena."
        })

    # B3: Misconceptions & HOTS (10 Qs)
    for i in range(1, 11):
        mock_qs.append({
            "id": f"prac-hots-{i}",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": f"[Practice {subject} HOTS #{i}] What is the best strategy to address a persistent student misconception in {subject}?",
            "options": [
                "(A) Conducting cognitive conflict experiments and guided Socratic debriefing",
                "(B) Penalizing mistakes heavily to force compliance",
                "(C) Ignoring misconceptions assuming they disappear automatically",
                "(D) Repeating definitions loudly"
            ],
            "correct_answer": 0,
            "explanation": "Cognitive conflict enables learners to confront anomalies in their mental models and reconstruct scientifically valid concepts."
        })

    return mock_qs

class OlympiadService:
    def __init__(self):
        self._ensure_files()

    def _ensure_files(self):
        if not SUBMISSIONS_FILE.exists():
            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump([], f)
        if not TSO_REGISTRATIONS_FILE.exists():
            with open(TSO_REGISTRATIONS_FILE, "w", encoding="utf-8") as f:
                json.dump({}, f)

    def get_active_exam_paper(self, subject: str = "Science", level: str = "Secondary") -> Dict[str, Any]:
        """
        Fetches the official Super Admin published paper.
        If no paper is published yet, falls back to the structured 100-MCQ blueprint paper.
        """
        admin_paper = paper_service.get_active_olympiad_paper()
        if admin_paper and admin_paper.get("questions"):
            return admin_paper

        # If no custom paper published, generate structured master blueprint
        return {
            "id": f"tso-national-2026-{subject.lower()}",
            "title": f"National Teacher Skills Olympiad (TSO) 2026 — {subject.upper()}",
            "subject": subject,
            "category_level": level,
            "duration_minutes": 60,
            "total_questions": 100,
            "total_marks": 100,
            "start_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": "2026-12-31 23:59:59",
            "published": True,
            "questions": generate_100_practice_mock_questions(subject=subject)
        }

    def get_100_practice_questions(self, subject: str = "Science", module: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns 100 mock practice questions for practice drills."""
        all_qs = generate_100_practice_mock_questions(subject=subject)
        if module and module != "all":
            return [q for q in all_qs if q.get("module") == module or q.get("section") == module]
        return all_qs

    def evaluate_practice_answer(self, question_id: str, selected_option: int, subject: str = "Science") -> Dict[str, Any]:
        """Instantly evaluates practice answer and returns explanation."""
        all_qs = generate_100_practice_mock_questions(subject=subject)
        target = next((q for q in all_qs if q["id"] == question_id), None)
        if not target:
            return {"status": "error", "message": "Question not found"}

        is_correct = (selected_option == target.get("correct_answer", 0))
        return {
            "status": "success",
            "question_id": question_id,
            "is_correct": is_correct,
            "correct_answer": target.get("correct_answer", 0),
            "explanation": target.get("explanation", "Conceptual answer explanation.")
        }

    def register_tso_candidate(self, email: str, details: Dict[str, Any]) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        regs = {}
        if TSO_REGISTRATIONS_FILE.exists():
            try:
                with open(TSO_REGISTRATIONS_FILE, "r", encoding="utf-8") as f:
                    regs = json.load(f)
            except Exception:
                regs = {}

        record = {
            "email": email_clean,
            "name": details.get("name", "Educator"),
            "phone": details.get("phone", ""),
            "state": details.get("state", ""),
            "district": details.get("district", ""),
            "tso_subject": details.get("tso_subject", "Science"),
            "category_level": details.get("category_level", "Secondary"),
            "medium": details.get("medium", "English"),
            "is_tso_registered": True,
            "trial_activated": True,
            "trial_expires_at": details.get("trial_expires_at", "15 Days Access"),
            "registered_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        regs[email_clean] = record
        with open(TSO_REGISTRATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(regs, f, indent=2)

        return {"status": "success", "registration": record}

    def submit_100_exam(self, submission_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            sub_id = f"tso-sub-{int(time.time()*1000)}"
            teacher_email = submission_data.get("teacher_email", "").strip().lower()
            teacher_name = submission_data.get("teacher_name", "Educator")
            subject = submission_data.get("subject", "Science")
            user_answers = submission_data.get("answers", {})

            submission_record = {
                "id": sub_id,
                "paper_id": submission_data.get("paper_id", f"tso-national-2026-{subject.lower()}"),
                "teacher_email": teacher_email,
                "teacher_name": teacher_name,
                "subject": subject,
                "state": submission_data.get("state", ""),
                "district": submission_data.get("district", ""),
                "submitted_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "answers": user_answers,
                "total_questions": 100,
                "answered_count": len(user_answers),
                "review_status": "pending_admin_review",
                "published": False,
                "official_score": None,
                "merit_rank": None,
                "district_rank": None,
                "state_rank": None,
                "badges_awarded": [],
                "proctor_incidents": submission_data.get("proctor_incidents", 0),
                "time_taken_seconds": submission_data.get("time_taken_seconds", 3600)
            }

            submissions = []
            if SUBMISSIONS_FILE.exists():
                try:
                    with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
                        submissions = json.load(f)
                except Exception:
                    submissions = []

            submissions.insert(0, submission_record)
            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(submissions, f, indent=2)

            return {
                "status": "success",
                "message": "Your 100-MCQ assessment has been submitted successfully and archived securely. Official merit rankings and scorecards will be declared by the administration committee.",
                "submission_id": sub_id,
                "review_status": "pending_admin_review"
            }
        except Exception as e:
            logger.error(f"Error saving 100 exam submission: {e}")
            return {"status": "error", "message": str(e)}

    def get_all_submissions(self) -> List[Dict[str, Any]]:
        if SUBMISSIONS_FILE.exists():
            try:
                with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error reading submissions: {e}")
        return []

    def get_published_results(self, teacher_email: Optional[str] = None) -> List[Dict[str, Any]]:
        submissions = self.get_all_submissions()
        published = [s for s in submissions if s.get("published") is True]
        if teacher_email:
            clean = teacher_email.strip().lower()
            return [s for s in published if s.get("teacher_email") == clean]
        return published

olympiad_service = OlympiadService()
