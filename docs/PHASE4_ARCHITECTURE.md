# Phase 4 – AI Operating System Architecture

## Overview
Phase 4 transforms Academix AI into an **AI Operating System for Education**, providing:
- **Central AI Architecture**: All requests route through `AIProviderService`, `AgentManagerService`, `KnowledgeService`, `WorkflowEngineService`, and `ModelManagerService`.
- **15 Specialized AI Agents**: Dedicated system prompts, custom tools, and capabilities for Teachers, Students, Parents, and Admins.
- **RAG Knowledge Base & Document AI**: Hybrid vector search across books, PDFs, NCERT manuals with source citations.
- **Visual AI Workflow Engine**: Reusable multi-step automated execution pipelines.
- **Prompt Studio**: Variable interpolation `{{var}}`, template versioning, and live preview testing.
- **Memory 2.0**: Structured memory management (learning styles, goals, preferences, weaknesses).
- **AI Model Manager & Cost Analytics**: Configurable providers, temperature, max tokens, fallback retry policy, and token cost tracking.

```mermaid
graph TD
    UI[Next.js 15 AI OS Workspace] --> APIRouter[FastAPI v1 Engine /api/v1]
    
    APIRouter --> AgentManager[Agent Manager (15 Agents)]
    APIRouter --> KnowledgeRAG[Knowledge Base RAG & Document AI]
    APIRouter --> WorkflowEngine[Visual AI Workflow Engine]
    APIRouter --> PromptStudio[Prompt Studio & Variables]
    APIRouter --> Memoryv2[Memory 2.0 System]
    APIRouter --> ModelManager[Model Manager & Cost Calculator]
    
    AgentManager --> CentralAI[Central AI Provider Abstraction]
    KnowledgeRAG --> CentralAI
    WorkflowEngine --> CentralAI
    PromptStudio --> CentralAI
    Memoryv2 --> CentralAI
    
    CentralAI --> LLMProviders[Groq / OpenAI / OpenRouter / DeepSeek]
    KnowledgeRAG --> VectorDB[Supabase Vector & Document Chunks]
```
