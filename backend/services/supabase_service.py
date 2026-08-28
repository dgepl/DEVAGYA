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
        school_logo: Optional[str] = None,
        avatar_url: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Save teacher, student, or parent profile metadata to local store and sync directly to Supabase Cloud."""
        email_clean = email.strip().lower()
        current = _teacher_profiles_store.get(email_clean, {})
        
        if full_name: current["full_name"] = full_name
        if school_name is not None: current["school_name"] = school_name
        if board is not None: current["board"] = board
        if subject is not None: current["subject"] = subject
        if classes is not None: current["classes"] = classes
        if school_logo is not None: current["school_logo"] = school_logo
        if avatar_url is not None: current["avatar_url"] = avatar_url
        
        for k, v in kwargs.items():
            if v is not None:
                current[k] = v
        
        current["updated_at"] = os.getenv("APP_TIME", "2026-08-23T10:00:00")
        current["is_profile_complete"] = True

        _teacher_profiles_store[email_clean] = current
        _save_teacher_profiles(_teacher_profiles_store)

        # Sync permanently to Supabase Cloud PostgreSQL
        if SERVICE_KEY:
            try:
                meta_json = json.dumps(current)
                patch_payload = {"avatar_url": meta_json}
                if full_name:
                    patch_payload["full_name"] = full_name
                with httpx.Client(timeout=8.0) as client:
                    patch_res = client.patch(
                        f"{SUPABASE_URL}/rest/v1/profiles?email=eq.{email_clean}",
                        headers={**headers, "Prefer": "return=representation"},
                        json=patch_payload
                    )
                    # If row doesn't exist in Supabase profiles table, insert it
                    if patch_res.status_code in (200, 204):
                        rows = patch_res.json() if patch_res.status_code == 200 else []
                        if not rows:
                            insert_row = {
                                "id": f"usr-{email_clean.split('@')[0]}",
                                "email": email_clean,
                                "full_name": full_name or email_clean.split('@')[0].capitalize(),
                                "role": current.get("role", "teacher"),
                                "avatar_url": meta_json,
                                "is_active": True
                            }
                            client.post(
                                f"{SUPABASE_URL}/rest/v1/profiles",
                                headers=headers,
                                json=insert_row
                            )
            except Exception as sync_err:
                logger.warn(f"Supabase Cloud profile sync notice: {sync_err}")

        return current

    async def get_profile_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Fetch user profile from Supabase Cloud and unpack all metadata."""
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
            # Unpack metadata stored in Supabase avatar_url
            raw_avatar = profile_data.get("avatar_url")
            if raw_avatar and isinstance(raw_avatar, str) and raw_avatar.startswith("{") and raw_avatar.endswith("}"):
                try:
                    unpacked = json.loads(raw_avatar)
                    if isinstance(unpacked, dict):
                        # Extract clean image URL if present
                        inner_avatar = unpacked.get("avatar_url", "")
                        if isinstance(inner_avatar, str) and (inner_avatar.startswith("http") or inner_avatar.startswith("data:image")):
                            profile_data["avatar_url"] = inner_avatar
                        else:
                            profile_data["avatar_url"] = ""
                        for k, v in unpacked.items():
                            if k != "avatar_url":
                                profile_data[k] = v
                except Exception:
                    profile_data["avatar_url"] = ""
            elif not raw_avatar or not (isinstance(raw_avatar, str) and (raw_avatar.startswith("http") or raw_avatar.startswith("data:image"))):
                profile_data["avatar_url"] = ""

            # Also merge local fallback store
            extra = _teacher_profiles_store.get(email_clean, {})
            for k, v in extra.items():
                if k not in profile_data or not profile_data[k]:
                    profile_data[k] = v

            # Final sanity check on avatar_url
            final_avatar = profile_data.get("avatar_url")
            if not isinstance(final_avatar, str) or not (final_avatar.startswith("http") or final_avatar.startswith("data:image")):
                profile_data["avatar_url"] = ""

        return profile_data

    async def save_question_paper_to_cloud(self, email: str, paper_data: dict) -> bool:
        """Persist a question paper directly into Supabase Cloud question_papers table."""
        if not paper_data or not SERVICE_KEY:
            return False
        try:
            email_clean = (email or "guest@devgya.com").strip().lower()
            profile = await self.get_profile_by_email(email_clean)
            teacher_id = profile.get("id") if profile else None

            # Difficulty mapping to valid enum
            raw_diff = str(paper_data.get("difficulty") or "medium").lower()
            valid_diffs = {"easy", "medium", "hard", "mixed"}
            diff = raw_diff if raw_diff in valid_diffs else "medium"

            row = {
                "title": str(paper_data.get("title") or "Assessment Exam"),
                "class_name": str(paper_data.get("class_name") or "Class 10"),
                "subject_name": str(paper_data.get("subject") or "General"),
                "chapter_title": str(paper_data.get("chapter") or "General Syllabus"),
                "difficulty": diff,
                "total_marks": int(paper_data.get("total_marks") or 40),
                "time_allowed_mins": int(paper_data.get("time_allowed_mins") or 90),
                "questions": paper_data.get("questions") or [],
                "answer_key": {"instructions": paper_data.get("instructions") or []}
            }
            if teacher_id and "-" in str(teacher_id):
                row["teacher_id"] = teacher_id

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(f"{SUPABASE_URL}/rest/v1/question_papers", headers=headers, json=row)
                return res.status_code in (200, 201)
        except Exception as e:
            logger.warn(f"Cloud question paper save notice: {e}")
            return False

    async def get_question_papers_from_cloud(self, email: str) -> List[Dict[str, Any]]:
        """Retrieve question papers directly from Supabase Cloud."""
        if not SERVICE_KEY:
            return []
        try:
            email_clean = (email or "guest@devgya.com").strip().lower()
            profile = await self.get_profile_by_email(email_clean)
            if not profile or not profile.get("id") or "-" not in str(profile.get("id")):
                return []

            teacher_id = profile.get("id")
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    f"{SUPABASE_URL}/rest/v1/question_papers?teacher_id=eq.{teacher_id}&order=created_at.desc",
                    headers=headers
                )
                if res.status_code == 200:
                    rows = res.json()
                    papers = []
                    for r in rows:
                        answer_data = r.get("answer_key") or {}
                        instructions = answer_data.get("instructions") if isinstance(answer_data, dict) else [
                            "All questions are compulsory.",
                            "Write clear and concise answers."
                        ]
                        papers.append({
                            "title": r.get("title"),
                            "class_name": r.get("class_name"),
                            "subject": r.get("subject_name"),
                            "chapter": r.get("chapter_title"),
                            "difficulty": r.get("difficulty"),
                            "total_marks": r.get("total_marks"),
                            "time_allowed_mins": r.get("time_allowed_mins"),
                            "instructions": instructions or [
                                "All questions are compulsory."
                            ],
                            "questions": r.get("questions") or [],
                            "school_name": profile.get("school_name", "DEVGYA GLOBAL ACADEMY"),
                            "school_logo": profile.get("school_logo", ""),
                            "created_at": r.get("created_at")
                        })
                    return papers
        except Exception as e:
            logger.warn(f"Cloud question paper get notice: {e}")
        return []

    async def delete_question_paper_from_cloud(self, email: str, title: str, class_name: str) -> bool:
        """Delete a question paper from Supabase Cloud."""
        if not SERVICE_KEY:
            return False
        try:
            email_clean = (email or "guest@devgya.com").strip().lower()
            profile = await self.get_profile_by_email(email_clean)
            if not profile or not profile.get("id") or "-" not in str(profile.get("id")):
                return False

            teacher_id = profile.get("id")
            url = f"{SUPABASE_URL}/rest/v1/question_papers?teacher_id=eq.{teacher_id}&title=eq.{title}&class_name=eq.{class_name}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.delete(url, headers=headers)
                return res.status_code in (200, 204)
        except Exception as e:
            logger.warn(f"Cloud question paper delete notice: {e}")
            return False

    async def save_assignment_to_cloud(self, email: str, assignment_data: dict) -> bool:
        """Persist an assignment/worksheet directly into Supabase Cloud question_papers table."""
        if not assignment_data or not SERVICE_KEY:
            return False
        try:
            email_clean = (email or "guest@devgya.com").strip().lower()
            profile = await self.get_profile_by_email(email_clean)
            teacher_id = profile.get("id") if profile else None

            raw_diff = str(assignment_data.get("difficulty") or "medium").lower()
            valid_diffs = {"easy", "medium", "hard", "mixed"}
            diff = raw_diff if raw_diff in valid_diffs else "medium"

            row = {
                "title": str(assignment_data.get("title") or "Assignment Worksheet"),
                "class_name": str(assignment_data.get("class_name") or "Class 10"),
                "subject_name": str(assignment_data.get("subject") or "General"),
                "chapter_title": str(assignment_data.get("chapter_topic") or assignment_data.get("chapter") or "General Syllabus"),
                "difficulty": diff,
                "total_marks": int(assignment_data.get("total_marks") or 25),
                "time_allowed_mins": int(assignment_data.get("time_allowed_mins") or 45),
                "questions": assignment_data.get("questions") or [],
                "answer_key": {"instructions": assignment_data.get("instructions") or []}
            }
            if teacher_id and "-" in str(teacher_id):
                row["teacher_id"] = teacher_id

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(f"{SUPABASE_URL}/rest/v1/question_papers", headers=headers, json=row)
                return res.status_code in (200, 201)
        except Exception as e:
            logger.warn(f"Cloud assignment save notice: {e}")
            return False

    async def create_master_profile(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update a master profile record across Supabase Cloud and local store."""
        email = (data.get("email") or "").strip().lower()
        full_name = data.get("name") or data.get("full_name") or email.split("@")[0].capitalize()
        role = data.get("role", "teacher")
        
        # Save all provided fields in profile details store
        self.save_teacher_profile_details(
            email=email,
            full_name=full_name,
            role=role,
            **{k: v for k, v in data.items() if k not in ("email", "name", "full_name", "role", "password", "otp_code")}
        )
        
        profile = await self.create_profile(
            email=email,
            full_name=full_name,
            role=role,
            school_name=data.get("school_name", ""),
            board=data.get("board", "CBSE"),
            subject=data.get("subject", ""),
            classes=data.get("classes", "Class 10"),
            school_logo=data.get("school_logo", "")
        )
        
        # Merge extra fields
        for k, v in data.items():
            if k not in profile or not profile[k]:
                profile[k] = v
        return profile

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

        # Save metadata to local store & cloud
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
        meta_json = json.dumps({
            "school_name": school_name,
            "board": board,
            "subject": subject,
            "classes": classes,
            "school_logo": school_logo
        })
        payload = {
            "email": email_clean,
            "full_name": full_name,
            "role": role,
            "avatar_url": meta_json,
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

        # Enrich every profile with unpacked metadata and teacher store metadata
        for p in profiles:
            email_clean = (p.get("email") or "").strip().lower()

            # 1. Unpack JSON metadata stored in Supabase avatar_url
            raw_avatar = p.get("avatar_url")
            if raw_avatar and isinstance(raw_avatar, str) and raw_avatar.startswith("{") and raw_avatar.endswith("}"):
                try:
                    unpacked = json.loads(raw_avatar)
                    if isinstance(unpacked, dict):
                        inner_avatar = unpacked.get("avatar_url", "")
                        if isinstance(inner_avatar, str) and (inner_avatar.startswith("http") or inner_avatar.startswith("data:image")):
                            p["avatar_url"] = inner_avatar
                        else:
                            p["avatar_url"] = ""
                        for k, v in unpacked.items():
                            if k != "avatar_url" and v:
                                p[k] = v
                except Exception:
                    p["avatar_url"] = ""
            elif not raw_avatar or not (isinstance(raw_avatar, str) and (raw_avatar.startswith("http") or raw_avatar.startswith("data:image"))):
                p["avatar_url"] = ""

            # 2. Merge local persistent teacher profile store
            extra = _teacher_profiles_store.get(email_clean, {})
            for k, v in extra.items():
                if v and (k not in p or not p[k]):
                    p[k] = v

            # 3. Final default fallbacks and complete flag
            p["full_name"] = p.get("full_name") or email_clean.split('@')[0].capitalize()
            p["board"] = p.get("board") or "CBSE"
            p["classes"] = p.get("classes") or p.get("child_class") or "Class 10"
            p["school_name"] = p.get("school_name") or p.get("child_school") or ""
            
            is_complete = bool(
                p.get("school_name") or 
                p.get("subject") or 
                p.get("target_exam") or 
                p.get("child_name") or 
                extra.get("is_profile_complete")
            )
            p["is_profile_complete"] = is_complete

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

    async def _ensure_default_school_id(self) -> Optional[str]:
        """Ensures a default school exists in Supabase Cloud and returns its UUID."""
        if not SERVICE_KEY:
            return None
        url = f"{SUPABASE_URL}/rest/v1/schools?limit=1"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    schools = res.json()
                    if schools and isinstance(schools, list) and len(schools) > 0:
                        return schools[0].get("id")
                
                # Insert default school if not present
                ins_res = await client.post(
                    f"{SUPABASE_URL}/rest/v1/schools",
                    headers={**headers, "Prefer": "return=representation"},
                    json={
                        "name": "DEVGYA GLOBAL ACADEMY",
                        "board": "CBSE",
                        "contact_email": "admin@devgya.com"
                    }
                )
                if ins_res.status_code in (200, 201):
                    created = ins_res.json()
                    if created and isinstance(created, list) and len(created) > 0:
                        return created[0].get("id")
            except Exception as e:
                logger.error(f"Error ensuring default school in Supabase: {e}")
        return None

    async def save_question_paper_to_cloud(self, email: str, paper_data: dict) -> bool:
        """Persists a question paper into Supabase Cloud PostgreSQL question_papers table."""
        if not SERVICE_KEY or not paper_data:
            return False
        email_clean = (email or "guest@devgya.com").strip().lower()
        
        try:
            profile = await self.get_profile_by_email(email_clean)
            teacher_id = profile.get("id") if profile else None
            if not teacher_id:
                return False

            school_id = await self._ensure_default_school_id()
            if not school_id:
                return False

            title = str(paper_data.get("title") or "Assessment Examination")
            class_name = str(paper_data.get("class_name") or "Class 10")
            subject_name = str(paper_data.get("subject") or "Science")
            chapter_title = str(paper_data.get("chapter") or "General Syllabus")
            difficulty = str(paper_data.get("difficulty") or "medium").lower()
            if difficulty not in ("easy", "medium", "hard", "hots"):
                difficulty = "medium"
            total_marks = int(paper_data.get("total_marks") or 80)
            time_allowed = int(paper_data.get("time_allowed_mins") or 180)
            questions_list = paper_data.get("questions") or []

            # Prepare answer key summary
            answer_keys = [str(q.get("answer") or "") for q in questions_list if isinstance(q, dict)]

            row = {
                "teacher_id": teacher_id,
                "school_id": school_id,
                "title": title,
                "class_name": class_name,
                "subject_name": subject_name,
                "chapter_title": chapter_title,
                "difficulty": difficulty,
                "total_marks": total_marks,
                "time_allowed_mins": time_allowed,
                "questions": questions_list,
                "answer_key": answer_keys
            }

            async with httpx.AsyncClient(timeout=10.0) as client:
                # Check if paper with same title and class already exists for this teacher
                q_url = f"{SUPABASE_URL}/rest/v1/question_papers?teacher_id=eq.{teacher_id}&title=eq.{title}&class_name=eq.{class_name}"
                check_res = await client.get(q_url, headers=headers)
                if check_res.status_code == 200 and check_res.json():
                    # Update existing paper
                    existing_id = check_res.json()[0]["id"]
                    patch_res = await client.patch(
                        f"{SUPABASE_URL}/rest/v1/question_papers?id=eq.{existing_id}",
                        headers=headers,
                        json=row
                    )
                    return patch_res.status_code in (200, 204)
                else:
                    # Insert new paper
                    ins_res = await client.post(
                        f"{SUPABASE_URL}/rest/v1/question_papers",
                        headers=headers,
                        json=row
                    )
                    return ins_res.status_code in (200, 201)
        except Exception as e:
            logger.error(f"Error saving question paper to Supabase Cloud: {e}")
            return False

    async def get_question_papers_from_cloud(self, email: str) -> list:
        """Retrieves user's question papers from Supabase Cloud."""
        if not SERVICE_KEY:
            return []
        email_clean = (email or "").strip().lower()
        if not email_clean or "guest" in email_clean:
            return []

        try:
            profile = await self.get_profile_by_email(email_clean)
            if not profile or not profile.get("id"):
                return []
            teacher_id = profile["id"]

            url = f"{SUPABASE_URL}/rest/v1/question_papers?teacher_id=eq.{teacher_id}&order=created_at.desc"
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    rows = res.json()
                    papers = []
                    for r in rows:
                        raw_qs = r.get("questions") or []
                        if isinstance(raw_qs, str):
                            try:
                                raw_qs = json.loads(raw_qs)
                            except Exception:
                                raw_qs = []
                        papers.append({
                            "id": r.get("id"),
                            "title": r.get("title"),
                            "class_name": r.get("class_name"),
                            "subject": r.get("subject_name"),
                            "chapter": r.get("chapter_title"),
                            "difficulty": r.get("difficulty"),
                            "total_marks": r.get("total_marks"),
                            "time_allowed_mins": r.get("time_allowed_mins"),
                            "instructions": [
                                "All questions are compulsory.",
                                "Read all questions carefully before attempting."
                            ],
                            "questions": raw_qs,
                            "school_name": "DEVGYA GLOBAL ACADEMY",
                            "user_email": email_clean,
                            "created_at": r.get("created_at")
                        })
                    return papers
        except Exception as e:
            logger.error(f"Error fetching question papers from Supabase Cloud: {e}")
        return []

    async def delete_question_paper_from_cloud(self, email: str, title: str, class_name: Optional[str] = None, paper_id: Optional[str] = None) -> bool:
        """Permanently deletes a question paper from Supabase Cloud."""
        if not SERVICE_KEY:
            return False
        email_clean = (email or "").strip().lower()
        try:
            profile = await self.get_profile_by_email(email_clean)
            if not profile or not profile.get("id"):
                return False
            teacher_id = profile["id"]

            async with httpx.AsyncClient(timeout=10.0) as client:
                if paper_id:
                    del_url = f"{SUPABASE_URL}/rest/v1/question_papers?id=eq.{paper_id}&teacher_id=eq.{teacher_id}"
                elif class_name:
                    del_url = f"{SUPABASE_URL}/rest/v1/question_papers?teacher_id=eq.{teacher_id}&title=eq.{title}&class_name=eq.{class_name}"
                else:
                    del_url = f"{SUPABASE_URL}/rest/v1/question_papers?teacher_id=eq.{teacher_id}&title=eq.{title}"

                res = await client.delete(del_url, headers=headers)
                return res.status_code in (200, 204)
        except Exception as e:
            logger.error(f"Error deleting question paper from Supabase Cloud: {e}")
        return False

    async def save_assignment_to_cloud(self, email: str, assignment_data: dict) -> bool:
        """Persists an assignment into cloud profile metadata / store."""
        if not assignment_data:
            return False
        email_clean = (email or "guest@devgya.com").strip().lower()
        try:
            profile = await self.get_profile_by_email(email_clean)
            if profile:
                asg_list = profile.get("assignments") or []
                if not isinstance(asg_list, list):
                    asg_list = []
                asg_id = assignment_data.get("id")
                asg_title = assignment_data.get("title")
                filtered = [a for a in asg_list if not ((asg_id and a.get("id") == asg_id) or (a.get("title") == asg_title))]
                updated = [assignment_data] + filtered
                self.save_teacher_profile_details(email_clean, assignments=updated[:50])
                return True
        except Exception as e:
            logger.error(f"Error saving assignment to cloud: {e}")
        return False

    async def get_assignments_from_cloud(self, email: str) -> list:
        """Retrieves user's assignments from cloud profile metadata."""
        email_clean = (email or "").strip().lower()
        if not email_clean or "guest" in email_clean:
            return []
        try:
            profile = await self.get_profile_by_email(email_clean)
            if profile and isinstance(profile.get("assignments"), list):
                return profile["assignments"]
        except Exception as e:
            logger.error(f"Error fetching assignments from cloud: {e}")
        return []

    async def delete_assignment_from_cloud(self, email: str, title: Optional[str] = None, class_name: Optional[str] = None, asg_id: Optional[str] = None) -> bool:
        """Deletes an assignment from cloud metadata store."""
        email_clean = (email or "").strip().lower()
        try:
            profile = await self.get_profile_by_email(email_clean)
            if profile and isinstance(profile.get("assignments"), list):
                filtered = [
                    a for a in profile["assignments"]
                    if not ((asg_id and a.get("id") == asg_id) or (title and a.get("title") == title and (not class_name or a.get("class_name") == class_name)))
                ]
                self.save_teacher_profile_details(email_clean, assignments=filtered)
                return True
        except Exception as e:
            logger.error(f"Error deleting assignment from cloud: {e}")
        return False

supabase_service = SupabaseService()
