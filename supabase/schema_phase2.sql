-- =========================================================
-- ACADEMIX AI - SUPABASE POSTGRESQL SCHEMA (PHASE 2 EXTENSIONS)
-- AI Intelligence Layer: Conversations, Lesson Plans, Memory,
-- Prompt Library, Voice Sessions, Content Generations & Analytics
-- =========================================================

-- 1. AI CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New AI Conversation',
    is_bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CONVERSATION MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. LESSON PLANS TABLE
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    chapter VARCHAR(255) NOT NULL,
    duration_mins INT DEFAULT 45,
    learning_goals TEXT[],
    plan_json JSONB NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TEACHER MEMORY TABLE
CREATE TABLE IF NOT EXISTS public.teacher_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    memory_key VARCHAR(100) NOT NULL,
    memory_value TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'preference',
    is_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, memory_key)
);

-- 5. PROMPT LIBRARY TABLE
CREATE TABLE IF NOT EXISTS public.prompt_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('teaching', 'assessment', 'lesson_planning', 'homework', 'english', 'productivity')),
    prompt_template TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    favorites_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SAVED PROMPTS TABLE (Teacher Favorites)
CREATE TABLE IF NOT EXISTS public.saved_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.prompt_library(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, prompt_id)
);

-- 7. VOICE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.voice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('interview', 'presentation', 'teaching', 'parent_meeting', 'daily_english')),
    transcript TEXT NOT NULL,
    audio_url TEXT,
    fluency_score INT DEFAULT 85,
    grammar_feedback_json JSONB DEFAULT '{}'::jsonb,
    duration_seconds INT DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CONTENT GENERATIONS TABLE
CREATE TABLE IF NOT EXISTS public.content_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('worksheet', 'flashcard', 'mindmap', 'rubric', 'case_study', 'quiz')),
    title VARCHAR(255) NOT NULL,
    content_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. USAGE STATISTICS TABLE (AI Analytics)
CREATE TABLE IF NOT EXISTS public.usage_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    feature_used VARCHAR(100) NOT NULL,
    tokens_consumed INT DEFAULT 0,
    time_saved_mins INT DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_ai_conv_teacher ON public.ai_conversations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_teacher ON public.lesson_plans(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_memory ON public.teacher_memory(teacher_id);
CREATE INDEX IF NOT EXISTS idx_prompt_category ON public.prompt_library(category);
CREATE INDEX IF NOT EXISTS idx_voice_teacher ON public.voice_sessions(teacher_id);

-- RLS POLICIES
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY teacher_own_conversations ON public.ai_conversations FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY teacher_own_lesson_plans ON public.lesson_plans FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY teacher_own_memory ON public.teacher_memory FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY public_read_prompts ON public.prompt_library FOR SELECT USING (true);
CREATE POLICY teacher_own_voice ON public.voice_sessions FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY teacher_own_content ON public.content_generations FOR ALL USING (teacher_id = auth.uid());
