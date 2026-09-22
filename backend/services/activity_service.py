import os
import json
import time
import uuid
import logging
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("activity_service")

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
ACTIVITY_FILE = DATA_DIR / "user_activity.json"

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://amlvyskjrencrolnppgs.supabase.co").strip().rstrip("/")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

class ActivityService:
    """
    Tracks real-time user platform actions, page visits, tool invocations, 
    daily active users (DAU), and compiles comprehensive site analytics.
    Backed by Supabase Cloud PostgreSQL for permanent persistence across deploys.
    """
    def __init__(self):
        self.activities: List[Dict[str, Any]] = self._load()

    @staticmethod
    def _is_mock_event(act: Dict[str, Any]) -> bool:
        """Strictly detect and filter out any artificial seed/mock data."""
        if not act or not isinstance(act, dict):
            return True
        details = act.get("details")
        if isinstance(details, dict):
            if details.get("test") is True or details.get("is_mock") is True:
                return True
            topic = str(details.get("topic", "")).lower()
            if any(m in topic for m in ["photosynthesis & plant respiration", "newton laws of motion"]):
                return True
        name = (act.get("name") or "").lower()
        if any(m in name for m in ["mock", "dummy", "sample test", "test dummy"]):
            return True
        return False

    def _sync_event_to_cloud(self, event: Dict[str, Any]):
        """Persists a new activity event asynchronously to Supabase Cloud PostgreSQL."""
        if not SERVICE_KEY or not SUPABASE_URL:
            return
        try:
            headers = {
                "apikey": SERVICE_KEY,
                "Authorization": f"Bearer {SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            with httpx.Client(timeout=6.0) as client:
                # 1. Attempt insert into user_activity table if present
                res = client.post(
                    f"{SUPABASE_URL}/rest/v1/user_activity",
                    headers=headers,
                    json=event
                )
                if res.status_code in (200, 201):
                    return

                # 2. Seamlessly fallback to ai_conversations table (already available in Supabase schema)
                email = event.get("email", "user")
                client.post(
                    f"{SUPABASE_URL}/rest/v1/ai_conversations",
                    headers=headers,
                    json={
                        "session_title": f"DEVGYA_ACTIVITY:{email}",
                        "chat_history": event
                    }
                )
        except Exception as e:
            logger.warning(f"Notice: Supabase Cloud activity sync deferred: {e}")

    def _load_from_cloud(self) -> List[Dict[str, Any]]:
        """Loads historical activity events from Supabase Cloud PostgreSQL."""
        if not SERVICE_KEY or not SUPABASE_URL:
            return []
        try:
            headers = {
                "apikey": SERVICE_KEY,
                "Authorization": f"Bearer {SERVICE_KEY}",
                "Content-Type": "application/json"
            }
            with httpx.Client(timeout=8.0) as client:
                # 1. Try dedicated user_activity table
                res = client.get(
                    f"{SUPABASE_URL}/rest/v1/user_activity?select=*&order=timestamp.desc&limit=3000",
                    headers=headers
                )
                if res.status_code == 200:
                    rows = res.json()
                    if rows:
                        return rows

                # 2. Fallback to ai_conversations telemetry storage
                res2 = client.get(
                    f"{SUPABASE_URL}/rest/v1/ai_conversations?session_title=like.DEVGYA_ACTIVITY*&select=chat_history&order=created_at.desc&limit=3000",
                    headers=headers
                )
                if res2.status_code == 200:
                    rows = res2.json()
                    cloud_events = []
                    for r in rows:
                        ch = r.get("chat_history")
                        if isinstance(ch, dict) and ch.get("email"):
                            cloud_events.append(ch)
                    return cloud_events
        except Exception as e:
            logger.warning(f"Could not load activity events from Supabase Cloud: {e}")
        return []

    def _load(self) -> List[Dict[str, Any]]:
        local_data = []
        if ACTIVITY_FILE.exists():
            try:
                with open(ACTIVITY_FILE, "r", encoding="utf-8") as f:
                    local_data = json.load(f)
            except Exception as e:
                logger.error(f"Error reading activity file: {e}")
                local_data = []

        # Filter out any mock/seed events
        local_data = [item for item in local_data if not self._is_mock_event(item)]

        # Fetch cloud events from Supabase Cloud PostgreSQL
        cloud_data = self._load_from_cloud()
        cloud_data = [item for item in cloud_data if not self._is_mock_event(item)]

        # Merge deduplicated by event ID
        seen_ids = set()
        merged = []
        for item in cloud_data + local_data:
            ev_id = item.get("id")
            if ev_id and ev_id not in seen_ids:
                seen_ids.add(ev_id)
                ts = item.get("timestamp")
                if ts and isinstance(ts, str) and not (ts.endswith("Z") or "+" in ts or "-" in ts[10:]):
                    item["timestamp"] = f"{ts}Z"
                merged.append(item)

        merged.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return merged

    def _save(self):
        try:
            # Keep up to 15,000 activity events in memory/disk cache
            if len(self.activities) > 15000:
                self.activities = self.activities[:15000]
            with open(ACTIVITY_FILE, "w", encoding="utf-8") as f:
                json.dump(self.activities, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to persist user activity: {e}")

    def _get_valid_today_dates(self):
        now_utc = datetime.now(timezone.utc)
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
        feature_id: Optional[str] = "dashboard",
        feature_name: Optional[str] = "Dashboard",
        path: Optional[str] = "",
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Record an activity event for a user with deduplication, UTC+Z timestamp and Indian Standard Time (IST)."""
        if not email or not email.strip():
            return {}

        email_clean = email.strip().lower()
        now_utc = datetime.now(timezone.utc)
        ist_dt = now_utc + timedelta(hours=5, minutes=30)
        now_iso = now_utc.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        date_str = ist_dt.strftime("%Y-%m-%d")
        time_display = ist_dt.strftime("%I:%M %p")
        hour_str = ist_dt.strftime("%I:00 %p")

        canonical_feature_name = self.normalize_feature_name({
            "feature_id": feature_id,
            "feature_name": feature_name,
            "path": path,
            "action": action
        })

        # STRICT DEDUPLICATION:
        # Fast 3-second debounce for identical feature actions to prevent accidental double-submits,
        # but allow multiple real usages (e.g. generating 2 papers) to be recorded accurately.
        for recent in self.activities[:10]:
            if (
                recent.get("email") == email_clean
                and self.normalize_feature_name(recent) == canonical_feature_name
                and recent.get("action") == action
            ):
                try:
                    prev_ts = recent.get("timestamp", "")
                    if prev_ts:
                        prev_dt = datetime.fromisoformat(prev_ts.replace("Z", "+00:00"))
                        diff = abs((now_utc - prev_dt).total_seconds())
                        if diff < 3:
                            return recent
                except Exception:
                    pass

        event = {
            "id": f"act_{int(time.time()*1000)}_{uuid.uuid4().hex[:6]}",
            "email": email_clean,
            "name": (name or "").strip() or email_clean.split("@")[0].capitalize(),
            "role": role or "teacher",
            "action": action or "feature_use",
            "feature_id": feature_id or "feature",
            "feature_name": canonical_feature_name,
            "path": path or "/dashboard",
            "details": details or {},
            "timestamp": now_iso,
            "time_display": time_display,
            "date": date_str,
            "date_utc": now_utc.strftime("%Y-%m-%d"),
            "hour": hour_str
        }

        # Insert at the beginning (most recent first)
        self.activities.insert(0, event)
        self._save()

        # Asynchronously sync to Supabase Cloud PostgreSQL database in a detached thread
        threading.Thread(target=self._sync_event_to_cloud, args=(event,), daemon=True).start()

        return event

    @staticmethod
    def is_feature_event(act: Dict[str, Any]) -> bool:
        """
        Determines if an activity event corresponds to actual feature usage,
        strictly excluding:
        1. User platform suggestions / feedback (explicitly excluded from activity)
        2. Authentication/session actions (login, logout, otp, register, password)
        3. Passive page navigations/visits (navigate, visit, view_page, page_visit, view_dashboard)
        4. Page route visits that sent generic 'feature_use' without actual generation/usage details
        5. Generic dashboard overviews/views (Teacher Dashboard, Student Dashboard, Parent Dashboard, etc.)
        """
        if not act or not isinstance(act, dict):
            return False

        action = (act.get("action") or "").lower().strip()
        feat_name = (act.get("feature_name") or "").lower().strip()
        feat_id = (act.get("feature_id") or "").lower().strip()
        path = (act.get("path") or "").lower().strip()

        # 1. Suggestions blocklist - explicitly NOT shown in activity
        if "suggestion" in action or "suggestion" in feat_name or "suggestion" in feat_id or "suggestion" in path:
            return False

        # 2. Auth / Login / Logout blocklist
        auth_keywords = [
            "login", "logout", "otp", "auth", "register", "sign_in", "sign_out",
            "signin", "signout", "password", "forgot", "session"
        ]
        if any(k in action for k in auth_keywords):
            return False
        if any(k in feat_name for k in ["login", "logout", "otp", "auth", "register", "sign in", "sign out", "signin", "signout"]):
            return False
        if any(k in feat_id for k in ["login", "logout", "otp", "auth", "register"]):
            return False
        if path in ["/login", "/register", "/auth", "/forgot-password", "/reset-password"]:
            return False

        # 3. Page Navigation / Passive Visit blocklist
        nav_actions = [
            "navigate", "visit", "view_page", "page_visit", "view_dashboard", 
            "page_view", "route_change", "school_view", "view_profile", "view", ""
        ]
        if action in nav_actions:
            return False

        # 4. Filter out passive page visits that sent generic 'feature_use' with no real payload details
        if action == "feature_use":
            details = act.get("details")
            if not details or not isinstance(details, dict) or len(details) == 0:
                return False

        # 5. Dashboard / Overview page names blocklist
        dash_names = [
            "teacher dashboard", "student dashboard", "parent dashboard", 
            "dashboard visit", "dashboard", "student home", "school campus profile",
            "school dashboard", "overview"
        ]
        if feat_name in dash_names or feat_id in ["dashboard", "student-dashboard", "parent-dashboard", "school-profile"]:
            return False

        # 6. If action is empty or generic 'view' on a dashboard/root route
        if action in ["", "view"] and path in ["/dashboard", "/dashboard/student", "/dashboard/parent", "/dashboard/school", "/dashboard/school/profile", "/"]:
            return False

        return True

    @staticmethod
    def normalize_feature_name(act: Dict[str, Any]) -> str:
        """Produce a clean, canonical feature name."""
        name = (act.get("feature_name") or "").strip()
        action = (act.get("action") or "").lower().strip()
        feat_id = (act.get("feature_id") or "").lower().strip()
        path = (act.get("path") or "").lower().strip()

        # Specific feature overrides FIRST before generic substrings!
        if "ppt" in feat_id or "ppt" in path or action in ["generate_ppt", "save_ppt", "refine_slide"]:
            return "AI PPT Generator"
        if "assignment" in feat_id or "assignment" in path or action in ["create_assignment", "generate_assignment"]:
            return "AI Assignment Maker"
        if "olympiad/practice" in path or feat_id == "olympiad-practice" or action == "practice_attempt":
            return "Skill Enhance Practice"
        if "olympiad" in feat_id or "olympiad" in path or action in ["participate_olympiad", "submit_100"]:
            return "Skill Enhance Program"
        if "english-coach" in path or "english" in feat_id or action in ["speech_practice", "live_speech"]:
            return "English Speaking Coach"
        if "vacanc" in feat_id or "recruitment" in path or action in ["manage_vacancies", "post_vacancy", "view_vacancies", "apply_vacancy"]:
            return "Faculty Recruitment"
        if "exam-prep" in path or "exam_prep" in feat_id or action == "exam_prep":
            return "AI Exam Prep Studio"
        if "student/practice" in path or action in ["quiz_submission", "practice_quiz", "complete_quiz"] or feat_id in ["practice-quiz", "practice_quiz"]:
            return "Practice & Quizzes"
        if "flashcard" in path or "flashcard" in feat_id:
            return "Flashcard Deck"
        if "revision" in path or "revision" in feat_id:
            return "Revision Studio"
        if "notes" in path or "notes" in feat_id or action in ["create_note", "save_note"] or feat_id in ["notion-smart-notes", "smart-notes"]:
            return "Notion Smart Notes"
        if "classroom" in path or "lesson" in feat_id or action == "lesson_plan":
            return "AI Lesson Planner"
        if "content" in path or "content" in feat_id or action == "create_content":
            return "AI Content Studio"
        if "video" in path or "consultation" in feat_id:
            return "Live Video AI Consultation"
        if "timer" in path or "planner" in path:
            return "Study Planner & Pomodoro"
        if "leaderboard" in path or feat_id == "leaderboard":
            return "Student Leaderboard"
        if "children" in path or feat_id in ["children", "my_children"]:
            return "Child Accounts & Progress"

        # Agent chat names
        if feat_id == "teacher_mentor" or "teacher_mentor" in path:
            return "Teacher Mentor AI"
        if feat_id == "student_tutor" or "student_tutor" in path or action == "socratic_query":
            return "Socratic AI Tutor"
        if feat_id == "parent_coach" or "parent_coach" in path:
            return "Parent AI Coach"
        if feat_id == "research_assistant" or "research_assistant" in path:
            return "Academic Research Assistant"
        if feat_id == "analytics_assistant" or "analytics_assistant" in path:
            return "AI Progress Analytics"
        if feat_id == "document_assistant" or "document_assistant" in path:
            return "Document AI Assistant"

        # Question Paper Generator ONLY for actual paper generator!
        if action == "generate_paper" or path in ["/dashboard/generator", "/generator"] or feat_id in ["generator", "question-generator", "paper-generator"]:
            return "Question Paper Generator"
        if "generator" in feat_id and "ppt" not in feat_id and "content" not in feat_id:
            return "Question Paper Generator"

        if name:
            if name.startswith("AI Agent: "):
                code = name.replace("AI Agent: ", "").replace("_", " ").title()
                return f"AI Agent: {code}"
            return name
        return "Specialized Educational Tool"

    def get_today_active_users_summary(self) -> Dict[str, Dict[str, Any]]:
        """
        Returns a dictionary mapping email -> {
            last_active: str,
            features_used_today: List[str],  # E.g. ["Question Paper Generator (3x)"]
            features_summary: List[Dict],    # [{"name": "...", "count": 3, "last_used": "..."}]
            actions_count: int,              # Total feature actions today
            total_feature_uses: int,
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

            if email not in user_summary:
                user_summary[email] = {
                    "last_active": act.get("timestamp"),
                    "last_active_display": act.get("time_display"),
                    "first_active": act.get("timestamp"),
                    "name": act.get("name", email.split("@")[0].capitalize()),
                    "role": act.get("role", "teacher"),
                    "feature_counts": {},
                    "features_summary": [],
                    "features_used": [],
                    "features_used_today": [],
                    "actions_count": 0,
                    "total_feature_uses": 0
                }

            # Only count actual feature events for features used and action counts
            if self.is_feature_event(act):
                f_name = self.normalize_feature_name(act)
                user_summary[email]["feature_counts"][f_name] = user_summary[email]["feature_counts"].get(f_name, 0) + 1
                user_summary[email]["actions_count"] += 1
                user_summary[email]["total_feature_uses"] += 1

        # Format features_summary and features_used with numerical counts
        for email, u in user_summary.items():
            sorted_feats = sorted(
                [{"name": k, "count": v} for k, v in u["feature_counts"].items()],
                key=lambda x: x["count"],
                reverse=True
            )
            u["features_summary"] = sorted_feats
            u["features_used"] = [f"{f['name']} ({f['count']}x)" for f in sorted_feats]
            u["features_used_today"] = u["features_used"]

        return user_summary

    def get_user_timeline(self, email: str, limit: int = 50) -> Dict[str, Any]:
        """Fetch chronological activity events for a specific user, strictly features only with counts."""
        email_clean = (email or "").strip().lower()
        base_user = email_clean.split("@")[0] if "@" in email_clean else email_clean
        possible_identifiers = {
            email_clean,
            base_user,
            f"{base_user}@student.devgya.in",
            f"{base_user}@devgya.in"
        }
        feature_events = []
        feature_counts: Dict[str, Dict[str, Any]] = {}

        for a in self.activities:
            a_email = (a.get("email") or "").lower().strip()
            if a_email in possible_identifiers and self.is_feature_event(a):
                canonical_name = self.normalize_feature_name(a)
                ev_copy = dict(a)
                ev_copy["feature_name"] = canonical_name
                feature_events.append(ev_copy)

                if canonical_name not in feature_counts:
                    feature_counts[canonical_name] = {
                        "name": canonical_name,
                        "count": 1,
                        "last_used": a.get("timestamp"),
                        "last_used_display": a.get("time_display"),
                        "last_action": a.get("action", "use")
                    }
                else:
                    feature_counts[canonical_name]["count"] += 1

        sorted_summary = sorted(
            list(feature_counts.values()),
            key=lambda x: x["count"],
            reverse=True
        )

        return {
            "timeline": feature_events[:limit],
            "features_summary": sorted_summary,
            "total_feature_uses": len(feature_events)
        }

    def get_detailed_site_analytics(self) -> Dict[str, Any]:
        """
        Calculates and returns full-site analytics:
        - Daily Active Users (DAU) & total feature actions today
        - Feature usage distribution (today & overall) - strictly features only
        - Hourly traffic distribution today
        - Role breakdown & Board distribution
        - Recent live feature activity feed (no navigations or logins)
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

        # 3. Features used today ranking - STRICTLY FEATURES ONLY
        today_feature_activities = [a for a in today_activities if self.is_feature_event(a)]
        feature_counts_today: Dict[str, int] = {}
        for a in today_feature_activities:
            f = self.normalize_feature_name(a)
            feature_counts_today[f] = feature_counts_today.get(f, 0) + 1

        sorted_features_today = sorted(
            [{"name": k, "count": v} for k, v in feature_counts_today.items()],
            key=lambda x: x["count"],
            reverse=True
        )

        # 4. All-time popular features - STRICTLY FEATURES ONLY
        all_feature_activities = [a for a in self.activities if self.is_feature_event(a)]
        feature_counts_all: Dict[str, int] = {}
        for a in all_feature_activities:
            f = self.normalize_feature_name(a)
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

        # 6. Recent live stream (last 30 events) - STRICTLY FEATURES ONLY
        recent_stream = []
        for a in self.activities:
            if self.is_feature_event(a):
                ev = dict(a)
                ev["feature_name"] = self.normalize_feature_name(a)
                recent_stream.append(ev)
                if len(recent_stream) >= 30:
                    break

        today_str = (now_utc + timedelta(hours=5, minutes=30)).strftime("%Y-%m-%d")

        return {
            "dau_today": len(today_active_emails),
            "actions_today": len(today_feature_activities),
            "features_ranking": sorted_features_today,
            "hourly_activity": [{"hour": k, "events": v} for k, v in hourly_counts.items()],
            "role_distribution": role_counts_today,
            "recent_events": recent_stream,
            "today_metrics": {
                "active_users_count": len(today_active_emails),
                "total_actions_today": len(today_feature_activities),
                "date": today_str,
                "hourly_distribution": [{"hour": k, "events": v} for k, v in hourly_counts.items()],
                "features_ranking_today": sorted_features_today,
                "role_activity_today": role_counts_today
            },
            "overall_metrics": {
                "total_recorded_events": len(all_feature_activities),
                "features_ranking_overall": sorted_features_all[:12]
            },
            "recent_stream": recent_stream
        }

activity_service = ActivityService()

