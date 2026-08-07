"""
Supabase XP Table Migration Script.
Checks if user_xp table exists and prints SQL to create it.

Usage:
    python migrate_xp_table.py
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

SQL = """
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_xp_user_id ON user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_user_xp_leaderboard ON user_xp(total_xp DESC);
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
"""


def check_table():
    res = httpx.get(
        f"{SUPABASE_URL}/rest/v1/user_xp?select=id&limit=1",
        headers=HEADERS,
    )
    return res.status_code == 200


def main():
    print("=" * 60)
    print("DEVGYA XP Table Migration Check")
    print("=" * 60)

    if check_table():
        print("\n[OK] user_xp table already exists!")
        # Test insert
        test = httpx.post(
            f"{SUPABASE_URL}/rest/v1/user_xp",
            headers=HEADERS,
            json={
                "user_id": "test-migration",
                "user_name": "Migration Test",
                "total_xp": 0,
                "level": 1,
                "streak": 0,
            },
        )
        print(f"    Insert test: {test.status_code}")
        if test.status_code in (200, 201, 409):
            print("    [OK] Table is writable!")
            # Clean up test row
            httpx.delete(
                f"{SUPABASE_URL}/rest/v1/user_xp?user_id=eq.test-migration",
                headers=HEADERS,
            )
        else:
            print(f"    [WARN] Insert failed: {test.text}")
    else:
        print("\n[MISSING] user_xp table does NOT exist!")
        print("\nYou MUST run this SQL in Supabase Dashboard > SQL Editor:")
        print("-" * 60)
        print(SQL)
        print("-" * 60)

        # Extract project ref from URL
        project_ref = SUPABASE_URL.split("//")[1].split(".")[0] if SUPABASE_URL else "YOUR_PROJECT"
        print(f"\nOpen: https://supabase.com/dashboard/project/{project_ref}/sql/new")
        print("Paste the SQL above and click 'Run'")


if __name__ == "__main__":
    main()
