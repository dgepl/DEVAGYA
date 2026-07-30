-- =========================================================
-- ACADEMIX AI - SUPABASE POSTGRESQL SCHEMA (PHASE 3 EXTENSIONS)
-- Student & Parent AI Learning Platform Schema
-- =========================================================

-- 1. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_name VARCHAR(100) NOT NULL DEFAULT 'Class 10',
    section VARCHAR(10) DEFAULT 'A',
    roll_number VARCHAR(50),
    xp_points INT DEFAULT 350,
    coins INT DEFAULT 120,
    level INT DEFAULT 4,
    learning_streak INT DEFAULT 7,
    opt_out_leaderboard BOOLEAN DEFAULT FALSE,
    preferred_study_time VARCHAR(50) DEFAULT 'evening',
    learning_style VARCHAR(50) DEFAULT 'visual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PARENTS TABLE
CREATE TABLE IF NOT EXISTS public.parents (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    phone_number VARCHAR(50),
    notification_email BOOLEAN DEFAULT TRUE,
    notification_sms BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PARENT STUDENT LINKS TABLE
CREATE TABLE IF NOT EXISTS public.parent_student_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    relationship VARCHAR(50) DEFAULT 'Parent',
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id, student_id)
);

-- 4. STUDENT PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject VARCHAR(150) NOT NULL,
    chapter VARCHAR(255),
    mastery_percentage INT DEFAULT 75,
    weak_topics TEXT[],
    strong_topics TEXT[],
    total_quizzes_taken INT DEFAULT 0,
    average_score INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. STUDY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject VARCHAR(150) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    duration_mins INT NOT NULL,
    xp_earned INT DEFAULT 20,
    session_type VARCHAR(50) DEFAULT 'socratic_tutor', -- socratic_tutor, practice, flashcards, pomodoro
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. STUDY GOALS TABLE
CREATE TABLE IF NOT EXISTS public.study_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    goal_title VARCHAR(255) NOT NULL,
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly', 'exam')),
    target_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. STUDENT AI MEMORY TABLE
CREATE TABLE IF NOT EXISTS public.student_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    memory_key VARCHAR(100) NOT NULL,
    memory_value TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'learning_habit',
    importance_score INT DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, memory_key)
);

-- 8. HOMEWORK & ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    attachment_url TEXT,
    submission_text TEXT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. FLASHCARDS TABLE
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject VARCHAR(150) NOT NULL,
    deck_title VARCHAR(255) NOT NULL,
    cards_json JSONB NOT NULL, -- Array of { id, front, back, hint, difficulty }
    ease_factor NUMERIC(3,2) DEFAULT 2.50,
    interval_days INT DEFAULT 1,
    next_review DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. REVISION PLANS TABLE
CREATE TABLE IF NOT EXISTS public.revision_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject VARCHAR(150) NOT NULL,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('quick_notes', 'mind_map', 'formula_sheet', 'cheat_sheet', 'one_day', 'seven_day', 'exam_countdown')),
    content_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. ACHIEVEMENTS & BADGES TABLE
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    badge_code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. LEADERBOARDS TABLE
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    scope VARCHAR(50) NOT NULL CHECK (scope IN ('school', 'class', 'subject')),
    scope_value VARCHAR(150) NOT NULL,
    xp_points INT NOT NULL DEFAULT 0,
    period VARCHAR(50) DEFAULT 'weekly' CHECK (period IN ('weekly', 'monthly', 'all_time')),
    rank_position INT DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject VARCHAR(150) NOT NULL,
    chapter VARCHAR(255),
    question_type VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    questions_json JSONB NOT NULL,
    answers_json JSONB NOT NULL,
    xp_earned INT DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. EXAM PREPARATION TABLE
CREATE TABLE IF NOT EXISTS public.exam_preparation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    exam_name VARCHAR(255) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    exam_date DATE NOT NULL,
    target_score INT DEFAULT 95,
    confidence_score INT DEFAULT 82,
    study_strategy_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. NOTES TABLE (Notion-like)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled Note',
    subject VARCHAR(150) DEFAULT 'General',
    content TEXT DEFAULT '',
    tags TEXT[],
    is_bookmarked BOOLEAN DEFAULT FALSE,
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. STUDY TIMER TABLE
CREATE TABLE IF NOT EXISTS public.study_timer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    session_type VARCHAR(50) DEFAULT 'pomodoro',
    elapsed_seconds INT NOT NULL,
    focus_rating INT DEFAULT 5,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PHASE 3
CREATE INDEX IF NOT EXISTS idx_student_school ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_parent_student ON public.parent_student_links(parent_id, student_id);
CREATE INDEX IF NOT EXISTS idx_progress_student ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON public.study_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_goals_student ON public.study_goals(student_id);
CREATE INDEX IF NOT EXISTS idx_homework_student ON public.homework(student_id);
CREATE INDEX IF NOT EXISTS idx_notes_student ON public.notes(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
