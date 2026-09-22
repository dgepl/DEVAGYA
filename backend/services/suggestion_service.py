import os
import json
import time
import uuid
import logging
import threading
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("suggestion_service")

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
SUGGESTIONS_FILE = DATA_DIR / "suggestions.json"

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://amlvyskjrencrolnppgs.supabase.co").strip().rstrip("/")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

supabase_headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

class SuggestionService:
    """
    Manages user platform feedback, feature suggestions, and bug reports.
    Backed by local cache and synced to Supabase Cloud PostgreSQL for permanent persistence.
    """

    def __init__(self):
        self._suggestions: List[Dict[str, Any]] = self._load()

    def _load(self) -> List[Dict[str, Any]]:
        # 1. Try local cache
        if SUGGESTIONS_FILE.exists():
            try:
                with open(SUGGESTIONS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        return data
            except Exception as e:
                logger.warning(f"Failed to read local suggestions: {e}")

        # 2. Try Supabase Cloud
        cloud_items = self._load_from_cloud()
        if cloud_items:
            self._save_local(cloud_items)
            return cloud_items

        return []

    def _save_local(self, items: List[Dict[str, Any]]):
        try:
            with open(SUGGESTIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(items, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to save local suggestions: {e}")

    def _load_from_cloud(self) -> List[Dict[str, Any]]:
        if not SERVICE_KEY or not SUPABASE_URL:
            return []
        try:
            with httpx.Client(timeout=8.0) as client:
                # 1. Try dedicated user_suggestions table if created
                res = client.get(
                    f"{SUPABASE_URL}/rest/v1/user_suggestions?select=*&order=created_at.desc&limit=500",
                    headers=supabase_headers
                )
                if res.status_code == 200:
                    rows = res.json()
                    if rows:
                        return rows

                # 2. Fallback to ai_conversations store
                res2 = client.get(
                    f"{SUPABASE_URL}/rest/v1/ai_conversations?session_title=like.DEVGYA_SUGGESTION:*&select=chat_history&order=created_at.desc&limit=500",
                    headers=supabase_headers
                )
                if res2.status_code == 200:
                    rows = res2.json()
                    items = []
                    for r in rows:
                        ch = r.get("chat_history")
                        if isinstance(ch, dict) and ch.get("id"):
                            items.append(ch)
                    return items
        except Exception as e:
            logger.warning(f"Could not load suggestions from Supabase Cloud: {e}")
        return []

    def _sync_to_cloud(self, suggestion: Dict[str, Any]):
        if not SERVICE_KEY or not SUPABASE_URL:
            return
        try:
            with httpx.Client(timeout=8.0) as client:
                # 1. Try dedicated table
                res = client.post(
                    f"{SUPABASE_URL}/rest/v1/user_suggestions",
                    headers=supabase_headers,
                    json=suggestion
                )
                if res.status_code in (200, 201):
                    return

                # 2. Reliable fallback to ai_conversations table
                s_id = suggestion.get("id", str(uuid.uuid4()))
                email = suggestion.get("user_email", "user").lower()
                client.post(
                    f"{SUPABASE_URL}/rest/v1/ai_conversations",
                    headers=supabase_headers,
                    json={
                        "session_title": f"DEVGYA_SUGGESTION:{email}:{s_id}",
                        "chat_history": suggestion
                    }
                )
        except Exception as e:
            logger.warning(f"Failed to sync suggestion to Supabase Cloud: {e}")

    def _sync_update_to_cloud(self, s_id: str, updates: Dict[str, Any]):
        if not SERVICE_KEY or not SUPABASE_URL:
            return
        try:
            with httpx.Client(timeout=8.0) as client:
                # 1. Try dedicated table
                client.patch(
                    f"{SUPABASE_URL}/rest/v1/user_suggestions?id=eq.{s_id}",
                    headers=supabase_headers,
                    json=updates
                )
                # 2. Update ai_conversations if stored there
                res = client.get(
                    f"{SUPABASE_URL}/rest/v1/ai_conversations?session_title=like.DEVGYA_SUGGESTION:*:{s_id}&select=id,chat_history&limit=1",
                    headers=supabase_headers
                )
                if res.status_code == 200 and res.json():
                    row = res.json()[0]
                    ch = row.get("chat_history") or {}
                    ch.update(updates)
                    client.patch(
                        f"{SUPABASE_URL}/rest/v1/ai_conversations?id=eq.{row['id']}",
                        headers=supabase_headers,
                        json={"chat_history": ch}
                    )
        except Exception as e:
            logger.warning(f"Failed to sync suggestion update to cloud: {e}")

    def _sync_delete_from_cloud(self, s_id: str):
        if not SERVICE_KEY or not SUPABASE_URL:
            return
        try:
            with httpx.Client(timeout=8.0) as client:
                client.delete(
                    f"{SUPABASE_URL}/rest/v1/user_suggestions?id=eq.{s_id}",
                    headers=supabase_headers
                )
                client.delete(
                    f"{SUPABASE_URL}/rest/v1/ai_conversations?session_title=like.DEVGYA_SUGGESTION:*:{s_id}",
                    headers=supabase_headers
                )
        except Exception as e:
            logger.warning(f"Failed to delete suggestion from cloud: {e}")

    def create_suggestion(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a new suggestion with UTC and IST timestamps and triggers async cloud sync."""
        now_utc = datetime.now(timezone.utc)
        ist_dt = now_utc + timedelta(hours=5, minutes=30)
        s_id = f"sug_{int(time.time()*1000)}_{uuid.uuid4().hex[:6]}"

        suggestion = {
            "id": s_id,
            "user_name": (data.get("user_name") or data.get("name") or "User").strip(),
            "user_email": (data.get("user_email") or data.get("email") or "").strip().lower(),
            "user_role": (data.get("user_role") or data.get("role") or "teacher").strip().lower(),
            "school_name": (data.get("school_name") or "").strip(),
            "feature_id": (data.get("feature_id") or "general").strip(),
            "feature_name": (data.get("feature_name") or "General Platform").strip(),
            "category": (data.get("category") or "Feature Request").strip(),
            "title": (data.get("title") or "").strip(),
            "description": (data.get("description") or "").strip(),
            "impact_rating": (data.get("impact_rating") or "Medium").strip(),
            "status": "Under Review",
            "admin_response": None,
            "created_at": now_utc.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
            "created_at_display": ist_dt.strftime("%d %b %Y, %I:%M %p")
        }

        self._suggestions.insert(0, suggestion)
        self._save_local(self._suggestions)

        # Sync to Supabase in a background thread
        threading.Thread(target=self._sync_to_cloud, args=(suggestion,), daemon=True).start()

        return suggestion

    def get_all_suggestions(
        self,
        role: Optional[str] = None,
        feature: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch all suggestions with optional filters."""
        results = self._suggestions

        if role and role != "all":
            results = [s for s in results if s.get("user_role") == role.lower()]

        if feature and feature != "all":
            results = [s for s in results if s.get("feature_id") == feature or s.get("feature_name") == feature]

        if status and status != "all":
            results = [s for s in results if s.get("status", "").lower() == status.lower()]

        if search and search.strip():
            q = search.strip().lower()
            results = [
                s for s in results
                if q in s.get("title", "").lower()
                or q in s.get("description", "").lower()
                or q in s.get("user_name", "").lower()
                or q in s.get("user_email", "").lower()
                or q in s.get("feature_name", "").lower()
            ]

        return results

    def get_user_suggestions(self, email: str) -> List[Dict[str, Any]]:
        """Fetch suggestions submitted by a specific user email."""
        clean_email = email.strip().lower()
        return [s for s in self._suggestions if s.get("user_email") == clean_email]

    def update_suggestion_status(self, s_id: str, status: str, admin_response: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Update suggestion review status and optional admin note."""
        for s in self._suggestions:
            if s.get("id") == s_id:
                s["status"] = status
                if admin_response is not None:
                    s["admin_response"] = admin_response
                s["updated_at"] = datetime.now(timezone.utc).isoformat()
                self._save_local(self._suggestions)
                threading.Thread(
                    target=self._sync_update_to_cloud,
                    args=(s_id, {"status": status, "admin_response": admin_response}),
                    daemon=True
                ).start()
                return s
        return None

    def delete_suggestion(self, s_id: str) -> bool:
        """Permanently delete a suggestion."""
        initial_len = len(self._suggestions)
        self._suggestions = [s for s in self._suggestions if s.get("id") != s_id]
        if len(self._suggestions) < initial_len:
            self._save_local(self._suggestions)
            threading.Thread(target=self._sync_delete_from_cloud, args=(s_id,), daemon=True).start()
            return True
        return False

suggestion_service = SuggestionService()
