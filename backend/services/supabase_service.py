import os
import httpx
import logging
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("supabase_service")

def _clean_supabase_url() -> str:
    url = os.getenv("SUPABASE_URL", "https://amlvyskjrencrolnppgs.supabase.co").strip().rstrip("/")
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url if url else "https://amlvyskjrencrolnppgs.supabase.co"
    return url

SUPABASE_URL = _clean_supabase_url()
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

import hashlib
import secrets
import json
from pathlib import Path

PASSWORD_FILE = Path(__file__).parent.parent / "data" / "user_passwords.json"

def _load_password_store() -> Dict[str, str]:
    if PASSWORD_FILE.exists():
        try:
            with open(PASSWORD_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading password store: {e}")
            return {}
    return {}

def _save_password_store(store: Dict[str, str]):
    try:
        PASSWORD_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(PASSWORD_FILE, "w", encoding="utf-8") as f:
            json.dump(store, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to persist password store: {e}")

_password_store: Dict[str, str] = _load_password_store()

TEACHER_PROFILES_FILE = Path(__file__).parent.parent / "data" / "teacher_profiles.json"

def _load_teacher_profiles() -> Dict[str, Dict[str, Any]]:
    if TEACHER_PROFILES_FILE.exists():
        try:
            with open(TEACHER_PROFILES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading teacher profiles: {e}")
            return {}
    return {}

def _save_teacher_profiles(profiles: Dict[str, Dict[str, Any]]):
    try:
        TEACHER_PROFILES_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(TEACHER_PROFILES_FILE, "w", encoding="utf-8") as f:
            json.dump(profiles, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to persist teacher profiles: {e}")

_teacher_profiles_store: Dict[str, Dict[str, Any]] = _load_teacher_profiles()

class SupabaseService:
    def hash_password(self, password: str) -> str:
        salt = secrets.token_hex(16)
        pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
        return f"{salt}:{pwd_hash}"

    def verify_password(self, password: str, stored_hash: str) -> bool:
        if not stored_hash or ":" not in stored_hash:
            return False
        salt, pwd_hash = stored_hash.split(":", 1)
        check_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
        return secrets.compare_digest(check_hash, pwd_hash)

    def set_user_password(self, email: str, password: str):
        email_clean = email.strip().lower()
        _password_store[email_clean] = self.hash_password(password)
        _save_password_store(_password_store)

    def check_user_password(self, email: str, password: str) -> bool:
        email_clean = email.strip().lower()
        stored = _password_store.get(email_clean)
        if not stored:
            # If account has no password set in persistent store, register this initial password
            self.set_user_password(email_clean, password)
            return True
        return self.verify_password(password, stored)

    def save_teacher_profile_details(
        self,
        email: str,
        full_name: Optional[str] = None,
        school_name: Optional[str] = None,
        board: Optional[str] = None,
        subject: Optional[str] = None,
        classes: Optional[str] = None,
        school_logo: Optional[str] = None
    ) -> Dict[str, Any]:
        """Save teacher and institutional profile metadata."""
        email_clean = email.strip().lower()
        current = _teacher_profiles_store.get(email_clean, {})
        
        if full_name: current["full_name"] = full_name
        if school_name is not None: current["school_name"] = school_name
        if board is not None: current["board"] = board
        if subject is not None: current["subject"] = subject
        if classes is not None: current["classes"] = classes
        if school_logo is not None: current["school_logo"] = school_logo
        
        current["updated_at"] = os.getenv("APP_TIME", "2026-08-23T10:00:00")
        current["is_profile_complete"] = bool(current.get("school_name") and current.get("subject"))

        _teacher_profiles_store[email_clean] = current
        _save_teacher_profiles(_teacher_profiles_store)
        return current

    async def get_profile_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Fetch user profile from Supabase Cloud and merge with teacher profile store."""
        email_clean = email.strip().lower()
        profile_data = None
        
        if SERVICE_KEY:
            url = f"{SUPABASE_URL}/rest/v1/profiles?email=eq.{email_clean}&select=*"
            async with httpx.AsyncClient(timeout=10.0) as client:
                try:
                    res = await client.get(url, headers=headers)
                    if res.status_code == 200:
                        data = res.json()
                        if data:
                            profile_data = data[0]
                except Exception as e:
                    logger.error(f"Error fetching Supabase profile for {email}: {e}")
        
        # If no supabase record, fallback from local store
        if not profile_data and email_clean in _password_store:
            profile_data = {
                "id": f"usr-{email_clean.split('@')[0]}",
                "email": email_clean,
                "full_name": email_clean.split('@')[0].capitalize(),
                "role": "teacher",
                "is_active": True
            }

        if profile_data:
            extra = _teacher_profiles_store.get(email_clean, {})
            profile_data["school_name"] = extra.get("school_name", profile_data.get("school_name", ""))
            profile_data["board"] = extra.get("board", profile_data.get("board", "CBSE"))
            profile_data["subject"] = extra.get("subject", profile_data.get("subject", ""))
            profile_data["classes"] = extra.get("classes", profile_data.get("classes", "Class 10"))
            profile_data["school_logo"] = extra.get("school_logo", profile_data.get("school_logo", ""))
            profile_data["is_profile_complete"] = extra.get("is_profile_complete", bool(profile_data.get("school_name") and profile_data.get("subject")))

        return profile_data

    async def create_profile(
        self, 
        email: str, 
        full_name: str, 
        role: str, 
        school_name: Optional[str] = "",
        board: Optional[str] = "CBSE",
        subject: Optional[str] = "",
        classes: Optional[str] = "Class 10",
        school_logo: Optional[str] = ""
    ) -> Dict[str, Any]:
        """Create real profile record in Supabase Cloud public.profiles table."""
        email_clean = email.strip().lower()
        
        # Check if already exists
        existing = await self.get_profile_by_email(email_clean)
        if existing:
            return existing

        # Save metadata to local store
        self.save_teacher_profile_details(
            email=email_clean,
            full_name=full_name,
            school_name=school_name,
            board=board,
            subject=subject,
            classes=classes,
            school_logo=school_logo
        )

        url = f"{SUPABASE_URL}/rest/v1/profiles"
        payload = {
            "email": email_clean,
            "full_name": full_name,
            "role": role,
            "is_active": True
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code in (200, 201):
                    created = res.json()
                    record = created[0] if isinstance(created, list) else created
                    logger.info(f"Created real Supabase profile for {email_clean}")
                    
                    if role == "student":
                        await self._create_student_record(record.get("id"))
                    
                    # Merge extra fields
                    record["school_name"] = school_name
                    record["board"] = board
                    record["subject"] = subject
                    record["classes"] = classes
                    record["school_logo"] = school_logo
                    return record
                else:
                    logger.error(f"Supabase create profile error ({res.status_code}): {res.text}")
            except Exception as e:
                logger.error(f"Supabase connection error: {e}")
                
        # Return clean production fallback record
        return {
            "id": f"usr-{email_clean.split('@')[0]}",
            "email": email_clean,
            "full_name": full_name,
            "role": role,
            "school_name": school_name,
            "board": board,
            "subject": subject,
            "classes": classes,
            "school_logo": school_logo
        }

    async def _create_student_record(self, profile_id: str):
        """Create student gamification profile in Supabase Cloud public.students."""
        url = f"{SUPABASE_URL}/rest/v1/students"
        payload = {
            "profile_id": profile_id,
            "grade": "Class 10",
            "xp_points": 100,
            "user_level": 1,
            "streak_days": 1
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                await client.post(url, headers=headers, json=payload)
            except Exception as e:
                logger.error(f"Error creating student record: {e}")

    async def get_all_profiles(self) -> list:
        """Fetch all user profiles and enrich with school and teacher details."""
        profiles = []
        if SERVICE_KEY:
            url = f"{SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc"
            async with httpx.AsyncClient(timeout=10.0) as client:
                try:
                    res = await client.get(url, headers=headers)
                    if res.status_code == 200:
                        profiles = res.json()
                except Exception as e:
                    logger.error(f"Error fetching all Supabase profiles: {e}")

        # Enrich every profile with teacher store metadata
        for p in profiles:
            email_clean = (p.get("email") or "").strip().lower()
            extra = _teacher_profiles_store.get(email_clean, {})
            p["school_name"] = extra.get("school_name", p.get("school_name", ""))
            p["board"] = extra.get("board", p.get("board", "CBSE"))
            p["subject"] = extra.get("subject", p.get("subject", ""))
            p["classes"] = extra.get("classes", p.get("classes", "Class 10"))
            p["school_logo"] = extra.get("school_logo", p.get("school_logo", ""))
            p["is_profile_complete"] = extra.get("is_profile_complete", bool(p.get("school_name") and p.get("subject")))

        return profiles

    async def delete_profile(self, profile_id: str) -> bool:
        """Delete user profile from Supabase Cloud by profile_id."""
        if not SERVICE_KEY:
            return False
        url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{profile_id}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.delete(url, headers=headers)
                return res.status_code in (200, 204)
            except Exception as e:
                logger.error(f"Error deleting Supabase profile {profile_id}: {e}")
        return False

supabase_service = SupabaseService()
