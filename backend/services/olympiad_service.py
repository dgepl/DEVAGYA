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

# Initial seed data for question bank (Real pedagogical CBSE/NCERT/AI questions, NO mock text)
DEFAULT_QUESTIONS = [
    {
        "id": "q-101",
        "subject": "Pedagogy & Methodology",
        "level": "Advanced",
        "scenario_type": "Classroom Scenario",
        "difficulty_score": 8.5,
        "question_text": "In a heterogeneously grouped CBSE Class 9 science lab, two students with diverse learning needs are struggling with ray diagram concepts. Which differentiated pedagogical strategy best aligns with NEP 2020 experiential learning guidelines?",
        "options": [
          "Assign visual tactile ray-tracing kits and peer-assisted learning tasks.",
          "Ask both students to copy solved ray diagrams directly from NCERT textbook.",
          "Provide a simplified paper worksheet without hands-on apparatus.",
          "Instruct them to skip optical experiment part and memorize key definitions."
        ],
        "correct_answer": 0,
        "explanation": "NEP 2020 emphasizes experiential, hands-on, and differentiated learning. Tactile ray-tracing kits with peer support enable conceptual mastery through multi-sensory engagement.",
        "tags": ["NEP2020", "CBSE", "Class9", "ExperientialLearning"]
    },
    {
        "id": "q-102",
        "subject": "AI & Digital Tools",
        "level": "Intermediate",
        "scenario_type": "EdTech Integration",
        "difficulty_score": 7.8,
        "question_text": "When deploying AI OCR tools for scanning hand-written student answer sheets, a teacher notices ambiguous mathematical notation detection. What is the most effective corrective workflow?",
        "options": [
          "Discard the student script and mark zero marks for unclear steps.",
          "Review raw image bounding boxes, adjust contrast filter, and verify LaTeX rendering manually.",
          "Rely solely on automated AI scoring without human teacher verification.",
          "Ask student to re-write the entire exam digitally."
        ],
        "correct_answer": 1,
        "explanation": "Human-in-the-loop validation ensures fair assessment. Reviewing bounding boxes and LaTeX syntax guarantees OCR accuracy before final grade confirmation.",
        "tags": ["OCR", "AIinEducation", "AssessmentIntegrity"]
    },
    {
        "id": "q-103",
        "subject": "Educational Psychology",
        "level": "Advanced",
        "scenario_type": "Student Mentorship",
        "difficulty_score": 9.0,
        "question_text": "A Class 10 board student experiences sudden test anxiety during mock exams despite strong formative performance. Applying Vygotsky's Zone of Proximal Development (ZPD), how should the educator scaffold support?",
        "options": [
          "Provide guided problem breakdown cards and gradual release of responsibility in timed micro-drills.",
          "Exempt the student from taking all future mock board exams.",
          "Increase test penalty to force resilience under extreme stress.",
          "Advise student to memorize answer keys without understanding concepts."
        ],
        "correct_answer": 0,
        "explanation": "ZPD scaffolding provides structured prompts and gradual independence, helping the student bridge fear and performance capacity under anxiety.",
        "tags": ["Psychology", "BoardExam", "Vygotsky", "Mentorship"]
    },
    {
        "id": "q-104",
        "subject": "CBSE Policy & Ethics",
        "level": "Intermediate",
        "scenario_type": "Institutional Compliance",
        "difficulty_score": 8.0,
        "question_text": "Under current CBSE assessment guidelines, what is the mandatory proportion of competency-based questions required in secondary level annual examination question papers?",
        "options": [
          "Minimum 50% competency-based questions (MCQs, Case-based, Source-based)",
          "Maximum 10% basic recall questions only",
          "100% pure theoretical essay writing",
          "Competency questions are strictly optional for affiliated schools"
        ],
        "correct_answer": 0,
        "explanation": "CBSE mandates at least 50% competency-based assessment questions for Classes 9 to 12 to shift away from rote learning toward critical thinking.",
        "tags": ["CBSEGuidelines", "CompetencyBased", "Policy"]
    },
    {
        "id": "q-105",
        "subject": "Subject Specialization - Mathematics",
        "level": "Advanced",
        "scenario_type": "Conceptual Misconception",
        "difficulty_score": 9.2,
        "question_text": "When introducing quadratic equations, several Class 10 students confuse zeroes of polynomials with roots of quadratic equations. Which analytical task best resolves this conceptual confusion?",
        "options": [
          "Demonstrate graphical intersection of y = f(x) with X-axis versus algebraic solutions of f(x) = 0.",
          "Instruct students to memorize quadratic formula without geometric interpretation.",
          "Avoid teaching graphical representations to prevent confusion.",
          "State that zeroes and roots are identical in all mathematical contexts."
        ],
        "correct_answer": 0,
        "explanation": "Connecting graphical X-intercepts of f(x) with algebraic solutions of f(x)=0 provides visual clarity and structural understanding of polynomial functions.",
        "tags": ["Mathematics", "Class10", "Algebra", "Pedagogy"]
    }
]

