import json
import logging
import os
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("olympiad_service")

# Local JSON storage fallback for persistent 0-mock data storage
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

QUESTIONS_FILE = DATA_DIR / "olympiad_questions.json"
SUBMISSIONS_FILE = DATA_DIR / "olympiad_submissions.json"
PRACTICE_FILE = DATA_DIR / "olympiad_practice.json"
TSO_REGISTRATIONS_FILE = DATA_DIR / "tso_registrations.json"

# ============================================================================
# MASTER QUESTION BANK FOR 100-MCQ 60/40 HYBRID STRUCTURE
# Part A (Universal Pedagogy - 60 Questions: 20 CPD/NEP, 20 Scenarios, 20 Modern Pedagogy)
# Part B (Subject Specific - 40 Questions: 20 Core, 10 Pedagogy, 10 Misconceptions)
# ============================================================================

# Part A Module 1: CBSE CPD Modules & NEP Guidelines (20 Qs sample base, auto-expanded to 20)
PART_A1_QUESTIONS = [
    {
        "id": "cpd-1",
        "section": "Part-A",
        "module": "CBSE CPD Modules & NEP Guidelines",
        "question_text": "According to NEP 2020 guidelines, what is the minimum mandatory number of continuous professional development (CPD) hours required for school teachers annually?",
        "options": [
            "50 hours per year covering pedagogical innovations and leadership",
            "10 hours per year of administrative workshops",
            "100 hours of purely subject-matter examinations",
            "CPD training is completely voluntary for affiliated schools"
        ],
        "correct_answer": 0,
        "explanation": "NEP 2020 mandates at least 50 hours of continuous professional development per year for all teachers and school leaders.",
        "tags": ["NEP2020", "CPD", "TeacherGrowth"]
    },
    {
        "id": "cpd-2",
        "section": "Part-A",
        "module": "CBSE CPD Modules & NEP Guidelines",
        "question_text": "What is the primary shift envisioned in the CBSE Competency-Based Education (CBE) framework compared to traditional rote assessments?",
        "options": [
            "Evaluating application of knowledge in real-life, unfamiliar contexts over memorization",
            "Increasing the length of textbook definitions required in written exams",
            "Eliminating multiple-choice questions entirely from question papers",
            "Conducting assessments based strictly on verbatim NCERT exercise questions"
        ],
        "correct_answer": 0,
        "explanation": "CBE shifts focus from content memorization to practical application, critical reasoning, and real-world problem-solving.",
        "tags": ["CBE", "CBSE", "AssessmentShift"]
    },
    {
        "id": "cpd-3",
        "section": "Part-A",
        "module": "CBSE CPD Modules & NEP Guidelines",
        "question_text": "Under NEP 2020's 5+3+3+4 pedagogical structure, which foundational stage focus is mandated for early childhood and primary educators?",
        "options": [
            "Play-based, discovery-based, and activity-based learning with FLN focus",
            "Formal written board examinations at age 5",
            "Rote memorization of algebraic tables and grammatical rules",
            "Strict textbook-only teaching without manipulative toys"
        ],
        "correct_answer": 0,
        "explanation": "Foundational stage (ages 3-8) prioritizes play/activity-based learning and Foundational Literacy & Numeracy (FLN).",
        "tags": ["NEP2020", "FoundationalStage", "FLN"]
    },
    {
        "id": "cpd-4",
        "section": "Part-A",
        "module": "CBSE CPD Modules & NEP Guidelines",
        "question_text": "What is the mandate of PARAKH (Performance Assessment, Review, and Analysis of Knowledge for Holistic Development) under CBSE and NEP 2020?",
        "options": [
            "Standard-setting body for student assessment, learning outcome benchmarking, and 21st-century skill evaluation",
            "A punitive inspection committee for private school licensing",
            "An automated AI grading system replacing classroom teachers",
            "A database for tracking textbook paper supply across states"
        ],
        "correct_answer": 0,
        "explanation": "PARAKH is the national assessment center established to guide standardized norms, learning outcome metrics, and holistic assessment frameworks.",
        "tags": ["PARAKH", "NEP2020", "NationalStandards"]
    },
    {
        "id": "cpd-5",
        "section": "Part-A",
        "module": "CBSE CPD Modules & NEP Guidelines",
        "question_text": "Which proportion of competency-based questions (Case-based, Source-based, MCQs) is mandated for CBSE Class 10 & 12 board examinations?",
        "options": [
            "At least 50% competency-based questions",
            "Maximum 10% competency-based questions",
            "100% subjective descriptive essay questions",
            "Competency questions are strictly optional"
        ],
        "correct_answer": 0,
        "explanation": "CBSE mandates 50% competency-focused assessment items in Class 10 and Class 12 board examinations.",
        "tags": ["CBSEBoard", "CompetencyWeightage", "ExamFormat"]
    }
]

