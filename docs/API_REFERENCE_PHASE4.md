# Phase 4 – REST API Endpoints Reference

All Phase 4 API endpoints are mounted under `/api/v1` on FastAPI.

## Agent Marketplace & OS APIs
- `GET /api/v1/agents/list?role_scope=all`: Returns all 15 specialized AI agents.
- `GET /api/v1/agents/detail/{agent_code}`: Returns capabilities, tools, and system prompt for agent.
- `POST /api/v1/agents/execute`: Executes a query using target agent's system prompt and tools.

## Knowledge Base & Document AI APIs
- `GET /api/v1/knowledge/documents`: Lists indexed RAG knowledge documents.
- `POST /api/v1/knowledge/rag-search`: Performs hybrid vector RAG search and returns answer with citations.
- `POST /api/v1/knowledge/document-ai`: Executes document operations (Summarize, Quiz, Flashcards, Mindmaps, Formulas).

## AI Workflow Engine APIs
- `GET /api/v1/workflows/templates`: Returns visual workflow templates.
- `POST /api/v1/workflows/run`: Executes multi-step automated visual AI pipeline.

## Prompt Studio APIs
- `GET /api/v1/prompt-studio/templates`: Lists prompt templates with variables.
- `POST /api/v1/prompt-studio/test`: Interpolates `{{variables}}` and runs live prompt test.

## Memory 2.0 APIs
- `GET /api/v1/memory-v2/list`: Lists active memory items for user.
- `POST /api/v1/memory-v2/add`: Adds a new memory item.

## AI Model Settings & Cost Analytics APIs
- `GET /api/v1/models/config`: Returns active LLM provider and model configuration.
- `GET /api/v1/models/cost-analytics`: Returns token consumption and cost analytics metrics.
