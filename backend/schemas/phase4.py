from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# 1. Agent Manager Schemas
class AgentExecutePayload(BaseModel):
    agent_code: str
    user_id: Optional[str] = "usr-1"
    query: str
    context_data: Optional[Dict[str, Any]] = None

class AgentResponse(BaseModel):
    agent_code: str
    agent_name: str
    reply: str
    tools_used: List[str] = []
    tokens_consumed: int = 120
    execution_time_ms: int = 450

# 2. Knowledge Base & Document AI Schemas
class KnowledgeQueryPayload(BaseModel):
    query: str
    doc_types: Optional[List[str]] = None
    top_k: int = 3

class DocumentAIActionPayload(BaseModel):
    doc_id: Optional[str] = "doc-1"
    text_content: str
    action: str # summarize, generate_quiz, generate_flashcards, generate_mindmap, extract_formulas, extract_questions

# 3. AI Workflow Engine Schemas
class WorkflowRunPayload(BaseModel):
    workflow_id: str
    input_text: str
    options: Optional[Dict[str, Any]] = None

# 4. Prompt Studio Schemas
class PromptTemplatePayload(BaseModel):
    title: str
    category: str = "teaching"
    prompt_text: str
    variables: List[str] = []
    tags: List[str] = []

class PromptTestPayload(BaseModel):
    template_id: Optional[str] = None
    prompt_text: str
    variable_values: Dict[str, str]

# 5. Memory 2.0 Schemas
class MemoryItemPayload(BaseModel):
    user_id: Optional[str] = "usr-1"
    memory_type: str = "preference"
    memory_key: str
    memory_value: str
    importance_score: int = 3
    tags: List[str] = []

# 6. Model Manager & Cost Analytics Schemas
class ModelConfigPayload(BaseModel):
    provider: str = "groq"
    model_name: str = "openai/gpt-oss-120b"
    temperature: float = 0.5
    top_p: float = 0.9
    max_tokens: int = 2500
    retry_count: int = 3
