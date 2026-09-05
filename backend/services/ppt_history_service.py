import os
import json
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("ppt_history_service")

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


class PPTHistoryService:
    """
    Persistent Cloud Presentation History Store backed by Supabase Cloud PostgreSQL.
    Strictly scopes decks by authenticated user account.
    Deletions immediately synchronize across all devices.
    """

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()

    def save_deck(self, user_id: str, deck_data: Dict[str, Any]) -> Optional[str]:
        """Save or update an entire presentation deck in Supabase Cloud."""
        if not deck_data or not SERVICE_KEY:
            return None
        clean_user = (user_id or "usr-guest").strip()
        deck_id = str(deck_data.get("id") or f"ppt-{uuid.uuid4().hex[:12]}").strip()

        # Update deck_data ID so it matches
        deck_data["id"] = deck_id
        deck_data["created_at"] = deck_data.get("created_at") or self._now()

        title = str(deck_data.get("title") or deck_data.get("topic") or "Presentation")[:200]
        theme = str(deck_data.get("theme") or "modern_navy")[:50]

        try:
            # 1. Upsert conversation record
            conv_row = {
                "id": deck_id,
                "user_id": clean_user,
                "title": title,
                "agent_code": "ppt_deck",
                "language": theme,
                "updated_at": self._now()
            }
            with httpx.Client(timeout=10.0) as client:
                # Check if exists
                chk = client.get(
                    f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{deck_id}&select=id",
                    headers=HEADERS
                )
                if chk.status_code == 200 and len(chk.json()) > 0:
                    client.patch(
                        f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{deck_id}",
                        headers=HEADERS,
                        json={"title": title, "language": theme, "updated_at": self._now()}
                    )
                else:
                    conv_row["created_at"] = self._now()
                    client.post(
                        f"{SUPABASE_URL}/rest/v1/chat_conversations",
                        headers=HEADERS,
                        json=conv_row
                    )

                # 2. Upsert message containing full JSON slide presentation data
                # Clean existing slide payloads for this deck
                client.delete(
                    f"{SUPABASE_URL}/rest/v1/chat_messages?conversation_id=eq.{deck_id}",
                    headers=HEADERS
                )

                slides = deck_data.get("slides") or []
                image_urls = [s.get("image_url") for s in slides if isinstance(s, dict) and s.get("image_url")]

                msg_row = {
                    "id": f"msg-{uuid.uuid4().hex[:12]}",
                    "conversation_id": deck_id,
                    "sender": "ppt_data",
                    "content": json.dumps(deck_data),
                    "image_urls": image_urls,
                    "created_at": self._now()
                }
                res_msg = client.post(
                    f"{SUPABASE_URL}/rest/v1/chat_messages",
                    headers=HEADERS,
                    json=msg_row
                )
                if res_msg.status_code in (200, 201):
                    return deck_id
        except Exception as e:
            logger.error(f"Error persisting PPT deck {deck_id} for user {clean_user}: {e}")

        return deck_id

    def list_user_decks(self, user_id: str) -> List[Dict[str, Any]]:
        """Fetch all presentation decks belonging strictly to a specific user, newest first."""
        if not SERVICE_KEY:
            return []
        clean_user = (user_id or "usr-guest").strip()

        try:
            with httpx.Client(timeout=10.0) as client:
                # Fetch conversations with ppt_data message in single query
                url = (
                    f"{SUPABASE_URL}/rest/v1/chat_conversations"
                    f"?user_id=eq.{clean_user}&agent_code=eq.ppt_deck"
                    f"&select=id,title,language,created_at,updated_at,chat_messages(content)"
                    f"&order=updated_at.desc&limit=50"
                )
                res = client.get(url, headers=HEADERS)
                if res.status_code != 200:
                    return []

                rows = res.json()
                decks: List[Dict[str, Any]] = []

                for r in rows:
                    deck_id = r.get("id")
                    title = r.get("title") or "Presentation"
                    theme = r.get("language") or "modern_navy"
                    created_at = r.get("created_at")
                    updated_at = r.get("updated_at")

                    # Parse message content to get slides summary
                    messages = r.get("chat_messages") or []
                    deck_json: Dict[str, Any] = {}
                    if messages and isinstance(messages, list):
                        raw_content = messages[0].get("content")
                        if raw_content:
                            try:
                                deck_json = json.loads(raw_content)
                            except Exception:
                                pass

                    num_slides = deck_json.get("num_slides") or len(deck_json.get("slides") or []) or 8
                    topic = deck_json.get("topic") or title
                    target_audience = deck_json.get("target_audience") or "Class 10-12"
                    subtitle = deck_json.get("subtitle") or f"A comprehensive study presentation for {target_audience}"

                    decks.append({
                        "id": deck_id,
                        "title": title,
                        "subtitle": subtitle,
                        "topic": topic,
                        "target_audience": target_audience,
                        "num_slides": num_slides,
                        "theme": theme,
                        "created_at": created_at,
                        "updated_at": updated_at,
                        "slides_count": num_slides
                    })

                return decks
        except Exception as e:
            logger.error(f"Error querying PPT decks for user {clean_user}: {e}")
            return []

    def get_user_deck(self, deck_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full presentation object for a deck, strictly ensuring user ownership."""
        if not SERVICE_KEY:
            return None
        clean_user = (user_id or "usr-guest").strip()

        try:
            with httpx.Client(timeout=10.0) as client:
                # 1. Verify deck belongs to user
                url_chk = f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{deck_id}&user_id=eq.{clean_user}&select=id"
                chk = client.get(url_chk, headers=HEADERS)
                if chk.status_code != 200 or len(chk.json()) == 0:
                    return None

                # 2. Fetch slides payload
                url_msg = f"{SUPABASE_URL}/rest/v1/chat_messages?conversation_id=eq.{deck_id}&sender=eq.ppt_data&limit=1"
                res_msg = client.get(url_msg, headers=HEADERS)
                if res_msg.status_code == 200 and len(res_msg.json()) > 0:
                    content_raw = res_msg.json()[0].get("content")
                    if content_raw:
                        return json.loads(content_raw)
        except Exception as e:
            logger.error(f"Error fetching deck {deck_id} for user {clean_user}: {e}")
            return None

        return None

    def delete_user_deck(self, deck_id: str, user_id: str) -> bool:
        """Permanently delete deck from Supabase Cloud so it syncs across all devices."""
        if not SERVICE_KEY:
            return False
        clean_user = (user_id or "usr-guest").strip()

        try:
            with httpx.Client(timeout=10.0) as client:
                # 1. Verify user owns this deck
                chk = client.get(
                    f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{deck_id}&user_id=eq.{clean_user}&select=id",
                    headers=HEADERS
                )
                if chk.status_code != 200 or len(chk.json()) == 0:
                    return False

                # 2. Delete messages first
                client.delete(
                    f"{SUPABASE_URL}/rest/v1/chat_messages?conversation_id=eq.{deck_id}",
                    headers=HEADERS
                )

                # 3. Delete conversation record
                res = client.delete(
                    f"{SUPABASE_URL}/rest/v1/chat_conversations?id=eq.{deck_id}&user_id=eq.{clean_user}",
                    headers=HEADERS
                )
                return res.status_code in (200, 204)
        except Exception as e:
            logger.error(f"Error deleting deck {deck_id} for user {clean_user}: {e}")
            return False


ppt_history_service = PPTHistoryService()