DEFAULT_PRACTICE_QUESTIONS = [
    {
        "id": "p-201",
        "subject": "Pedagogy & Methodology",
        "question_text": "What is the primary objective of Formative Assessment in modern CBSE classrooms?",
        "options": [
          "To provide ongoing feedback to improve teaching and learning during instruction.",
          "To rank students publicly at the end of the academic year.",
          "To determine final board exam grades only.",
          "To issue official graduation certificates."
        ],
        "correct_answer": 0,
        "explanation": "Formative assessment is diagnostic and developmental, guiding instructional adaptations in real-time."
    },
    {
        "id": "p-202",
        "subject": "AI & Digital Tools",
        "question_text": "Which feature of an AI Question Generator best ensures Bloom's taxonomy alignment?",
        "options": [
          "Tagging question prompts by cognitive levels (Remembering, Understanding, Applying, Analyzing, Evaluating, Creating).",
          "Increasing character length of every question.",
          "Generating questions in random foreign languages.",
          "Removing options from multiple choice questions."
        ],
        "correct_answer": 0,
        "explanation": "Cognitive level tagging allows precise alignment with Bloom's Taxonomy for structured cognitive progression."
    },
    {
        "id": "p-203",
        "subject": "CBSE Policy & Ethics",
        "question_text": "According to National Curriculum Framework (NCF-SE), what is the key shift in assessment philosophy?",
        "options": [
          "Shift from summative rote memorization to continuous, holistic, competency-focused evaluation.",
          "Complete elimination of all classroom tests.",
          "Exclusive reliance on end-of-year written essays.",
          "Conducting exams without standardized scoring rubrics."
        ],
        "correct_answer": 0,
        "explanation": "NCF-SE advocates holistic 360-degree assessment evaluating core competencies over memorization."
    }
]

