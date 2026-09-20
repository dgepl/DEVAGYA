import os
import json
import time
import uuid
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional
from services.supabase_service import supabase_service

logger = logging.getLogger("activity_service")

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
ACTIVITY_FILE = DATA_DIR / "user_activity.json"

class ActivityService:
    """
    Tracks real-time user platform actions, page visits, tool invocations, 
    daily active users (DAU), and compiles comprehensive site analytics.
    """
    def __init__(self):
        self.activities: List[Dict[str, Any]] = self._load()

    def _load(self) -> List[Dict[str, Any]]:
        if ACTIVITY_FILE.exists():
            try:
                with open(ACTIVITY_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error reading activity file: {e}")
                return []
        return []

    def _save(self):
        try:
            # Keep the last 15,000 activity events to ensure fast in-memory queries
            if len(self.activities) > 15000:
                self.activities = self.activities[:15000]
            with open(ACTIVITY_FILE, "w", encoding="utf-8") as f:
                json.dump(self.activities, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to persist user activity: {e}")

    def _get_valid_today_dates(self):
        now_utc = datetime.utcnow()
        today_utc = now_utc.strftime("%Y-%m-%d")
        ist_dt = now_utc + timedelta(hours=5, minutes=30)
        today_ist = ist_dt.strftime("%Y-%m-%d")
        return {today_utc, today_ist}, now_utc

    def record_activity(
        self,
        email: str,
        name: Optional[str] = "",
        role: Optional[str] = "teacher",
        action: Optional[str] = "view",
        feature_id: Optional[str] = "",
        feature_name: Optional[str] = "",
        path: Optional[str] = "",
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Record an activity event for a user."""
        if not email or not email.strip():
            return {}

        email_clean = email.strip().lower()
        now_dt = datetime.utcnow()
        ist_dt = now_dt + timedelta(hours=5, minutes=30)
        now_iso = now_dt.isoformat()
        date_str = ist_dt.strftime("%Y-%m-%d")
        hour_str = ist_dt.strftime("%H:00")

        event = {
            "id": f"act_{int(time.time()*1000)}_{uuid.uuid4().hex[:6]}",
            "email": email_clean,
            "name": (name or "").strip() or email_clean.split("@")[0].capitalize(),
            "role": role or "teacher",
            "action": action or "view",
            "feature_id": feature_id or "dashboard",
            "feature_name": feature_name or "Dashboard Visit",
            "path": path or "/dashboard",
            "details": details or {},
            "timestamp": now_iso,
            "date": date_str,
            "date_utc": now_dt.strftime("%Y-%m-%d"),
            "hour": hour_str
        }

        # Insert at the beginning (most recent first)
        self.activities.insert(0, event)
        self._save()
        return event

    def get_today_active_users_summary(self) -> Dict[str, Dict[str, Any]]:
        """
        Returns a dictionary mapping email -> {
            last_active: str,
            features_used_today: List[str],
            actions_count: int,
            name: str,
            role: str,
            first_active: str
        }
        """
        valid_dates, now_utc = self._get_valid_today_dates()
        user_summary: Dict[str, Dict[str, Any]] = {}

        for act in self.activities:
            is_today = (act.get("date") in valid_dates or act.get("date_utc") in valid_dates)
            if not is_today and act.get("timestamp"):
                try:
                    ts = datetime.fromisoformat(act["timestamp"].replace("Z", ""))
                    if (now_utc - ts).total_seconds() < 86400:
                        is_today = True
                except Exception:
                    pass

            if not is_today:
                continue
            
            email = (act.get("email") or "").lower()
            if not email:
                continue

            f_name = act.get("feature_name") or "Dashboard"
            if email not in user_summary:
                user_summary[email] = {
                    "last_active": act.get("timestamp"),
                    "first_active": act.get("timestamp"),
                    "features_used_today": [f_name],
                    "features_used": [f_name],
                    "feature_ids_today": [act.get("feature_id")],
                    "actions_count": 1,
                    "name": act.get("name", email.split("@")[0].capitalize()),
                    "role": act.get("role", "teacher")
                }
            else:
                user_summary[email]["actions_count"] += 1
                if f_name not in user_summary[email]["features_used_today"]:
                    user_summary[email]["features_used_today"].append(f_name)
                    user_summary[email]["features_used"].append(f_name)
                f_id = act.get("feature_id")
                if f_id and f_id not in user_summary[email]["feature_ids_today"]:
                    user_summary[email]["feature_ids_today"].append(f_id)

        return user_summary

    def get_user_timeline(self, email: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch chronological activity events for a specific user."""
        email_clean = email.strip().lower()
        events = [a for a in self.activities if (a.get("email") or "").lower() == email_clean]
        return events[:limit]

    def get_detailed_site_analytics(self) -> Dict[str, Any]:
        """
        Calculates and returns full-site analytics:
        - Daily Active Users (DAU) & total actions today
        - Feature usage distribution (today & overall)
        - Hourly traffic distribution today
        - Role breakdown & Board distribution
        - Recent live activity feed
        """
        valid_dates, now_utc = self._get_valid_today_dates()

        today_activities = []
        for a in self.activities:
            is_today = (a.get("date") in valid_dates or a.get("date_utc") in valid_dates)
            if not is_today and a.get("timestamp"):
                try:
                    ts = datetime.fromisoformat(a["timestamp"].replace("Z", ""))
                    if (now_utc - ts).total_seconds() < 86400:
                        is_today = True
                except Exception:
                    pass
            if is_today:
                today_activities.append(a)
        
        # 1. Unique users today
        today_active_emails = list(set(a.get("email") for a in today_activities if a.get("email")))
        
        # 2. Hourly distribution today (00:00 to 23:00)
        hourly_counts: Dict[str, int] = {f"{h:02d}:00": 0 for h in range(24)}
        for a in today_activities:
            hr = a.get("hour")
            if hr in hourly_counts:
                hourly_counts[hr] += 1

        # 3. Features used today ranking
        feature_counts_today: Dict[str, int] = {}
        for a in today_activities:
            f = a.get("feature_name") or "Dashboard"
            feature_counts_today[f] = feature_counts_today.get(f, 0) + 1

        sorted_features_today = sorted(
            [{"name": k, "count": v} for k, v in feature_counts_today.items()],
            key=lambda x: x["count"],
            reverse=True
        )

        # 4. All-time popular features
        feature_counts_all: Dict[str, int] = {}
        for a in self.activities:
            f = a.get("feature_name") or "Dashboard"
            feature_counts_all[f] = feature_counts_all.get(f, 0) + 1

        sorted_features_all = sorted(
            [{"name": k, "count": v} for k, v in feature_counts_all.items()],
            key=lambda x: x["count"],
            reverse=True
        )

        # 5. Role activity today
        role_counts_today: Dict[str, int] = {}
        for a in today_activities:
            r = a.get("role") or "teacher"
            role_counts_today[r] = role_counts_today.get(r, 0) + 1

        # 6. Recent live stream (last 30 events)
        recent_stream = self.activities[:30]

        today_str = (now_utc + timedelta(hours=5, minutes=30)).strftime("%Y-%m-%d")

        return {
            "dau_today": len(today_active_emails),
            "actions_today": len(today_activities),
            "features_ranking": sorted_features_today,
            "hourly_activity": [{"hour": k, "events": v} for k, v in hourly_counts.items()],
            "role_distribution": role_counts_today,
            "recent_events": recent_stream,
            "today_metrics": {
                "active_users_count": len(today_active_emails),
                "total_actions_today": len(today_activities),
                "date": today_str,
                "hourly_distribution": [{"hour": k, "events": v} for k, v in hourly_counts.items()],
                "features_ranking_today": sorted_features_today,
                "role_activity_today": role_counts_today
            },
            "overall_metrics": {
                "total_recorded_events": len(self.activities),
                "features_ranking_overall": sorted_features_all[:12]
            },
            "recent_stream": recent_stream
        }

activity_service = ActivityService()

