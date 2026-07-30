# Phase 4 – Database Schema Documentation

File: `supabase/schema_phase4.sql`

## Extended Tables
1. `ai_agents`: Agent registry table with `agent_code`, `name`, `system_prompt`, `capabilities_json`, `tools_json`.
2. `agent_configs`: Per-school/tenant agent enablement and custom system instruction overrides.
3. `knowledge_documents`: Metadata for uploaded books, PDFs, NCERT manuals, research papers, worksheets.
4. `knowledge_chunks`: Text chunks with page numbers and token counts for RAG indexing.
5. `embeddings`: Vector embeddings & metadata.
6. `prompt_templates`: Prompt Studio templates with `variables_json`, `category`, and tags.
7. `workflow_templates`: Multi-step visual workflow definitions.
8. `workflow_runs`: Execution logs and step-by-step outputs.
9. `memory_items`: Memory 2.0 system storing preferences, goals, learning/teaching styles, and pinned facts.
10. `model_configs`: Dynamic AI provider & model settings (temperature, top_p, max_tokens, retry_policy).
11. `token_usage`: Request logs, token counts, and estimated USD costs per user and feature.