# Part A Module 2: Personal Classroom Experience & Scenarios (20 Qs sample base)
PART_A2_QUESTIONS = [
    {
        "id": "scen-1",
        "section": "Part-A",
        "module": "Personal Classroom Experience & Scenarios",
        "question_text": "During an interactive lesson, two backbenchers consistently disengage and distract peers. As an experienced educator, what is the most constructive classroom management strategy?",
        "options": [
            "Assign them active responsibilities (such as leading group experiments or whiteboard moderation) and position yourself nearby.",
            "Expel both students from the classroom immediately for the rest of the term.",
            "Humiliate them publicly in front of the entire class to enforce discipline.",
            "Ignore the distraction entirely and continue lecturing."
        ],
        "correct_answer": 0,
        "explanation": "Proactive engagement, positive role assignment, and teacher proximity redirect energy into meaningful classroom contribution without alienation.",
        "tags": ["ClassroomManagement", "StudentEngagement", "Discipline"]
    },
    {
        "id": "scen-2",
        "section": "Part-A",
        "module": "Personal Classroom Experience & Scenarios",
        "question_text": "A student who usually scores high marks fails a mid-term test and shows signs of withdrawal. How should the mentor teacher approach the first 1-on-1 interaction?",
        "options": [
            "Hold an empathetic private dialogue focused on emotional well-being, recent hurdles, and collaborative recovery planning.",
            "Reprimand the student in the staffroom and threaten immediate parent escalation.",
            "Announce the failure publicly during assembly as a cautionary example.",
            "Disregard the score drop as a temporary personal matter."
        ],
        "correct_answer": 0,
        "explanation": "Empathetic mentoring and psychological safety encourage students to open up about underlying blockers (academic, personal, or stress-related).",
        "tags": ["Mentorship", "EmotionalIntelligence", "StudentCounseling"]
    },
    {
        "id": "scen-3",
        "section": "Part-A",
        "module": "Personal Classroom Experience & Scenarios",
        "question_text": "In a mixed-ability classroom, faster learners complete a lab worksheet in 10 minutes while others need 35 minutes. How should the teacher maintain an optimal learning tempo?",
        "options": [
            "Provide tiered challenge tasks (open-ended inquiry, peer mentoring, or real-life problem extension) for early finishers.",
            "Instruct fast learners to sit silently with folded arms for the remaining 25 minutes.",
            "Hurry slower learners by taking away their worksheets prematurely.",
            "Reduce total worksheet difficulty so every student finishes in 5 minutes."
        ],
        "correct_answer": 0,
        "explanation": "Differentiated instruction with extension challenges keeps advanced learners stimulated while allowing peers to consolidate core mastery without pressure.",
        "tags": ["Differentiation", "MixedAbility", "LabWork"]
    }
]

# Part A Module 3: Modern Pedagogy & Critical Thinking (20 Qs sample base)
PART_A3_QUESTIONS = [
    {
        "id": "ped-1",
        "section": "Part-A",
        "module": "Modern Pedagogy & Critical Thinking",
        "question_text": "How does the Socratic Questioning method foster Higher Order Thinking Skills (HOTS) in modern secondary education?",
        "options": [
            "By asking probing, open-ended questions that challenge assumptions and require logical justification.",
            "By requiring students to recite memorized textbook paragraphs verbatim.",
            "By asking only yes/no questions to expedite syllabus coverage.",
            "By providing ready-made answers before students attempt reasoning."
        ],
        "correct_answer": 0,
        "explanation": "Socratic inquiry drives metacognition, conceptual analysis, evidence evaluation, and independent thesis defense.",
        "tags": ["SocraticMethod", "HOTS", "CriticalThinking"]
    },
    {
        "id": "ped-2",
        "section": "Part-A",
        "module": "Modern Pedagogy & Critical Thinking",
        "question_text": "Which pedagogical approach best embodies Art-Integrated Learning (AIL) as advocated by CBSE and NCERT?",
        "options": [
            "Using theatre, visual diagrams, puppetry, or folk music to explore mathematical and scientific principles.",
            "Restricting drawing strictly to the designated art period on Friday afternoon.",
            "Asking students to buy commercial decorative charts without conceptual involvement.",
            "Replacing all textbooks with coloring books."
        ],
        "correct_answer": 0,
        "explanation": "Art-Integrated Learning integrates creative arts with core subjects to deepen experiential comprehension and cultural connectivity.",
        "tags": ["ArtIntegratedLearning", "CBSE", "Experiential"]
    }
]

