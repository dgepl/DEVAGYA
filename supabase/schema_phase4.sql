-- =========================================================
-- ACADEMIX AI - SUPABASE POSTGRESQL SCHEMA (PHASE 4 EXTENSIONS)
-- AI Operating System: Agents, RAG Knowledge Base, Workflows,
-- Prompt Studio, Memory 2.0, Model Manager & Token Cost Analytics
-- =========================================================

-- 1. AI AGENTS TABLE
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role_scope VARCHAR(50) DEFAULT 'general', -- teacher, student, parent, administrative
    avatar VARCHAR(100) DEFAULT 'Bot',
    description TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    capabilities_json JSONB DEFAULT '[]'::jsonb,
    tools_json JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. AGENT CONFIGURATIONS TABLE (Per School / Tenant Toggle)
CREATE TABLE IF NOT EXISTS public.agent_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT TRUE,
    custom_system_instructions TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, agent_id)
);

-- 3. KNOWLEDGE DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50) NOT NULL, -- pdf, docx, pptx, ncert, research_paper, notes
    file_url TEXT,
    file_size_bytes BIGINT DEFAULT 0,
    page_count INT DEFAULT 1,
    chunk_count INT DEFAULT 1,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. KNOWLEDGE CHUNKS TABLE
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    text_content TEXT NOT NULL,
    page_number INT DEFAULT 1,
    token_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. VECTOR EMBEDDINGS TABLE
CREATE TABLE IF NOT EXISTS public.embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chunk_id UUID NOT NULL REFERENCES public.knowledge_chunks(id) ON DELETE CASCADE,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PROMPT TEMPLATES TABLE (Prompt Studio)
CREATE TABLE IF NOT EXISTS public.prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    prompt_text TEXT NOT NULL,
    variables_json JSONB DEFAULT '[]'::jsonb, -- e.g. ["subject", "grade", "topic"]
    version VARCHAR(20) DEFAULT '1.0.0',
    favorites_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. WORKFLOW TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'curriculum',
    steps_json JSONB NOT NULL, -- Array of workflow nodes/steps
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. WORKFLOW RUNS TABLE
CREATE TABLE IF NOT EXISTS public.workflow_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    input_json JSONB DEFAULT '{}'::jsonb,
    output_json JSONB DEFAULT '{}'::jsonb,
    execution_time_ms INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. MEMORY 2.0 ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.memory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    memory_type VARCHAR(50) NOT NULL DEFAULT 'preference', -- preference, goal, teaching_style, learning_style, pinned_fact
    memory_key VARCHAR(150) NOT NULL,
    memory_value TEXT NOT NULL,
    importance_score INT DEFAULT 3, -- 1 to 5
    is_active BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, memory_key)
);

-- 10. MODEL CONFIGURATIONS TABLE (AI Model Settings)
CREATE TABLE IF NOT EXISTS public.model_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(100) NOT NULL DEFAULT 'groq', -- groq, openai, openrouter, deepseek
    model_name VARCHAR(150) NOT NULL DEFAULT 'llama-3.3-70b-versatile',
    temperature NUMERIC(3,2) DEFAULT 0.50,
    top_p NUMERIC(3,2) DEFAULT 0.90,
    max_tokens INT DEFAULT 2500,
    retry_count INT DEFAULT 3,
    is_default BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. TOKEN USAGE & COST ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.token_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    agent_code VARCHAR(100),
    feature_name VARCHAR(100) NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    estimated_cost_usd NUMERIC(8,6) DEFAULT 0.000000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_agents_code ON public.ai_agents(agent_code);
CREATE INDEX IF NOT EXISTS idx_knowledge_doc ON public.knowledge_documents(school_id, doc_type);
CREATE INDEX IF NOT EXISTS idx_chunks_doc ON public.knowledge_chunks(doc_id);
CREATE INDEX IF NOT EXISTS idx_memory_user ON public.memory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_user ON public.token_usage(user_id, created_at);
