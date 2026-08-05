# DEVAGYA Project Rules & Context

## Project Overview
DEVAGYA is an AI-powered K-12 education SaaS platform (CBSE/NCERT focused). It has a FastAPI backend and Next.js 15 frontend.

## Tech Stack
- **Backend**: Python 3.14, FastAPI, Uvicorn, httpx, Pillow, python-dotenv
- **Frontend**: Next.js 15.5, React 19, TypeScript, Tailwind CSS (vanilla CSS also used)
- **Database**: Supabase Cloud PostgreSQL (REST API via httpx, NOT supabase-py SDK)
- **AI Provider**: Groq API (OpenAI-compatible) via `services/ai_provider.py`
- **State**: Zustand (`store/useAppStore.ts`)

## Key Architecture Patterns

### Backend (`backend/`)
- **Entry**: `main.py` — FastAPI app with CORS (`expose_headers=["X-Conversation-Id"]`)
- **Routers**: `api/v1/*.py` — Each feature has its own router file
- **Services**: `services/*.py` — Business logic separated from routes
- **AI calls**: Always use `ai_provider.chat_completion()` or `ai_provider.stream_chat_completion()` from `services/ai_provider.py`
- **Supabase pattern**: Use `httpx.Client` with `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` headers. See `services/chat_history_service.py` for the canonical pattern.
- **Image processing**: Resize to 1280px max width, JPEG 80% quality, base64 data URL. See `_image_to_data_url()` in `api/v1/agents.py`.
- **Streaming**: Use `StreamingResponse(event_generator(), media_type="text/plain")` with `X-Conversation-Id` header.
- **JSONB from Supabase**: Always parse with `isinstance(value, list)` check — Supabase JSONB can return as string or list.

### Frontend (`frontend/src/`)
- **Dashboard layout**: `app/dashboard/layout.tsx` — Role-based sidebar (teacher/student/parent)
- **Agent OS**: `components/agent_os/AgentMarketplace.tsx` — Main AI workspace with agent selector, streaming chat, image upload, language selector, history panel
- **Chat Studio**: `app/dashboard/chat/page.tsx` — General AI chat with history
- **API helpers**: `lib/api.ts` — All fetch wrappers
- **Store**: `store/useAppStore.ts` — User session, role, papers
- **Markdown**: `components/chat/Markdown.tsx` — Renders AI responses

### Database Tables (Supabase)
- `chat_conversations` — id(TEXT PK), user_id, title, agent_code(nullable), language, created_at, updated_at
- `chat_messages` — id(TEXT PK), conversation_id(FK), sender, content, image_urls(JSONB), created_at
- `user_profiles` — managed by `services/supabase_service.py`

### 15 AI Agents (defined in `services/agent_manager.py`)
teacher_mentor, question_generator, lesson_planner, homework_assistant, student_tutor, english_coach, research_assistant, document_assistant, analytics_assistant, parent_coach, career_counselor, revision_assistant, exam_strategist, motivation_coach, study_planner

### Environment Variables (`.env`)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase connection
- `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` — Groq LLM
- `AI_VISION_MODEL` — Vision model (Qwen)

## Important Gotchas
1. **Windows PowerShell**: Use `;` not `&&` for chaining commands. Unicode emoji may fail in console output.
2. **Supabase JSONB**: `image_urls` field can be string or array — always use `_parse_image_urls()` or `Array.isArray()`.
3. **CORS**: Custom headers like `X-Conversation-Id` need `expose_headers` in CORS middleware.
4. **Backend venv**: Use `.\venv\Scripts\python.exe` to run Python in the backend.
5. **Supabase DDL**: Cannot run CREATE TABLE via REST API — must use SQL Editor in Supabase Dashboard or direct PostgreSQL connection.
6. **Agent sidebar links**: Each agent is a direct sidebar link (`/dashboard/agents?agent=AGENT_CODE`), filtered by user role. No more centralized Agent OS page. The `AgentMarketplace` component reads `?agent=` query param via `useSearchParams`.

## User Preferences
- Uses Claude/AI models for development
- Prefers Hindi, English, Hinglish language support
- Each AI agent is a separate sidebar item, role-filtered (student agents in student sidebar, etc.)
- Wants Supabase for all persistence (no SQLite)