class OlympiadService:
    def __init__(self):
        self._ensure_seed_data()

    def _ensure_seed_data(self):
        """Seed initial high-quality questions if persistent file missing."""
        if not QUESTIONS_FILE.exists():
            with open(QUESTIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(DEFAULT_QUESTIONS, f, indent=2)

        if not PRACTICE_FILE.exists():
            with open(PRACTICE_FILE, "w", encoding="utf-8") as f:
                json.dump(DEFAULT_PRACTICE_QUESTIONS, f, indent=2)

        if not SUBMISSIONS_FILE.exists():
            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump([], f, indent=2)

    def get_exam_questions(self) -> List[Dict[str, Any]]:
        """Fetch exam question bank."""
        try:
            with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
                questions = json.load(f)
                # Strip correct_answer before serving to student/teacher exam view for security
                sanitized = []
                for q in questions:
                    item = dict(q)
                    item.pop("correct_answer", None)
                    sanitized.append(item)
                return sanitized
        except Exception as e:
            logger.error(f"Error loading questions: {e}")
            return DEFAULT_QUESTIONS

    def get_practice_questions(self, subject: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch practice questions."""
        try:
            with open(PRACTICE_FILE, "r", encoding="utf-8") as f:
                questions = json.load(f)
                if subject and subject.lower() != "all":
                    return [q for q in questions if q.get("subject", "").lower() == subject.lower()]
                return questions
        except Exception as e:
            logger.error(f"Error loading practice questions: {e}")
            return DEFAULT_PRACTICE_QUESTIONS

    def evaluate_practice_answer(self, question_id: str, selected_option: int) -> Dict[str, Any]:
        """Evaluate a single practice question and return immediate explanation."""
        try:
            with open(PRACTICE_FILE, "r", encoding="utf-8") as f:
                questions = json.load(f)
                q = next((q for q in questions if q["id"] == question_id), None)
                if not q:
                    return {"status": "error", "message": "Question not found"}
                
                is_correct = (selected_option == q["correct_answer"])
                return {
                    "status": "success",
                    "is_correct": is_correct,
                    "correct_option": q["correct_answer"],
                    "explanation": q.get("explanation", ""),
                    "question_id": question_id
                }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def submit_exam(self, submission_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process exam submission. Compute score server-side, record anti-cheating logs."""
        try:
            user_answers = submission_data.get("answers", {})
            tab_switches = submission_data.get("tab_switch_count", 0)
            webcam_active = submission_data.get("webcam_active", True)
            teacher_email = submission_data.get("teacher_email", "teacher@devgya.edu").strip()
            teacher_name = submission_data.get("teacher_name", "Teacher Candidate").strip()
            paper_id = submission_data.get("paper_id", "paper-101")

            # Single Attempt Guard
            submissions = self.get_all_submissions()
            for s in submissions:
                if s.get("teacher_email", "").strip().lower() == teacher_email.lower():
                    s_pid = s.get("paper_id", "paper-101")
                    if s_pid == paper_id or s_pid == "default":
                        return {
                            "status": "already_submitted",
                            "message": "You have already completed and submitted this Olympiad paper. Multiple attempts are not permitted.",
                            "submission_id": s.get("id"),
                            "review_status": s.get("review_status", "pending_review")
                        }

            # Calculate actual score server side & construct detailed answer breakdown
            questions = []
            try:
                from services.paper_service import paper_service
                papers = paper_service.get_all_papers()
                if papers and papers[0].get("questions"):
                    questions = papers[0]["questions"]
                    paper_id = papers[0].get("id", paper_id)
            except Exception as pe:
                logger.warn(f"Could not load paper_service questions: {pe}")

            if not questions and QUESTIONS_FILE.exists():
                with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
                    questions = json.load(f)

            total_questions = len(questions)
            correct_count = 0
            detailed_breakdown = []

            for q in questions:
                qid = str(q.get("id"))
                user_ans_idx = user_answers.get(qid)
                if user_ans_idx is None:
                    user_ans_idx = user_answers.get(q.get("id"))

                correct_idx = q.get("correct_answer", 0)
                options = q.get("options", [])

                is_correct = False
                if user_ans_idx is not None:
                    try:
                        is_correct = (int(user_ans_idx) == int(correct_idx))
                    except Exception:
                        is_correct = False

                if is_correct:
                    correct_count += 1

                user_selected_str = "Not Answered"
                if user_ans_idx is not None:
                    try:
                        idx_int = int(user_ans_idx)
                        if 0 <= idx_int < len(options):
                            user_selected_str = options[idx_int]
                    except Exception:
                        pass

                correct_str = ""
                try:
                    c_int = int(correct_idx)
                    if 0 <= c_int < len(options):
                        correct_str = options[c_int]
                    else:
                        correct_str = q.get("answer", "")
                except Exception:
                    correct_str = q.get("answer", "")

                detailed_breakdown.append({
                    "question_id": qid,
                    "question_text": q.get("question_text", ""),
                    "subject": q.get("subject", "Science"),
                    "options": options,
                    "user_selected_idx": user_ans_idx,
                    "user_selected_str": user_selected_str,
                    "correct_answer_idx": correct_idx,
                    "correct_answer_str": correct_str,
                    "is_correct": is_correct,
                    "explanation": q.get("explanation", "")
                })

            score_percentage = round((correct_count / total_questions) * 100, 1) if total_questions > 0 else 0
            sub_id = f"sub-{int(time.time() * 1000) % 1000000:06d}"

            proctor_logs = submission_data.get("proctor_logs", [])
            fullscreen_exits = submission_data.get("fullscreen_exits", 0)
            face_missing_count = submission_data.get("face_missing_count", 0)

            total_incidents = tab_switches + fullscreen_exits + face_missing_count
            proctor_status = "100% SECURE - Clean Proctor" if total_incidents == 0 else f"Flagged ({total_incidents} Total Security Incidents)"

            submission_record = {
                "id": sub_id,
                "paper_id": paper_id,
                "teacher_email": teacher_email,
                "teacher_name": teacher_name,
                "submitted_at": submission_data.get("submitted_at", time.strftime("%Y-%m-%d %H:%M:%S")),
                "answers": user_answers,
                "detailed_breakdown": detailed_breakdown,
                "total_questions": total_questions,
                "correct_count": correct_count,
                "score_percentage": score_percentage,
                "tab_switch_count": tab_switches,
                "fullscreen_exits": fullscreen_exits,
                "face_missing_count": face_missing_count,
                "webcam_active": webcam_active,
                "proctor_logs": proctor_logs,
                "proctor_status": proctor_status,
                "review_status": "pending_review",
                "official_feedback": "",
                "published": False
            }

            # Save submission
            submissions = []
            if SUBMISSIONS_FILE.exists():
                with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
                    submissions = json.load(f)

            submissions.insert(0, submission_record)
            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(submissions, f, indent=2)

            return {
                "status": "success",
                "message": "Olympiad assessment submitted successfully. Your result is under official board review.",
                "submission_id": submission_record["id"],
                "review_status": "pending_review"
            }
        except Exception as e:
            logger.error(f"Error saving submission: {e}")
            return {"status": "error", "message": str(e)}

    def get_all_submissions(self) -> List[Dict[str, Any]]:
        """Fetch all submissions for Super Admin Panel."""
        try:
            if SUBMISSIONS_FILE.exists():
                with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error fetching submissions: {e}")
        return []

    def update_submission_result(self, sub_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Admin update score, feedback, publish state."""
        try:
            if not SUBMISSIONS_FILE.exists():
                return {"status": "error", "message": "No submissions found"}

            with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
                submissions = json.load(f)

            target = next((s for s in submissions if s["id"] == sub_id), None)
            if not target:
                return {"status": "error", "message": "Submission ID not found"}

            if "score_percentage" in updates:
                target["score_percentage"] = float(updates["score_percentage"])
            if "official_feedback" in updates:
                target["official_feedback"] = str(updates["official_feedback"])
            if "published" in updates:
                target["published"] = bool(updates["published"])
                target["review_status"] = "published" if target["published"] else "evaluated"
            if "review_status" in updates:
                target["review_status"] = str(updates["review_status"])

            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(submissions, f, indent=2)

            return {"status": "success", "updated_submission": target}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def bulk_publish_submissions(self, paper_id: Optional[str] = None) -> Dict[str, Any]:
        """Admin 1-click bulk publish results for all participants (optionally filtered by paper_id)."""
        try:
            if not SUBMISSIONS_FILE.exists():
                return {"status": "error", "message": "No submissions found"}

            with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
                submissions = json.load(f)

            count = 0
            for s in submissions:
                # Match paper_id or if no paper_id specified / default fallback
                s_pid = s.get("paper_id", "paper-101")
                if not paper_id or s_pid == paper_id or (paper_id == "paper-101" and s_pid in ["paper-101", "default", ""]):
                    s["published"] = True
                    s["review_status"] = "published"
                    count += 1

            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(submissions, f, indent=2)

            return {"status": "success", "published_count": count, "submissions": submissions}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def delete_submission(self, sub_id: str) -> Dict[str, Any]:
        """Admin delete an Olympiad candidate submission/result."""
        try:
            if not SUBMISSIONS_FILE.exists():
                return {"status": "error", "message": "No submissions found"}

            with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
                submissions = json.load(f)

            initial_len = len(submissions)
            submissions = [s for s in submissions if s.get("id") != sub_id]

            if len(submissions) == initial_len:
                return {"status": "error", "message": "Submission ID not found"}

            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(submissions, f, indent=2)

            return {"status": "success", "message": f"Submission {sub_id} successfully deleted"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def bulk_delete_submissions(self, paper_id: Optional[str] = None) -> Dict[str, Any]:
        """Admin bulk delete submissions (optionally filtered by paper_id)."""
        try:
            if not SUBMISSIONS_FILE.exists():
                return {"status": "error", "message": "No submissions found"}

            with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
                submissions = json.load(f)

            initial_len = len(submissions)
            if not paper_id or paper_id == "all":
                deleted_count = initial_len
                submissions = []
            else:
                remaining = []
                for s in submissions:
                    s_pid = s.get("paper_id", "paper-101")
                    if s_pid == paper_id or (paper_id == "paper-101" and s_pid in ["paper-101", "default", ""]):
                        continue
                    remaining.append(s)
                deleted_count = initial_len - len(remaining)
                submissions = remaining

            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(submissions, f, indent=2)

            return {"status": "success", "deleted_count": deleted_count, "submissions": submissions}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_published_results(self, teacher_email: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch published results for public leaderboard or teacher result view."""
        try:
            submissions = self.get_all_submissions()
            published = [s for s in submissions if s.get("published") is True]

            if teacher_email:
                teacher_published = [s for s in published if s.get("teacher_email", "").lower() == teacher_email.lower()]
                return teacher_published

            return published
        except Exception as e:
            logger.error(f"Error getting published results: {e}")
            return []

    def add_question(self, question: Dict[str, Any]) -> Dict[str, Any]:
        """Add new question to question bank via Admin Panel."""
        try:
            questions = []
            if QUESTIONS_FILE.exists():
                with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
                    questions = json.load(f)

            new_id = f"q-{100 + len(questions) + 1}"
            question["id"] = new_id
            questions.append(question)

            with open(QUESTIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(questions, f, indent=2)

            return {"status": "success", "question": question}
        except Exception as e:
            return {"status": "error", "message": str(e)}

olympiad_service = OlympiadService()
