import os
import json
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("chat_history_service")

def _clean_supabase_url() -> str:
    url = os.getenv("SUPABASE_URL", "https://amlvyskjrencrolnppgs.supabase.co").strip().rstrip("/")
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url if url else "https://amlvyskjrencrolnppgs.supabase.co"
    return url

SUPABASE_URL = _clean_supabase_url()
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


class ChatHistoryService:
    """Persistent chat history store backed by Supabase Cloud PostgreSQL."""

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _parse_image_urls(value) -> list:
        """Ensure image_urls is always a proper Python list."""
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                return parsed if isinstance(parsed, list) else []
            except Exception:
                return []
        return []

    @staticmethod
    def _conv_id() -> str:
        return f"conv-{uuid.uuid4().hex}"

    @staticmethod
    def _msg_id() -> str:
        return f"msg-{uuid.uuid4().hex}"

    # ------------------------------------------------------------------
    # CONVERSATIONS
    # ------------------------------------------------------------------

    def list_conversations(
        self, user_id: str, agent_code: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Return all conversations for a user, newest first, optionally filtered by agent_code."""
        try:
            url = f"{SUPABASE_URL}/rest/v1/chat_conversations"
            params = f"user_id=eq.{user_id}&select=*&order=updated_at.desc"
            if agent_code is not None:
                params += f"&agent_code=eq.{agent_code}"
            else:
                params += "&agent_code=is.null"

            with httpx.Client(timeout=10.0) as client:
                res = client.get(f"{url}?{params}", headers=HEADERS)
                if res.status_code == 200:
                    convs = res.json()
                    # Attach message_count for each conversation
                    for conv in convs:
                        conv["message_count"] = self._get_message_count(conv["id"])
                    return convs
        except Exception as e:
            logger.error(f"list_conversations error: {e}")
        return []

    def _get_message_count(self, conversation_id: str) -> int:
        try:
            url = f"{SUPABASE_URL}/rest/v1/chat_messages?conversation_id=eq.{conversation_id}&sender=eq.user&select=id"
            headers_count = {**HEADERS, "Prefer": "count=exact"}
            with httpx.Client(timeout=5.0) as client:
                res = client.get(url, headers=headers_count)
                # Use content-range header for count
                cr = res.headers.get("content-range", "")
                if "/" in cr:
                    total = cr.split("/")[-1]
                    if total != "*":
                        return int(total)
                return len(res.json()) if res.status_code == 200 else 0
        except Exception:
            return 0

    def get_conversation(
        self, conversation_id: str, user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Return a conversation with its full message history (oldest first)."""
        try:
            # Fetch conversation record
            url = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{conversation_id}&user_id=eq.{user_id}&select=*"
            with httpx.Client(timeout=10.0) as client:
                res = client.get(url, headers=HEADERS)
                if res.status_code != 200 or not res.json():
                    return None
                conv = res.json()[0]

            # Fetch messages
            msg_url = f"{SUPABASE_URL}/rest/v1/chat_messages?conversation_id=eq.{conversation_id}&select=*&order=created_at.asc"
            with httpx.Client(timeout=10.0) as client:
                res = client.get(msg_url, headers=HEADERS)
                msgs = res.json() if res.status_code == 200 else []

            conv["messages"] = [
                {
                    "id": m["id"],
                    "sender": m["sender"],
                    "content": m["content"],
                    "image_urls": self._parse_image_urls(m.get("image_urls")),
                    "created_at": m["created_at"],
                }
                for m in msgs
            ]
            return conv
        except Exception as e:
            logger.error(f"get_conversation error: {e}")
            return None

    def create_conversation(
        self,
        user_id: str,
        title: str = "New Chat",
        agent_code: Optional[str] = None,
        language: str = "english",
    ) -> Dict[str, Any]:
        conv_id = self._conv_id()
        now = self._now()
        payload = {
            "id": conv_id,
            "user_id": user_id,
            "title": title,
            "agent_code": agent_code,
            "language": language,
            "created_at": now,
            "updated_at": now,
        }
        try:
            url = f"{SUPABASE_URL}/rest/v1/chat_conversations"
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, headers=HEADERS, json=payload)
                if res.status_code in (200, 201):
                    created = res.json()
                    return created[0] if isinstance(created, list) else created
        except Exception as e:
            logger.error(f"create_conversation error: {e}")
        return payload  # fallback

    def update_title(self, conversation_id: str, title: str):
        try:
            url = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{conversation_id}"
            with httpx.Client(timeout=10.0) as client:
                client.patch(url, headers=HEADERS, json={"title": title, "updated_at": self._now()})
        except Exception as e:
            logger.error(f"update_title error: {e}")

    def update_language(self, conversation_id: str, language: str):
        try:
            url = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{conversation_id}"
            with httpx.Client(timeout=10.0) as client:
                client.patch(url, headers=HEADERS, json={"language": language, "updated_at": self._now()})
        except Exception as e:
            logger.error(f"update_language error: {e}")

    def touch_conversation(self, conversation_id: str):
        try:
            url = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{conversation_id}"
            with httpx.Client(timeout=10.0) as client:
                client.patch(url, headers=HEADERS, json={"updated_at": self._now()})
        except Exception as e:
            logger.error(f"touch_conversation error: {e}")

    def add_message(
        self,
        conversation_id: str,
        sender: str,
        content: str,
        image_urls: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        msg_id = self._msg_id()
        now = self._now()
        payload = {
            "id": msg_id,
            "conversation_id": conversation_id,
            "sender": sender,
            "content": content,
            "image_urls": json.dumps(image_urls or []),
            "created_at": now,
        }
        try:
            url = f"{SUPABASE_URL}/rest/v1/chat_messages"
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, headers=HEADERS, json=payload)
                if res.status_code in (200, 201):
                    created = res.json()
                    record = created[0] if isinstance(created, list) else created
                    record["image_urls"] = image_urls or []
                    return record
        except Exception as e:
            logger.error(f"add_message error: {e}")
        return {
            "id": msg_id,
            "sender": sender,
            "content": content,
            "image_urls": image_urls or [],
            "created_at": now,
        }

    def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        try:
            # Verify ownership
            url_check = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{conversation_id}&user_id=eq.{user_id}&select=id"
            with httpx.Client(timeout=10.0) as client:
                res = client.get(url_check, headers=HEADERS)
                if res.status_code != 200 or not res.json():
                    return False

            # Delete messages first (CASCADE should handle but explicit is safer)
            msg_url = f"{SUPABASE_URL}/rest/v1/chat_messages?conversation_id=eq.{conversation_id}"
            with httpx.Client(timeout=10.0) as client:
                client.delete(msg_url, headers=HEADERS)

            # Delete conversation
            conv_url = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{conversation_id}"
            with httpx.Client(timeout=10.0) as client:
                client.delete(conv_url, headers=HEADERS)
            return True
        except Exception as e:
            logger.error(f"delete_conversation error: {e}")
            return False


chat_history_service = ChatHistoryService()
