-- =========================================================
-- DEVAGYA AI CHAT HISTORY — SUPABASE SCHEMA (Phase 5)
-- Migrates chat_conversations + chat_messages to Supabase Cloud
-- Supports: AI Agent OS, AI Chat Studio, Language Preference
-- =========================================================

-- 1. CHAT CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    agent_code TEXT DEFAULT NULL,          -- NULL = Chat Studio, non-null = Agent OS agent code
    language TEXT NOT NULL DEFAULT 'english', -- 'english', 'hindi', 'hinglish'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,                  -- 'user' or 'assistant'
    content TEXT NOT NULL DEFAULT '',
    image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_chat_conv_user ON public.chat_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conv_agent ON public.chat_conversations(user_id, agent_code, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_msg_conv ON public.chat_messages(conversation_id, created_at ASC);

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by backend)
CREATE POLICY chat_conv_service_all ON public.chat_conversations FOR ALL
    USING (true) WITH CHECK (true);

CREATE POLICY chat_msg_service_all ON public.chat_messages FOR ALL
    USING (true) WITH CHECK (true);
