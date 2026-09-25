from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class QuestionItem(BaseModel):
    id: int
    question_number: int
    question_type: str # 'mcq', 'short', 'long', 'assertion_reason'
    question_text: str
    marks: int
    options: Optional[List[str]] = None # For MCQs
    assertion_text: Optional[str] = None # For Assertion-Reason
    reason_text: Optional[str] = None # For Assertion-Reason
    case_passage: Optional[str] = None # For Case Study passage
    sub_questions: Optional[List[str]] = None # For Case Study sub-questions
    answer: str
    explanation: Optional[str] = None
    stream: Optional[str] = None # 'science' | 'commerce' | 'humanities'
    competency: Optional[str] = None # e.g. 'Empirical Inquiry', 'Market Logic', 'Critical Analysis'
    section: Optional[str] = None # e.g. 'Section A: Objective MCQs'

class GeneratePaperRequest(BaseModel):
    title: str = Field(default="Periodic Assessment - 2025")
    class_name: str = Field(default="Class 10", example="Class 10")
    subject: str = Field(default="Science", example="Science")
    chapter: str = Field(default="General Syllabus", example="Chemical Reactions and Equations")
    difficulty: str = Field(default="medium", example="medium") # easy, medium, hard, mixed
    total_marks: int = Field(default=80)
    time_allowed_mins: int = Field(default=180)
    num_mcqs: int = Field(default=10)
    num_short: int = Field(default=5)
    num_long: int = Field(default=3)
    num_assertion_reason: int = Field(default=0)
    num_fill_in_the_blanks: int = Field(default=0)
    num_case_study: int = Field(default=0)
    ar_marks: int = Field(default=2)
    fill_marks: int = Field(default=1)
    case_marks: int = Field(default=4)
    question_type_instructions: Optional[str] = None
    school_name: str = Field(default="Apex International Academy")
    school_logo: Optional[str] = None
    custom_instructions: Optional[str] = None
    user_email: Optional[str] = None

class GeneratedPaperResponse(BaseModel):
    id: Optional[str] = None
    title: str
    class_name: str
    subject: str
    chapter: str
    difficulty: str
    total_marks: int
    time_allowed_mins: int
    instructions: List[str]
    questions: List[QuestionItem]
    school_name: str
    school_logo: Optional[str] = None
    user_email: Optional[str] = None
    created_at: Optional[str] = None

class StreamAssessmentRequest(BaseModel):
    title: Optional[str] = Field(default="NEP Stage-Wise Assessment Paper")
    class_name: Optional[str] = Field(default="Class 10", example="Class 10")
    subject: Optional[str] = Field(default="Comprehensive Diagnostic")
    nep_stage: Optional[str] = None # 'foundational', 'preparatory', 'middle', 'secondary', 'senior_secondary'
    school_name: Optional[str] = Field(default="DEVGYA GLOBAL ACADEMY")
    school_logo: Optional[str] = None
    time_allowed_mins: Optional[int] = Field(default=90)
    difficulty: Optional[str] = Field(default="balanced") # "foundation", "balanced", "advanced"
    num_mcqs_per_stream: Optional[int] = Field(default=4)
    num_short_per_stream: Optional[int] = Field(default=2)
    num_long_per_stream: Optional[int] = Field(default=1)
    custom_instructions: Optional[str] = None
    user_email: Optional[str] = None

class StreamBreakdown(BaseModel):
    stream: str # 'science', 'commerce', 'humanities' or domain
    stream_name: str
    mcq_count: int
    short_count: int
    long_count: int
    total_marks: int
    key_competencies: List[str]

class StreamAssessmentResponse(BaseModel):
    id: Optional[str] = None
    title: str
    class_name: str
    nep_stage: Optional[str] = "senior_secondary"
    subject: str = "NEP Curriculum Assessment"
    school_name: str
    school_logo: Optional[str] = None
    total_marks: int
    time_allowed_mins: int
    difficulty: str
    instructions: List[str]
    questions: List[QuestionItem]
    stream_breakdown: List[StreamBreakdown]
    diagnostic_matrix: Dict[str, Any]
    user_email: Optional[str] = None
    created_at: Optional[str] = None
