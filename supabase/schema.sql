-- =========================================================
-- ACADEMIX AI / EDUCRAFT AI - SUPABASE POSTGRESQL SCHEMA
-- Phase 1 MVP - Production Ready Database DDL
-- Supports Multi-Tenant Schools, Teachers, Super Admin,
-- and Future Student / Parent / Management Roles
-- =========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'teacher', 'student', 'parent', 'management');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE education_board AS ENUM ('CBSE', 'ICSE', 'STATE', 'IB', 'IGCSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('mcq', 'short', 'long', 'assertion_reason', 'case_study');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. SCHOOLS TABLE (Primary Tenant Entity)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    board education_board NOT NULL DEFAULT 'CBSE',
    logo_url TEXT,
    academic_year VARCHAR(50) NOT NULL DEFAULT '2025-2026',
    address TEXT,
    principal_name VARCHAR(255),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- References auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'teacher',
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    phone_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Class 10"
    section VARCHAR(10) DEFAULT 'A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- e.g., "Mathematics", "Science"
    code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CHAPTERS TABLE (NCERT & Custom Curriculum)
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. QUESTION PAPERS TABLE
CREATE TABLE IF NOT EXISTS public.question_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    chapter_title VARCHAR(255),
    difficulty difficulty_level NOT NULL DEFAULT 'medium',
    total_marks INT NOT NULL DEFAULT 80,
    time_allowed_mins INT NOT NULL DEFAULT 180,
    instructions TEXT[],
    questions_json JSONB NOT NULL, -- Detailed array of questions & options
    answer_key_json JSONB NOT NULL, -- Detailed array of correct answers & solutions
    pdf_url TEXT,
    answer_key_pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. OCR HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.ocr_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    extracted_text TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. ACTIVITY LOGS TABLE (Audit & Admin Metrics)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- e.g., "GENERATED_QUESTION_PAPER", "SCAN_OCR"
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_profiles_school ON public.profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_papers_teacher ON public.question_papers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_papers_school ON public.question_papers(school_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_activity_school ON public.activity_logs(school_id);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow Super Admins Full Access to Everything
CREATE POLICY super_admin_all_schools ON public.schools FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'super_admin')
);

-- Allow Users to view their own school profile
CREATE POLICY user_read_own_school ON public.schools FOR SELECT USING (
    id IN (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid())
);

-- Allow Users to read/update their own profile
CREATE POLICY user_own_profile ON public.profiles FOR ALL USING (
    id = auth.uid()
);

-- Allow Teachers to manage question papers belonging to their school
CREATE POLICY teacher_school_papers ON public.question_papers FOR ALL USING (
    school_id IN (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid())
);

-- SEED INITIAL SAMPLE NCERT DATA
INSERT INTO public.schools (id, name, board, academic_year, contact_email, principal_name)
VALUES ('11111111-1111-1111-1111-111111111111', 'Apex International Academy', 'CBSE', '2025-2026', 'contact@apexacademy.edu', 'Dr. Rajesh Sharma')
ON CONFLICT DO NOTHING;
