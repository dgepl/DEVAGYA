import os
import json
import time
import uuid
import hashlib
import logging
from datetime import datetime, timedelta, timezone
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
                    # Purge student account records
                    await client.delete(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations",
                        headers=supabase_headers,
                        params={"session_title": f"like.DEVGYA_STUDENT_ACC:{parent_clean}:*"}
                    )
                    # Purge quizzes, smart notes, and profiles for each enrolled child
                    for ch in children:
                        u_name = (ch.get("username") or "").strip().lower()
                        ch_id = ch.get("id")
                        if u_name:
                            await client.delete(
                                f"{SUPABASE_URL}/rest/v1/ai_conversations",
                                headers=supabase_headers,
                                params={"session_title": f"like.DEVGYA_STUDENT_QUIZZES:{u_name}:*"}
                            )
                            await client.delete(
                                f"{SUPABASE_URL}/rest/v1/ai_conversations",
                                headers=supabase_headers,
                                params={"session_title": f"like.DEVGYA_STUDENT_NOTES:{u_name}:*"}
                            )
                        if ch_id:
                            await client.delete(
                                f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{ch_id}",
                                headers=supabase_headers
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

    # =========================================================================
    # 5. STUDENT PERFORMANCE & WEEKLY SUBJECT-WISE REPORTS
    # =========================================================================

    async def get_student_performance_report(
        self, parent_email: str, student_username: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculates and returns:
        1. Average student performance (overall score %, grade status).
        2. Subject-wise average performance breakdown.
        3. Week-wise average performance report for every subject across recent weeks.
        """
        parent_clean = (parent_email or "").strip().lower()
        children = await self.get_parent_children(parent_clean)
        if not children:
            return {
                "status": "success",
                "has_children": False,
                "children": [],
                "selected_child": None,
                "overall_average": 0,
                "total_quizzes": 0,
                "performance_status": "No Children Enrolled",
                "status_color": "slate",
                "subject_averages": [],
                "weekly_reports": []
            }

        # Select target child
        selected_child = None
        if student_username:
            u_clean = student_username.strip().lower()
            for ch in children:
                if (ch.get("username") or "").lower() == u_clean:
                    selected_child = ch
                    break

        if not selected_child:
            selected_child = children[0]

        target_username = selected_child.get("username", "").strip().lower()
        quizzes = await self.get_child_quizzes(target_username)

        # 1. Overall Average
        if quizzes:
            percentages = [q.get("percentage", 0) for q in quizzes if isinstance(q.get("percentage"), (int, float))]
            overall_average = round(sum(percentages) / len(percentages), 1) if percentages else 0
        else:
            overall_average = 0

        # Status & Grade
        if overall_average >= 90:
            status = "Outstanding (A1 Grade)"
            status_color = "emerald"
        elif overall_average >= 80:
            status = "Excellent (A2 Grade)"
            status_color = "indigo"
        elif overall_average >= 70:
            status = "Good (B1 Grade)"
            status_color = "cyan"
        elif overall_average >= 60:
            status = "Satisfactory (B2 Grade)"
            status_color = "amber"
        elif overall_average > 0:
            status = "Needs Practice"
            status_color = "rose"
        else:
            status = "Awaiting First Assessment"
            status_color = "slate"

        # 2. Subject-wise Averages across all time
        subject_buckets: Dict[str, List[Dict[str, Any]]] = {}
        for q in quizzes:
            subj = (q.get("subject") or "General").strip().title()
            if subj not in subject_buckets:
                subject_buckets[subj] = []
            subject_buckets[subj].append(q)

        subject_averages = []
        for subj, q_list in sorted(subject_buckets.items(), key=lambda x: len(x[1]), reverse=True):
            pcts = [item.get("percentage", 0) for item in q_list if isinstance(item.get("percentage"), (int, float))]
            avg_pct = round(sum(pcts) / len(pcts), 1) if pcts else 0
            highest = max(pcts) if pcts else 0
            lowest = min(pcts) if pcts else 0
            grade = "A1" if avg_pct >= 90 else "A2" if avg_pct >= 80 else "B1" if avg_pct >= 70 else "B2" if avg_pct >= 60 else "C1"
            subject_averages.append({
                "subject": subj,
                "average": avg_pct,
                "quizzes_count": len(q_list),
                "highest": highest,
                "lowest": lowest,
                "grade": grade
            })

        # 3. Week-wise Performance Report for Every Subject
        now = datetime.now(timezone.utc)
        # Monday 00:00:00 UTC of current week
        current_monday = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)

        weekly_reports = []
        # Build 4 consecutive weeks (Week 0 = This Week, Week 1 = Last Week, etc.)
        for w_idx in range(4):
            w_start = current_monday - timedelta(weeks=w_idx)
            w_end = w_start + timedelta(days=6, hours=23, minutes=59, seconds=59)

            label = (
                "This Week" if w_idx == 0 else
                "Last Week" if w_idx == 1 else
                f"{w_idx} Weeks Ago"
            )
            date_range_str = f"{w_start.strftime('%d %b')} - {w_end.strftime('%d %b')}"

            # Filter quizzes in this window
            week_quizzes = []
            for q in quizzes:
                ts_str = q.get("timestamp")
                if ts_str:
                    try:
                        clean_ts = ts_str.replace("Z", "+00:00")
                        q_dt = datetime.fromisoformat(clean_ts)
                        if w_start <= q_dt <= w_end:
                            week_quizzes.append(q)
                    except Exception:
                        pass

            # Calculate week average
            w_pcts = [q.get("percentage", 0) for q in week_quizzes if isinstance(q.get("percentage"), (int, float))]
            week_avg = round(sum(w_pcts) / len(w_pcts), 1) if w_pcts else None

            # Calculate subject-wise averages for this week
            w_subj_buckets: Dict[str, List[float]] = {}
            for q in week_quizzes:
                s_name = (q.get("subject") or "General").strip().title()
                if s_name not in w_subj_buckets:
                    w_subj_buckets[s_name] = []
                w_subj_buckets[s_name].append(q.get("percentage", 0))

            week_subject_averages = []
            for s_name, scores in sorted(w_subj_buckets.items(), key=lambda x: x[0]):
                s_avg = round(sum(scores) / len(scores), 1) if scores else 0
                week_subject_averages.append({
                    "subject": s_name,
                    "average": s_avg,
                    "quizzes_count": len(scores)
                })

            weekly_reports.append({
                "week_index": w_idx,
                "label": label,
                "date_range": date_range_str,
                "full_label": f"{label} ({date_range_str})",
                "week_average": week_avg,
                "quizzes_count": len(week_quizzes),
                "subject_averages": week_subject_averages
            })

        return {
            "status": "success",
            "has_children": True,
            "children": children,
            "selected_child": selected_child,
            "overall_average": overall_average,
            "total_quizzes": len(quizzes),
            "performance_status": status,
            "status_color": status_color,
            "subject_averages": subject_averages,
            "weekly_reports": weekly_reports,
            "all_quizzes": quizzes[:20]
        }

student_parent_service = StudentParentService()