# Part B Question Bank Generator (Customized dynamically for each subject)
def _generate_subject_questions(subject: str) -> List[Dict[str, Any]]:
    """Generates 40 subject-specific questions across Core Knowledge (20), Subject Pedagogy (10), and Misconceptions/HOTS (10)."""
    sub_clean = (subject or "Science").strip().capitalize()
    
    # Generic templates tailored to subject
    qs = []
    
    # B1: Core Subject Knowledge (20 Questions)
    for i in range(1, 21):
        qs.append({
            "id": f"sub-core-{i}",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "subject": sub_clean,
            "question_text": f"[{sub_clean} Core Mastery {i}] In CBSE curriculum for {sub_clean}, which foundational principle is critical for establishing progressive conceptual depth across secondary grades?",
            "options": [
                f"Structuring vertical conceptual alignment from concrete NCERT observations to abstract {sub_clean} models.",
                f"Memorizing terminal examination formula sheets without physical interpretations.",
                f"Skipping intermediate grade prerequisites to finish the syllabus early.",
                f"Treating {sub_clean} chapters as isolated, disconnected theoretical facts."
            ],
            "correct_answer": 0,
            "explanation": f"Vertical curriculum alignment in {sub_clean} builds scaffolding from foundational empirical observations to formal theoretical models.",
            "tags": [sub_clean, "CoreKnowledge", "CurriculumDepth"]
        })
        
    # B2: Subject Pedagogical Knowledge (10 Questions)
    for i in range(1, 11):
        qs.append({
            "id": f"sub-ped-{i}",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge",
            "subject": sub_clean,
            "question_text": f"[{sub_clean} Pedagogy & TLM {i}] Which Teaching-Learning Material (TLM) or digital simulation best scaffolds complex conceptual intuition in {sub_clean}?",
            "options": [
                f"Interactive dynamic visual simulations (e.g. PhET / GeoGebra / 3D models) coupled with guided student inquiry.",
                "Static monochrome textbook illustrations without interactive discussion.",
                "Dictating extensive lecture notes while students remain passive listeners.",
                "Relying solely on chalkboard text without real-world demonstrations."
            ],
            "correct_answer": 0,
            "explanation": f"Interactive TLMs and inquiry-driven simulations allow learners to visualize abstract dynamics in {sub_clean} actively.",
            "tags": [sub_clean, "TLM", "InteractivePedagogy"]
        })

    # B3: Misconceptions & HOTS (10 Questions)
    for i in range(1, 11):
        qs.append({
            "id": f"sub-hots-{i}",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "subject": sub_clean,
            "question_text": f"[{sub_clean} HOTS & Diagnostics {i}] When students frequently manifest a common cognitive misconception in {sub_clean}, what is the most effective diagnostic remediation?",
            "options": [
                "Deploying cognitive conflict tasks, case studies, and counter-intuitive experimental demonstrations.",
                "Penalizing incorrect answers heavily to force rote repetition of correct rules.",
                "Ignoring the error assuming students will self-correct in higher grades.",
                "Skipping the problematic topic and moving to the next chapter."
            ],
            "correct_answer": 0,
            "explanation": "Cognitive conflict strategies help students recognize the inadequacy of their intuitive misconceptions and actively construct valid scientific/mathematical frameworks.",
            "tags": [sub_clean, "Misconceptions", "HOTS", "Diagnostics"]
        })

    return qs


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

    def generate_full_100_exam_paper(self, subject: str = "Science", level: str = "Secondary") -> Dict[str, Any]:
        """
        Assembles the complete 100-MCQ 60-Minute 60/40 assessment paper:
        - Part A: 60 MCQs (20 CPD/NEP, 20 Classroom Scenarios, 20 Modern Pedagogy)
        - Part B: 40 MCQs (20 Core Subject, 10 Subject Pedagogy, 10 Misconceptions/HOTS)
        """
        part_a: List[Dict[str, Any]] = []
        
        # Build 20 Qs for Part A1 (CPD / NEP)
        for i in range(20):
            base = PART_A1_QUESTIONS[i % len(PART_A1_QUESTIONS)]
            part_a.append({
                **base,
                "id": f"partA1_q_{i+1}",
                "q_number": len(part_a) + 1,
                "module_idx": 1
            })

        # Build 20 Qs for Part A2 (Classroom Scenarios)
        for i in range(20):
            base = PART_A2_QUESTIONS[i % len(PART_A2_QUESTIONS)]
            part_a.append({
                **base,
                "id": f"partA2_q_{i+1}",
                "q_number": len(part_a) + 1,
                "module_idx": 2
            })

        # Build 20 Qs for Part A3 (Modern Pedagogy & Critical Thinking)
        for i in range(20):
            base = PART_A3_QUESTIONS[i % len(PART_A3_QUESTIONS)]
            part_a.append({
                **base,
                "id": f"partA3_q_{i+1}",
                "q_number": len(part_a) + 1,
                "module_idx": 3
            })

        # Build 40 Qs for Part B (Subject Specific)
        part_b_raw = _generate_subject_questions(subject)
        part_b: List[Dict[str, Any]] = []
        for idx, q in enumerate(part_b_raw):
            part_b.append({
                **q,
                "id": f"partB_q_{idx+1}",
                "q_number": len(part_a) + idx + 1
            })

        all_questions = part_a + part_b

        # Strip correct answers for candidate exam session
        client_questions = []
        for q in all_questions:
            client_questions.append({
                "id": q["id"],
                "q_number": q["q_number"],
                "section": q["section"],
                "module": q["module"],
                "question_text": q["question_text"],
                "options": q["options"],
                "tags": q.get("tags", [])
            })

        return {
            "paper_id": f"tso-national-2026-{subject.lower()}",
            "title": f"National Teacher Skills Olympiad (TSO) — {subject.upper()}",
            "subject": subject,
            "category_level": level,
            "duration_minutes": 60,
            "total_questions": 100,
            "total_marks": 100,
            "negative_marking": False,
            "structure": {
                "part_a": {
                    "title": "Part-A: CBSE Modules, Practical Experience & Pedagogy",
                    "weightage": "60%",
                    "questions_count": 60,
                    "modules": [
                        "1. CBSE CPD Modules & NEP Guidelines (20 MCQs)",
                        "2. Personal Classroom Experience & Scenarios (20 MCQs)",
                        "3. Modern Pedagogy & Critical Thinking (20 MCQs)"
                    ]
                },
                "part_b": {
                    "title": f"Part-B: {subject} Content & Subject Pedagogy",
                    "weightage": "40%",
                    "questions_count": 40,
                    "modules": [
                        "1. Core Subject Knowledge (20 MCQs)",
                        "2. Subject Pedagogical Knowledge (10 MCQs)",
                        "3. Misconceptions & HOTS (10 MCQs)"
                    ]
                }
            },
            "questions": client_questions
        }

    def register_tso_candidate(self, email: str, details: Dict[str, Any]) -> Dict[str, Any]:
        """Registers teacher for Free TSO with subject, level, medium, state, and district."""
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

    def get_tso_registration(self, email: str) -> Optional[Dict[str, Any]]:
        email_clean = email.strip().lower()
        if TSO_REGISTRATIONS_FILE.exists():
            try:
                with open(TSO_REGISTRATIONS_FILE, "r", encoding="utf-8") as f:
                    regs = json.load(f)
                    return regs.get(email_clean)
            except Exception:
                pass
        return None

    def submit_100_exam(self, submission_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Securely archives candidate's 100-MCQ responses in the database.
        Strict Admin-Controlled Evaluation: No instant score is published to the candidate.
        """
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
        """Fetch all submissions for admin review."""
        if SUBMISSIONS_FILE.exists():
            try:
                with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error reading submissions: {e}")
        return []

    def admin_evaluate_submission(self, sub_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Admin can assign scores, ranks, feedback, and badges."""
        if not SUBMISSIONS_FILE.exists():
            return {"status": "error", "message": "No submissions found"}

        with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
            submissions = json.load(f)

        target = next((s for s in submissions if s["id"] == sub_id), None)
        if not target:
            return {"status": "error", "message": "Submission not found"}

        if "official_score" in updates: target["official_score"] = float(updates["official_score"])
        if "merit_rank" in updates: target["merit_rank"] = updates["merit_rank"]
        if "district_rank" in updates: target["district_rank"] = updates["district_rank"]
        if "state_rank" in updates: target["state_rank"] = updates["state_rank"]
        if "badges_awarded" in updates: target["badges_awarded"] = updates["badges_awarded"]
        if "published" in updates:
            target["published"] = bool(updates["published"])
            target["review_status"] = "published" if target["published"] else "evaluated"

        with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(submissions, f, indent=2)

        return {"status": "success", "updated": target}

    def get_published_results(self, teacher_email: Optional[str] = None) -> List[Dict[str, Any]]:
        submissions = self.get_all_submissions()
        published = [s for s in submissions if s.get("published") is True]
        if teacher_email:
            clean = teacher_email.strip().lower()
            return [s for s in published if s.get("teacher_email") == clean]
        return published

olympiad_service = OlympiadService()
