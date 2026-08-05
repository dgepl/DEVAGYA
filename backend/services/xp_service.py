"""
XP Service — Manages user XP, levels, streaks, and leaderboard via Supabase.
"""
import os
import httpx
import logging
from datetime import date, timedelta
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("xp_service")

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

XP_PER_LEVEL = 500  # XP needed to level up


def calculate_xp(message: str, has_image: bool = False) -> int:
    """Calculate dynamic XP based on question complexity."""
    length = len(message.strip())
    if length < 20:
        xp = 5
    elif length < 80:
        xp = 10
    elif length < 200:
        xp = 20
    else:
        xp = 30

    # Bonus for image-based questions (more effort)
    if has_image:
        xp += 10

    return xp


class XPService:
    async def get_user_xp(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch XP record for a user."""
        if not SERVICE_KEY:
            return None
        url = f"{SUPABASE_URL}/rest/v1/user_xp?user_id=eq.{user_id}&select=*"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(url, headers=HEADERS)
                if res.status_code == 200:
                    data = res.json()
                    return data[0] if data else None
            except Exception as e:
                logger.error(f"Error fetching XP for {user_id}: {e}")
        return None

    async def award_xp(self, user_id: str, user_name: str, xp_amount: int, user_email: str = "") -> Dict[str, Any]:
        """Award XP to user. Creates record if first time. Returns updated XP info."""
        if not SERVICE_KEY:
            return {"total_xp": xp_amount, "level": 1, "streak": 0, "xp_earned": xp_amount}

        existing = await self.get_user_xp(user_id)
        today = date.today()

        if existing:
            old_xp = existing.get("total_xp", 0)
            new_xp = old_xp + xp_amount
            new_level = max(1, new_xp // XP_PER_LEVEL + 1)

            # Streak logic
            last_active_str = existing.get("last_active", "")
            old_streak = existing.get("streak", 0)
            try:
                last_active = date.fromisoformat(str(last_active_str)) if last_active_str else today
            except (ValueError, TypeError):
                last_active = today

            if last_active == today:
                new_streak = old_streak  # Same day
            elif last_active == today - timedelta(days=1):
                new_streak = old_streak + 1  # Consecutive day
            else:
                new_streak = 1  # Streak broken

            # Update existing record
            url = f"{SUPABASE_URL}/rest/v1/user_xp?user_id=eq.{user_id}"
            payload = {
                "total_xp": new_xp,
                "level": new_level,
                "streak": new_streak,
                "last_active": str(today),
                "updated_at": "now()",
            }
            if user_name:
                payload["user_name"] = user_name

            async with httpx.AsyncClient(timeout=10.0) as client:
                try:
                    res = await client.patch(url, json=payload, headers=HEADERS)
                    if res.status_code in (200, 204):
                        return {
                            "total_xp": new_xp,
                            "level": new_level,
                            "streak": new_streak,
                            "xp_earned": xp_amount,
                        }
                except Exception as e:
                    logger.error(f"Error updating XP for {user_id}: {e}")
        else:
            # Create new record
            new_level = max(1, xp_amount // XP_PER_LEVEL + 1)
            url = f"{SUPABASE_URL}/rest/v1/user_xp"
            payload = {
                "user_id": user_id,
                "user_name": user_name or "Student",
                "user_email": user_email,
                "total_xp": xp_amount,
                "level": new_level,
                "streak": 1,
                "last_active": str(today),
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                try:
                    res = await client.post(url, json=payload, headers=HEADERS)
                    if res.status_code in (200, 201):
                        return {
                            "total_xp": xp_amount,
                            "level": new_level,
                            "streak": 1,
                            "xp_earned": xp_amount,
                        }
                except Exception as e:
                    logger.error(f"Error creating XP for {user_id}: {e}")

        return {"total_xp": xp_amount, "level": 1, "streak": 0, "xp_earned": xp_amount}

    async def get_leaderboard(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch top users by XP."""
        if not SERVICE_KEY:
            return []
        url = f"{SUPABASE_URL}/rest/v1/user_xp?select=user_id,user_name,total_xp,level,streak&order=total_xp.desc&limit={limit}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(url, headers=HEADERS)
                if res.status_code == 200:
                    return res.json()
            except Exception as e:
                logger.error(f"Error fetching leaderboard: {e}")
        return []


xp_service = XPService()
