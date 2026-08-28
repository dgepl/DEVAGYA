from typing import List, Optional
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
    answer: str
    explanation: Optional[str] = None

class GeneratePaperRequest(BaseModel):
    title: str = Field(default="Periodic Assessment - 2025")
    class_name: str = Field(..., example="Class 10")
    subject: str = Field(..., example="Science")
    chapter: str = Field(..., example="Chemical Reactions and Equations")
    difficulty: str = Field(default="medium", example="medium") # easy, medium, hard, mixed
    total_marks: int = Field(default=80)
    time_allowed_mins: int = Field(default=180)
    num_mcqs: int = Field(default=10)
    num_short: int = Field(default=5)
    num_long: int = Field(default=3)
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
