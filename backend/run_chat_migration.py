"""Run Supabase chat tables migration via direct PostgreSQL connection."""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

DB_HOST = "aws-0-ap-south-1.pooler.supabase.com"
DB_PORT = 6543
DB_NAME = "postgres"
DB_USER = "postgres.amlvyskjrencrolnppgs"
DB_PASS = SERVICE_KEY

SQL = """
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
"""

def main():
    print("Connecting to Supabase PostgreSQL...")
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            sslmode="require",
            connect_timeout=10,
        )
        print("Connected!")
        cur = conn.cursor()
        cur.execute(SQL)
        conn.commit()
        print("Tables created successfully!")

        cur.execute("SELECT COUNT(*) FROM public.chat_conversations")
        print(f"chat_conversations rows: {cur.fetchone()[0]}")
        cur.execute("SELECT COUNT(*) FROM public.chat_messages")
        print(f"chat_messages rows: {cur.fetchone()[0]}")

        cur.close()
        conn.close()
        print("Migration complete!")
    except Exception as e:
        print(f"Error: {e}")
        print("If connection fails, you may need to run the SQL manually in Supabase Dashboard SQL Editor.")

if __name__ == "__main__":
    main()
