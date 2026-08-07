-- DEVGYA XP System - Run this in Supabase SQL Editor
-- Table for tracking user XP, levels, and streaks

CREATE TABLE IF NOT EXISTS user_xp (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Student',
  user_email TEXT DEFAULT '',
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_xp_user_id ON user_xp(user_id);

-- Index for leaderboard queries (sorted by total_xp desc)
CREATE INDEX IF NOT EXISTS idx_user_xp_leaderboard ON user_xp(total_xp DESC);

-- Enable RLS (optional, using service role key bypasses)
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
