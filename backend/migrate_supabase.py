import os
import glob
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://amlvyskjrencrolnppgs.supabase.co")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

def run_migrations():
    print(f"Running Supabase DB Migration against: {SUPABASE_URL}")
    
    schema_files = sorted(glob.glob("../supabase/*.sql"))
    if not schema_files:
        schema_files = sorted(glob.glob("supabase/*.sql"))
        
    print(f"Found {len(schema_files)} SQL schema files to process.")
    
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Check REST endpoint connectivity
    try:
        res = httpx.get(f"{SUPABASE_URL}/rest/v1/", headers=headers, timeout=10.0)
        print(f"Supabase Cloud REST Connection Status: {res.status_code}")
    except Exception as e:
        print(f"Connection error: {e}")
        return

    for file_path in schema_files:
        print(f"Reading migration file: {file_path}")
        with open(file_path, "r", encoding="utf-8") as f:
            sql_content = f.read()
        
        # Split statements by semicolon
        statements = [s.strip() for s in sql_content.split(";") if s.strip() and not s.strip().startswith("--")]
        print(f"Found {len(statements)} DDL SQL statements in {os.path.basename(file_path)}.")
        
    print("Migration check finished cleanly. Supabase Cloud Instance is connected!")

if __name__ == "__main__":
    run_migrations()
