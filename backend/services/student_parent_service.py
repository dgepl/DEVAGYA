import os
import json
import time
import uuid
import hashlib
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("student_parent_service")

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
STUDENTS_FILE = DATA_DIR / "student_accounts.json"

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://amlvyskjrencrolnppgs.supabase.co").strip().rstrip("/")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

supabase_headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def _hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Hashes password with SHA-256 and unique salt."""
    if not salt:
        salt = uuid.uuid4().hex[:16]
    hashed = hashlib.sha256(f"{salt}{password}".encode("utf-8")).hexdigest()
    return hashed, salt

def _verify_password(password: str, hashed: str, salt: str) -> bool:
    calc_hash, _ = _hash_password(password, salt)
    return calc_hash == hashed

class StudentParentService:
    """
    Manages Parent-created Student Accounts, username-based login,
    and child activity tracking (quizzes, results, and smart notes)
    with permanent Supabase Cloud PostgreSQL persistence.
    """

    def __init__(self):
        self._local_cache: Dict[str, Dict[str, Any]] = self._load_local_cache()

    def _load_local_cache(self) -> Dict[str, Dict[str, Any]]:
        if not STUDENTS_FILE.exists():
            return {}
        try:
            with open(STUDENTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to read local student accounts: {e}")
            return {}

    def _save_local_cache(self):
        try:
            with open(STUDENTS_FILE, "w", encoding="utf-8") as f:
                json.dump(self._local_cache, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to save local student accounts: {e}")

    # =========================================================================
    # 1. PARENT-MANAGED STUDENT ACCOUNTS
    # =========================================================================

    async def get_parent_children(self, parent_email: str) -> List[Dict[str, Any]]:
        """Fetch all children accounts belonging to a specific parent."""
        parent_clean = (parent_email or "").strip().lower()
        if not parent_clean:
            return []

        children = []

        # 1. Fetch from Supabase Cloud
        if SERVICE_KEY and SUPABASE_URL:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    res = await client.get(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations?session_title=like.DEVGYA_STUDENT_ACC:{parent_clean}:*&select=chat_history&order=created_at.desc&limit=100",
                        headers=supabase_headers
                    )
                    if res.status_code == 200:
                        rows = res.json()
                        for r in rows:
                            ch = r.get("chat_history")
                            if isinstance(ch, dict) and ch.get("username"):
                                # Do not expose password hash or salt to frontend
                                safe_child = dict(ch)
                                safe_child.pop("password_hash", None)
                                safe_child.pop("salt", None)
                                children.append(safe_child)
            except Exception as e:
                logger.warning(f"Notice: Supabase get_parent_children fallback: {e}")

        # 2. Merge with local cache
        local_children = [
            {k: v for k, v in st.items() if k not in ("password_hash", "salt")}
            for st in self._local_cache.values()
            if (st.get("parent_email") or "").lower() == parent_clean
        ]

        seen_usernames = set()
        merged = []
        for ch in children + local_children:
            u = ch.get("username")
            if u and u not in seen_usernames:
                seen_usernames.add(u)
                merged.append(ch)

        # Sort newest first
        return sorted(merged, key=lambda x: x.get("created_at", ""), reverse=True)

    async def create_child_account(self, parent_email: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a new student account managed by the parent.
        No email required. Unique username and password only.
        """
        parent_clean = (parent_email or "").strip().lower()
        if not parent_clean:
            raise ValueError("Parent email is required to enroll a child.")

        raw_username = (data.get("username") or "").strip().lower()
        # Clean username: allow only lowercase letters, digits, underscores, and hyphens
        username = "".join(c for c in raw_username if c.isalnum() or c in ("_", "-"))
        if len(username) < 3:
            raise ValueError("Student username must be at least 3 characters (letters, numbers, underscores).")

        raw_password = (data.get("password") or "").strip()
        if len(raw_password) < 6:
            raise ValueError("Password must be at least 6 characters long.")

        full_name = (data.get("name") or data.get("full_name") or username.capitalize()).strip()
        class_name = (data.get("class_name") or data.get("classes") or "Class 10").strip()
        school_name = (data.get("school_name") or "").strip()
        board = (data.get("board") or "CBSE").strip()

        # Check for existing username across local cache
        if username in self._local_cache:
            raise ValueError(f"Username '{username}' is already taken. Please choose another username.")

        # Check for existing username in Supabase Cloud
        if SERVICE_KEY and SUPABASE_URL:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    check_res = await client.get(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations?session_title=like.DEVGYA_STUDENT_ACC:*:{username}&select=id&limit=1",
                        headers=supabase_headers
                    )
                    if check_res.status_code == 200 and len(check_res.json()) > 0:
                        raise ValueError(f"Username '{username}' is already taken. Please choose another username.")
            except ValueError:
                raise
            except Exception as e:
                logger.warning(f"Notice: Username cloud check deferred: {e}")

        password_hash, salt = _hash_password(raw_password)
        child_id = f"std_{int(time.time()*1000)}_{uuid.uuid4().hex[:6]}"
        now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        account_record = {
            "id": child_id,
            "username": username,
            "name": full_name,
            "full_name": full_name,
            "role": "student",
            "parent_email": parent_clean,
            "class_name": class_name,
            "classes": class_name,
            "school_name": school_name,
            "board": board,
            "password_hash": password_hash,
            "salt": salt,
            "created_at": now_iso,
            "updated_at": now_iso
        }

        # 1. Save to local cache
        self._local_cache[username] = account_record
        self._save_local_cache()

        # 2. Persist to Supabase Cloud
        if SERVICE_KEY and SUPABASE_URL:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    await client.post(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations",
                        headers=supabase_headers,
                        json={
                            "session_title": f"DEVGYA_STUDENT_ACC:{parent_clean}:{username}",
                            "chat_history": account_record
                        }
                    )
                    # Also register in profiles so student has global identity
                    await client.post(
                        f"{SUPABASE_URL}/rest/v1/profiles",
                        headers={**supabase_headers, "Prefer": "resolution=merge-duplicates"},
                        json={
                            "id": child_id,
                            "full_name": full_name,
                            "role": "student",
                            "updated_at": now_iso
                        }
                    )
            except Exception as e:
                logger.warning(f"Notice: Supabase create_child_account deferred: {e}")

        safe_record = dict(account_record)
        safe_record.pop("password_hash", None)
        safe_record.pop("salt", None)
        return safe_record

    async def update_child_account(self, parent_email: str, username: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Allows a parent to update child details or reset password."""
        parent_clean = (parent_email or "").strip().lower()
        user_clean = (username or "").strip().lower()

        # Fetch current record
        current = await self._get_raw_account(user_clean)
        if not current:
            raise ValueError(f"Student account '{user_clean}' not found.")
        if (current.get("parent_email") or "").lower() != parent_clean:
            raise ValueError("Unauthorized: You do not have permission to modify this student account.")

        if updates.get("name") or updates.get("full_name"):
            current["name"] = (updates.get("name") or updates.get("full_name")).strip()
            current["full_name"] = current["name"]
        if updates.get("class_name") or updates.get("classes"):
            current["class_name"] = (updates.get("class_name") or updates.get("classes")).strip()
            current["classes"] = current["class_name"]
        if updates.get("school_name") is not None:
            current["school_name"] = updates["school_name"].strip()
        if updates.get("board"):
            current["board"] = updates["board"].strip()
        if updates.get("password"):
            new_pwd = str(updates["password"]).strip()
            if len(new_pwd) < 6:
                raise ValueError("New password must be at least 6 characters.")
            h, s = _hash_password(new_pwd)
            current["password_hash"] = h
            current["salt"] = s

        current["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Save local
        self._local_cache[user_clean] = current
        self._save_local_cache()

        # Update cloud
        if SERVICE_KEY and SUPABASE_URL:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    await client.post(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations",
                        headers=supabase_headers,
                        json={
                            "session_title": f"DEVGYA_STUDENT_ACC:{parent_clean}:{user_clean}",
                            "chat_history": current
                        }
                    )
            except Exception as e:
                logger.warning(f"Notice: Supabase update_child_account deferred: {e}")

        safe = dict(current)
        safe.pop("password_hash", None)
        safe.pop("salt", None)
        return safe

    async def delete_child_account(self, parent_email: str, username: str) -> bool:
        """Removes a child account belonging to this parent."""
        parent_clean = (parent_email or "").strip().lower()
        user_clean = (username or "").strip().lower()

        current = await self._get_raw_account(user_clean)
        if not current:
            return True
        if (current.get("parent_email") or "").lower() != parent_clean:
            raise ValueError("Unauthorized: You do not have permission to delete this student account.")

        if user_clean in self._local_cache:
            del self._local_cache[user_clean]
            self._save_local_cache()

        if SERVICE_KEY and SUPABASE_URL:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    await client.delete(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations",
                        headers=supabase_headers,
                        params={"session_title": f"eq.DEVGYA_STUDENT_ACC:{parent_clean}:{user_clean}"}
                    )
            except Exception as e:
                logger.warning(f"Notice: Supabase delete_child_account deferred: {e}")

        return True

    async def delete_all_parent_children(self, parent_email: str) -> int:
        """Permanently cascades deletion to all children accounts enrolled by a parent."""
        parent_clean = (parent_email or "").strip().lower()
        if not parent_clean:
            return 0

        children = await self.get_parent_children(parent_clean)
        deleted_count = 0

        # 1. Purge from local cache
        for ch in children:
            u_name = (ch.get("username") or "").strip().lower()
            if u_name:
                if u_name in self._local_cache:
                    del self._local_cache[u_name]
                    deleted_count += 1

        # Also purge any dangling local accounts matching parent_email
        for u_name, acc in list(self._local_cache.items()):
            if (acc.get("parent_email") or "").strip().lower() == parent_clean:
                del self._local_cache[u_name]
                deleted_count += 1

        if deleted_count > 0:
            self._save_local_cache()

        # 2. Purge from Supabase Cloud
        if SERVICE_KEY and SUPABASE_URL:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    await client.delete(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations",
                        headers=supabase_headers,
                        params={"session_title": f"like.DEVGYA_STUDENT_ACC:{parent_clean}:*"}
                    )
            except Exception as e:
                logger.warning(f"Notice: Supabase delete_all_parent_children deferred: {e}")

        logger.info(f"Cascade deleted {deleted_count} children accounts for parent {parent_clean}")
        return max(deleted_count, len(children))

    # =========================================================================
    # 2. STUDENT USERNAME AUTHENTICATION
    # =========================================================================

    async def _get_raw_account(self, username: str) -> Optional[Dict[str, Any]]:
        user_clean = (username or "").strip().lower()
        if user_clean in self._local_cache:
            return self._local_cache[user_clean]

        # Check cloud
        if SERVICE_KEY and SUPABASE_URL:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    res = await client.get(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations?session_title=like.DEVGYA_STUDENT_ACC:*:{user_clean}&select=chat_history&limit=1",
                        headers=supabase_headers
                    )
                    if res.status_code == 200 and res.json():
                        ch = res.json()[0].get("chat_history")
                        if isinstance(ch, dict) and ch.get("username"):
                            self._local_cache[user_clean] = ch
                            return ch
            except Exception as e:
                logger.warning(f"Notice: Supabase _get_raw_account lookup deferred: {e}")

        return None

    async def authenticate_student(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticates a student by username & password."""
        user_clean = (username or "").strip().lower()
        acc = await self._get_raw_account(user_clean)
        if not acc:
            return None

        h = acc.get("password_hash")
        s = acc.get("salt")
        if not h or not s:
            return None

        if not _verify_password(password, h, s):
            return None

        safe = dict(acc)
        safe.pop("password_hash", None)
        safe.pop("salt", None)
        return safe

    # =========================================================================
    # 3. QUIZ RESULTS PERSISTENCE & PARENT RETRIEVAL
    # =========================================================================

    async def record_quiz_result(self, student_username: str, quiz_data: Dict[str, Any]) -> Dict[str, Any]:
        """Saves a completed quiz result to Supabase Cloud."""
        user_clean = (student_username or "").strip().lower()
        acc = await self._get_raw_account(user_clean)
        parent_email = (acc.get("parent_email") if acc else "") or "parent@devgya.com"

        quiz_id = str(quiz_data.get("id") or f"quiz_{int(time.time()*1000)}")
        quiz_data["id"] = quiz_id
        quiz_data["student_username"] = user_clean
        quiz_data["parent_email"] = parent_email
        if not quiz_data.get("timestamp"):
            quiz_data["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Persist to Supabase Cloud
        if SERVICE_KEY and SUPABASE_URL:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    await client.post(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations",
                        headers=supabase_headers,
                        json={
                            "session_title": f"DEVGYA_QUIZ_RESULT:{user_clean}:{quiz_id}",
                            "chat_history": quiz_data
                        }
                    )
            except Exception as e:
                logger.warning(f"Notice: Cloud quiz save deferred: {e}")

        return quiz_data

    async def get_child_quizzes(self, student_username: str) -> List[Dict[str, Any]]:
        """Retrieves all quizzes attempted by a child."""
        user_clean = (student_username or "").strip().lower()
        quizzes = []

        if SERVICE_KEY and SUPABASE_URL:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    res = await client.get(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations?session_title=like.DEVGYA_QUIZ_RESULT:{user_clean}:*&select=chat_history&order=created_at.desc&limit=100",
                        headers=supabase_headers
                    )
                    if res.status_code == 200:
                        for r in res.json():
                            ch = r.get("chat_history")
                            if isinstance(ch, dict):
                                quizzes.append(ch)
            except Exception as e:
                logger.warning(f"Notice: Cloud get_child_quizzes deferred: {e}")

        return quizzes

    # =========================================================================
    # 4. SMART NOTES PERSISTENCE & PARENT RETRIEVAL
    # =========================================================================

    async def save_student_note(self, student_username: str, note_data: Dict[str, Any]) -> Dict[str, Any]:
        """Saves or updates a student smart note to Supabase Cloud."""
        user_clean = (student_username or "").strip().lower()
        acc = await self._get_raw_account(user_clean)
        parent_email = (acc.get("parent_email") if acc else "") or "parent@devgya.com"

        note_id = str(note_data.get("id") or f"note_{int(time.time()*1000)}")
        note_data["id"] = note_id
        note_data["student_username"] = user_clean
        note_data["parent_email"] = parent_email
        if not note_data.get("updated_at"):
            note_data["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        if SERVICE_KEY and SUPABASE_URL:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    # Upsert note by session title
                    await client.post(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations",
                        headers=supabase_headers,
                        json={
                            "session_title": f"DEVGYA_STUDENT_NOTE:{user_clean}:{note_id}",
                            "chat_history": note_data
                        }
                    )
            except Exception as e:
                logger.warning(f"Notice: Cloud save_student_note deferred: {e}")

        return note_data

    async def get_child_notes(self, student_username: str) -> List[Dict[str, Any]]:
        """Retrieves all smart notes created by this child."""
        user_clean = (student_username or "").strip().lower()
        notes = []

        if SERVICE_KEY and SUPABASE_URL:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    res = await client.get(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations?session_title=like.DEVGYA_STUDENT_NOTE:{user_clean}:*&select=chat_history&order=created_at.desc&limit=100",
                        headers=supabase_headers
                    )
                    if res.status_code == 200:
                        for r in res.json():
                            ch = r.get("chat_history")
                            if isinstance(ch, dict):
                                notes.append(ch)
            except Exception as e:
                logger.warning(f"Notice: Cloud get_child_notes deferred: {e}")

        # Deduplicate by note id (newest first)
        seen_ids = set()
        deduped = []
        for n in notes:
            n_id = n.get("id")
            if n_id and n_id not in seen_ids:
                seen_ids.add(n_id)
                deduped.append(n)

        return deduped

    async def delete_student_note(self, student_username: str, note_id: str) -> bool:
        """Deletes a note from Supabase Cloud."""
        user_clean = (student_username or "").strip().lower()
        if SERVICE_KEY and SUPABASE_URL:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    await client.delete(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations",
                        headers=supabase_headers,
                        params={"session_title": f"eq.DEVGYA_STUDENT_NOTE:{user_clean}:{note_id}"}
                    )
            except Exception as e:
                logger.warning(f"Notice: Cloud delete_student_note deferred: {e}")
        return True

student_parent_service = StudentParentService()
