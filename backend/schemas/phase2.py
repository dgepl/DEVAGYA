from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# 1. CHAT SCHEMAS
class ChatMessage(BaseModel):
    sender: str # 'user' | 'assistant'
    content: str

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    stream: bool = True

# 2. LESSON PLAN SCHEMAS
class LessonPlanRequest(BaseModel):
    title: str = Field(default="NCERT Interactive Lesson Plan")
    class_name: str = Field(..., example="Class 10")
    subject: str = Field(..., example="Science")
    chapter: str = Field(..., example="Life Processes")
    duration_mins: int = Field(default=45)
    learning_goals: List[str] = Field(default_factory=lambda: ["Understand cellular respiration", "Differentiate aerobic & anaerobic respiration"])
    difficulty: str = Field(default="medium")

class LessonPlanItem(BaseModel):
    title: str
    class_name: str
    subject: str
    chapter: str
    duration_mins: int
    learning_objectives: List[str]
    teaching_strategy: str
    class_activities: List[Dict[str, str]]
    group_work: str
    assessment_questions: List[str]
    homework: str
    revision_summary: str

# 3. CONTENT GENERATION SCHEMAS
class ContentGenRequest(BaseModel):
    content_type: str # 'worksheet', 'flashcard', 'mindmap', 'rubric', 'case_study', 'quiz'
    topic: str
    class_name: str
    subject: str
    custom_notes: Optional[str] = None

# 4. VOICE AI SCHEMAS
class VoiceFeedbackRequest(BaseModel):
    mode: str = Field(..., example="teaching") # 'interview', 'presentation', 'teaching', 'parent_meeting', 'daily_english'
    transcript: str
    audio_url: Optional[str] = None

class VoiceFeedbackResponse(BaseModel):
    mode: str
    transcript: str
    fluency_score: int # 0-100
    confidence_score: int # 0-100
    grammar_corrections: List[Dict[str, str]]
    vocabulary_enhancements: List[str]
    teaching_tips: List[str]

# 5. PROMPT LIBRARY SCHEMAS
class PromptItem(BaseModel):
    id: str
    title: str
    category: str
    prompt_template: str
    description: str
    is_favorite: bool = False
