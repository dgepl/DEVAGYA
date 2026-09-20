-- DEVGYA GLOBAL EDUTECH - Parent-Managed Student Accounts & Activity Persistence Schema
-- Run this in Supabase SQL Editor if you wish to have dedicated tables alongside the standard profiles & ai_conversations store.

-- 1. Student Accounts Table (Managed by Parents)
CREATE TABLE IF NOT EXISTS student_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  class_name TEXT NOT NULL DEFAULT 'Class 10',
  school_name TEXT DEFAULT '',
  board TEXT DEFAULT 'CBSE',
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_accounts_parent ON student_accounts(parent_email);
CREATE INDEX IF NOT EXISTS idx_student_accounts_username ON student_accounts(username);

-- 2. Student Quiz Results Table
CREATE TABLE IF NOT EXISTS student_quiz_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_username TEXT NOT NULL REFERENCES student_accounts(username) ON DELETE CASCADE,
  parent_email TEXT NOT NULL,
  quiz_title TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT DEFAULT '',
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  feedback TEXT DEFAULT '',
  breakdown JSONB DEFAULT '[]'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON student_quiz_results(student_username);
CREATE INDEX IF NOT EXISTS idx_quiz_results_parent ON student_quiz_results(parent_email);

-- 3. Student Smart Notes Table
CREATE TABLE IF NOT EXISTS student_notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_username TEXT NOT NULL REFERENCES student_accounts(username) ON DELETE CASCADE,
  parent_email TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT DEFAULT 'General',
  tags JSONB DEFAULT '[]'::jsonb,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_notes_student ON student_notes(student_username);
