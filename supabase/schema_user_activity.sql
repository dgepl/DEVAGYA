-- =========================================================================
-- DEVGYA GLOBAL AI ENGINE: Real-Time User Activity Telemetry Schema
-- Supabase Cloud PostgreSQL Table & Index Definitions
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.user_activity (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT,
    action TEXT,
    feature_id TEXT,
    feature_name TEXT,
    path TEXT,
    details JSONB,
    timestamp TIMESTAMPTZ NOT NULL,
    time_display TEXT,
    date TEXT,
    date_utc TEXT,
    hour TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for rapid aggregation and timeline lookups
CREATE INDEX IF NOT EXISTS idx_user_activity_email ON public.user_activity(email);
CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON public.user_activity(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON public.user_activity(date);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON public.user_activity(action);

-- Enable RLS and grant service role full access
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on user_activity" ON public.user_activity FOR ALL USING (true);
