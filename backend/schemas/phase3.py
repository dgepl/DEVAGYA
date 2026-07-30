from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# 1. Socratic Tutor Schemas
class SocraticQueryPayload(BaseModel):
    student_id: Optional[str] = "std-1"
    subject: str = "Science"
    topic: str = "Light Reflection and Refraction"
    message: str
    socratic_mode: bool = True
    context_text: Optional[str] = None
    image_url: Optional[str] = None

class SocraticHintRequest(BaseModel):
    query_text: str
    current_attempt: Optional[str] = None
    hint_level: int = 1 # 1: Probing question, 2: Key concept formula hint, 3: Next step hint

class SocraticResponse(BaseModel):
    reply: str
    is_socratic: bool
    suggested_hints: List[str]
    suggested_questions: List[str]
    xp_gained: int = 10

# 2. Practice & Adaptive Quiz Schemas
class QuizGeneratePayload(BaseModel):
    student_id: Optional[str] = "std-1"
    subject: str = "Mathematics"
    chapter: str = "Quadratic Equations"
    question_types: List[str] = ["mcq", "short", "assertion_reason"]
    difficulty: str = "adaptive"
    num_questions: int = 5

class QuizQuestionItem(BaseModel):
    id: int
    question_type: str
    question: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str
    hint: Optional[str] = None

class QuizSubmitPayload(BaseModel):
    student_id: str = "std-1"
    subject: str
    chapter: str
    answers: Dict[str, str] # question_id -> user answer

class QuizResultResponse(BaseModel):
    score: int
    total: int
    percentage: float
    xp_earned: int
    coins_earned: int
    feedback: str
    breakdown: List[Dict[str, Any]]

# 3. Flashcards Schemas
class FlashcardGeneratePayload(BaseModel):
    student_id: Optional[str] = "std-1"
    subject: str = "Biology"
    topic: str = "Life Processes"
    num_cards: int = 6

class FlashcardItem(BaseModel):
    id: str
    front: str
    back: str
    hint: Optional[str] = None
    difficulty: str = "medium"

class FlashcardReviewPayload(BaseModel):
    card_id: str
    rating: str # again, hard, good, easy

# 4. Study Planner Schemas
class StudyPlanGeneratePayload(BaseModel):
    student_id: Optional[str] = "std-1"
    available_hours_per_day: float = 3.0
    weak_subjects: List[str] = ["Physics", "Mathematics"]
    upcoming_exams: List[Dict[str, str]] = [] # [{ "subject": "Math", "date": "2026-08-15" }]
    target_period: str = "weekly" # daily, weekly, monthly, exam

# 5. Revision & Exam Prep Schemas
class RevisionGeneratePayload(BaseModel):
    student_id: Optional[str] = "std-1"
    subject: str = "Chemistry"
    topic: str = "Chemical Reactions"
    revision_type: str = "quick_notes" # quick_notes, mind_map, formula_sheet, cheat_sheet, one_day, seven_day

class ExamPrepPayload(BaseModel):
    student_id: Optional[str] = "std-1"
    exam_name: str = "CBSE Class 10 Board Exam"
    subject: str = "Science"
    days_remaining: int = 14

# 6. Notes Schemas
class NoteCreatePayload(BaseModel):
    student_id: Optional[str] = "std-1"
    title: str
    subject: str = "General"
    content: str
    tags: List[str] = []

class NoteActionPayload(BaseModel):
    note_id: str
    content: str
    action: str # summarize, rewrite, generate_quiz

# 7. Parent Coach Schemas
class ParentCoachPayload(BaseModel):
    parent_id: Optional[str] = "prt-1"
    child_id: Optional[str] = "std-1"
    question: str

# 8. Pomodoro Timer Schema
class PomodoroLogPayload(BaseModel):
    student_id: Optional[str] = "std-1"
    duration_seconds: int
    focus_rating: int = 5
    session_type: str = "pomodoro"
