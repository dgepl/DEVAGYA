"""
Supabase Chat Tables Migration Script.
Run this script to create chat_conversations and chat_messages tables in Supabase.

Usage:
    python migrate_chat_tables.py

Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def check_table_exists(table_name: str) -> bool:
    """Check if a table exists by querying it."""
    res = httpx.get(
        f"{SUPABASE_URL}/rest/v1/{table_name}?select=id&limit=1",
        headers=HEADERS,
    )
    return res.status_code == 200


def create_tables_via_insert():
    """
    Since Supabase REST API doesn't support DDL, we attempt to verify tables exist.
    If they don't exist, print instructions for the user to run the SQL manually.
    """
    print("=" * 60)
    print("DEVGYA Chat Tables Migration Check")
    print("=" * 60)

    conv_exists = check_table_exists("chat_conversations")
    msg_exists = check_table_exists("chat_messages")

    if conv_exists and msg_exists:
        print("\n[OK] Both tables already exist in Supabase!")
        print("   - chat_conversations: OK")
        print("   - chat_messages: OK")
        print("\nNo migration needed.")
        return True

    print(f"\n[MISSING] chat_conversations exists: {conv_exists}")
    print(f"[MISSING] chat_messages exists: {msg_exists}")

    print("\n" + "=" * 60)
    print("ACTION REQUIRED: Run the following SQL in your Supabase Dashboard")
    print("Go to: https://supabase.com/dashboard -> SQL Editor")
    print("=" * 60)

    sql = """
-- DEVGYA AI Chat History Tables (Phase 5)

CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    agent_code TEXT DEFAULT NULL,
    language TEXT NOT NULL DEFAULT 'english',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conv_user ON public.chat_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conv_agent ON public.chat_conversations(user_id, agent_code, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_msg_conv ON public.chat_messages(conversation_id, created_at ASC);

-- Enable RLS (allow service role full access)
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS chat_conv_service_all ON public.chat_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS chat_msg_service_all ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);
"""

    print(sql)
    print("=" * 60)
    print("After running the SQL above, re-run this script to verify.\n")
    return False


if __name__ == "__main__":
    create_tables_via_insert()
