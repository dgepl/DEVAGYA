-- ================================================================
-- DEVGYA RECRUITMENT & SCHOOL PORTAL SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor
-- ================================================================

-- 0. ALLOW 'school' IN user_role ENUM IF ENUM EXISTS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'school';
    END IF;
END$$;

-- 1. RECRUITMENT SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS public.recruitment_schools (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    school_name TEXT NOT NULL,
    phone TEXT,
    affiliation_board TEXT DEFAULT 'CBSE',
    city TEXT,
    state TEXT,
    contact_person TEXT,
    address TEXT,
    logo_url TEXT,
    verification_status TEXT DEFAULT 'pending_verification' CHECK (verification_status IN ('pending_verification', 'verified', 'rejected')),
    verification_notes TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VACANCIES TABLE
CREATE TABLE IF NOT EXISTS public.vacancies (
    id TEXT PRIMARY KEY,
    school_id TEXT REFERENCES public.recruitment_schools(id) ON DELETE CASCADE,
    school_name TEXT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    level TEXT NOT NULL,
    board TEXT DEFAULT 'CBSE',
    experience_required TEXT DEFAULT '1-3 Years',
    salary_range TEXT DEFAULT 'Competitive',
    openings INT DEFAULT 1,
    employment_type TEXT DEFAULT 'Full Time',
    description TEXT,
    requirements JSONB DEFAULT '[]'::jsonb,
    deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'paused')),
    applicant_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
    id TEXT PRIMARY KEY,
    vacancy_id TEXT REFERENCES public.vacancies(id) ON DELETE CASCADE,
    school_id TEXT REFERENCES public.recruitment_schools(id) ON DELETE CASCADE,
    school_name TEXT,
    job_title TEXT,
    job_subject TEXT,
    job_level TEXT,
    teacher_id TEXT,
    teacher_name TEXT NOT NULL,
    teacher_email TEXT NOT NULL,
    teacher_phone TEXT,
    qualification TEXT,
    experience TEXT,
    current_school TEXT,
    cover_note TEXT,
    resume_filename TEXT NOT NULL,
    resume_url TEXT NOT NULL,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'shortlisted', 'interview', 'selected', 'rejected')),
    school_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE RLS AND POLICIES
ALTER TABLE public.recruitment_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Service Role Full Access Recruitment Schools" ON public.recruitment_schools;
DROP POLICY IF EXISTS "Service Role Full Access Vacancies" ON public.vacancies;
DROP POLICY IF EXISTS "Service Role Full Access Job Applications" ON public.job_applications;
DROP POLICY IF EXISTS "Allow public read verified recruitment schools" ON public.recruitment_schools;
DROP POLICY IF EXISTS "Allow public read active vacancies" ON public.vacancies;

-- Allow service role full access
CREATE POLICY "Service Role Full Access Recruitment Schools" ON public.recruitment_schools FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Vacancies" ON public.vacancies FOR ALL USING (true);
CREATE POLICY "Service Role Full Access Job Applications" ON public.job_applications FOR ALL USING (true);

-- Allow public read access to active vacancies and verified schools
CREATE POLICY "Allow public read verified recruitment schools" ON public.recruitment_schools FOR SELECT USING (true);
CREATE POLICY "Allow public read active vacancies" ON public.vacancies FOR SELECT USING (true);
