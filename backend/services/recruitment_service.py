import os
import json
import uuid
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime
import httpx
from config import settings

logger = logging.getLogger("recruitment_service")

# Storage paths
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

UPLOADS_DIR = Path(__file__).parent.parent / "uploads" / "resumes"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

SCHOOLS_FILE = DATA_DIR / "schools.json"
VACANCIES_FILE = DATA_DIR / "vacancies.json"
APPLICATIONS_FILE = DATA_DIR / "job_applications.json"

SUPABASE_URL = (settings.SUPABASE_URL or "").strip().rstrip("/")
SERVICE_KEY = settings.SUPABASE_SERVICE_ROLE_KEY or ""

supabase_headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def _load_json(file_path: Path) -> Dict[str, Any]:
    if file_path.exists():
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading {file_path}: {e}")
            return {}
    return {}

def _save_json(file_path: Path, data: Dict[str, Any]):
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
    except Exception as e:
        logger.error(f"Failed to persist {file_path}: {e}")

class RecruitmentService:
    def __init__(self):
        self.schools: Dict[str, Dict[str, Any]] = _load_json(SCHOOLS_FILE)
        self.vacancies: Dict[str, Dict[str, Any]] = _load_json(VACANCIES_FILE)
        self.applications: Dict[str, Dict[str, Any]] = _load_json(APPLICATIONS_FILE)

    # ==========================================
    # SCHOOL MANAGEMENT & VERIFICATION
    # ==========================================
    def register_or_update_school(
        self,
        email: str,
        school_name: str,
        phone: Optional[str] = "",
        affiliation_board: Optional[str] = "CBSE",
        city: Optional[str] = "",
        state: Optional[str] = "",
        contact_person: Optional[str] = "",
        address: Optional[str] = "",
        logo_url: Optional[str] = ""
    ) -> Dict[str, Any]:
        """Registers a school with initial verification_status as pending_verification."""
        email_clean = email.strip().lower()
        now_iso = datetime.utcnow().isoformat()

        existing_id = None
        for s_id, s_data in self.schools.items():
            if s_data.get("email", "").lower() == email_clean:
                existing_id = s_id
                break

        school_id = existing_id or f"sch-{uuid.uuid4().hex[:10]}"
        school_record = self.schools.get(school_id, {})
        
        current_status = school_record.get("verification_status", "pending_verification")
        
        record = {
            "id": school_id,
            "email": email_clean,
            "school_name": school_name,
            "phone": phone or school_record.get("phone", ""),
            "affiliation_board": affiliation_board or school_record.get("affiliation_board", "CBSE"),
            "city": city or school_record.get("city", ""),
            "state": state or school_record.get("state", ""),
            "contact_person": contact_person or school_record.get("contact_person", ""),
            "address": address or school_record.get("address", ""),
            "logo_url": logo_url or school_record.get("logo_url", ""),
            "verification_status": current_status,  # "pending_verification" | "verified" | "rejected"
            "verification_notes": school_record.get("verification_notes", ""),
            "verified_at": school_record.get("verified_at"),
            "created_at": school_record.get("created_at", now_iso),
            "updated_at": now_iso
        }

        self.schools[school_id] = record
        _save_json(SCHOOLS_FILE, self.schools)

        # Sync to Supabase if table exists
        self._sync_school_to_supabase(record)
        return record

    def get_school_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        email_clean = email.strip().lower()
        for s in self.schools.values():
            if s.get("email", "").lower() == email_clean:
                return s
        return None

    def get_school_by_id(self, school_id: str) -> Optional[Dict[str, Any]]:
        return self.schools.get(school_id)

    def get_all_schools(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        schools = list(self.schools.values())
        if status:
            schools = [s for s in schools if s.get("verification_status") == status]
        return sorted(schools, key=lambda x: x.get("created_at", ""), reverse=True)

    def update_school_verification(
        self,
        school_id: str,
        status: str,
        notes: Optional[str] = ""
    ) -> Dict[str, Any]:
        """Admin action to approve/verify or reject school."""
        if school_id not in self.schools:
            raise ValueError("School not found")

        school = self.schools[school_id]
        school["verification_status"] = status  # "verified" | "rejected" | "pending_verification"
        school["verification_notes"] = notes or ""
        school["verified_at"] = datetime.utcnow().isoformat() if status == "verified" else None
        school["updated_at"] = datetime.utcnow().isoformat()

        self.schools[school_id] = school
        _save_json(SCHOOLS_FILE, self.schools)
        self._sync_school_to_supabase(school)
        return school

    def _sync_school_to_supabase(self, record: Dict[str, Any]):
        if not SERVICE_KEY or not SUPABASE_URL:
            return
        try:
            with httpx.Client(timeout=4.0) as client:
                client.post(
                    f"{SUPABASE_URL}/rest/v1/schools",
                    headers={**supabase_headers, "Prefer": "resolution=merge-duplicates"},
                    json=record
                )
        except Exception as e:
            logger.debug(f"Supabase school sync notice: {e}")

    # ==========================================
    # VACANCY MANAGEMENT
    # ==========================================
    def create_vacancy(
        self,
        school_id: str,
        title: str,
        subject: str,
        level: str,  # PRT, TGT, PGT, NTT, Activity/Sports, Other
        board: str = "CBSE",
        experience_required: str = "1-3 Years",
        salary_range: Optional[str] = "",
        openings: int = 1,
        employment_type: str = "Full Time",
        description: str = "",
        requirements: Optional[List[str]] = None,
        deadline: Optional[str] = None
    ) -> Dict[str, Any]:
        school = self.get_school_by_id(school_id)
        if not school:
            raise ValueError("School not found")
        if school.get("verification_status") != "verified":
            raise PermissionError("School dashboard is locked. Cannot post vacancies until verified by DEVGYA Admin.")

        vacancy_id = f"vac-{uuid.uuid4().hex[:10]}"
        now_iso = datetime.utcnow().isoformat()

        record = {
            "id": vacancy_id,
            "school_id": school_id,
            "school_name": school.get("school_name", ""),
            "school_city": school.get("city", ""),
            "school_state": school.get("state", ""),
            "school_logo": school.get("logo_url", ""),
            "title": title.strip(),
            "subject": subject.strip(),
            "level": level.strip(),  # PRT, TGT, PGT, etc.
            "board": board or school.get("affiliation_board", "CBSE"),
            "experience_required": experience_required,
            "salary_range": salary_range or "Competitive",
            "openings": max(1, int(openings)),
            "employment_type": employment_type,
            "description": description.strip(),
            "requirements": requirements or [],
            "deadline": deadline,
            "status": "active",  # "active" | "closed" | "paused"
            "created_at": now_iso,
            "updated_at": now_iso
        }

        self.vacancies[vacancy_id] = record
        _save_json(VACANCIES_FILE, self.vacancies)
        self._sync_vacancy_to_supabase(record)
        return record

    def get_vacancies(
        self,
        school_id: Optional[str] = None,
        level: Optional[str] = None,
        subject: Optional[str] = None,
        status: Optional[str] = "active"
    ) -> List[Dict[str, Any]]:
        results = []
        for vac in self.vacancies.values():
            if school_id and vac.get("school_id") != school_id:
                continue
            if status and vac.get("status") != status:
                continue
            if level and level.lower() != "all" and vac.get("level", "").lower() != level.lower():
                continue
            if subject and subject.lower() != "all" and vac.get("subject", "").lower() != subject.lower():
                continue
            
            # Count applicants for this vacancy
            app_count = sum(1 for a in self.applications.values() if a.get("vacancy_id") == vac["id"])
            item = vac.copy()
            item["applicant_count"] = app_count
            results.append(item)

        return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

    def get_vacancy_by_id(self, vacancy_id: str) -> Optional[Dict[str, Any]]:
        vac = self.vacancies.get(vacancy_id)
        if vac:
            item = vac.copy()
            item["applicant_count"] = sum(1 for a in self.applications.values() if a.get("vacancy_id") == vacancy_id)
            return item
        return None

    def update_vacancy(self, vacancy_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        if vacancy_id not in self.vacancies:
            raise ValueError("Vacancy not found")
        vac = self.vacancies[vacancy_id]
        for k, v in updates.items():
            if k not in ("id", "school_id", "created_at") and v is not None:
                vac[k] = v
        vac["updated_at"] = datetime.utcnow().isoformat()
        self.vacancies[vacancy_id] = vac
        _save_json(VACANCIES_FILE, self.vacancies)
        self._sync_vacancy_to_supabase(vac)
        return vac

    def delete_vacancy(self, vacancy_id: str) -> bool:
        if vacancy_id in self.vacancies:
            del self.vacancies[vacancy_id]
            _save_json(VACANCIES_FILE, self.vacancies)
            return True
        return False

    def _sync_vacancy_to_supabase(self, record: Dict[str, Any]):
        if not SERVICE_KEY or not SUPABASE_URL:
            return
        try:
            with httpx.Client(timeout=4.0) as client:
                client.post(
                    f"{SUPABASE_URL}/rest/v1/vacancies",
                    headers={**supabase_headers, "Prefer": "resolution=merge-duplicates"},
                    json=record
                )
        except Exception as e:
            logger.debug(f"Supabase vacancy sync notice: {e}")

    # ==========================================
    # JOB APPLICATIONS & STRICT PDF RESUME PIPELINE
    # ==========================================
    def save_pdf_resume(self, file_bytes: bytes, original_filename: str) -> str:
        """Saves strictly PDF resume file to disk and returns unique filename."""
        clean_ext = os.path.splitext(original_filename)[1].lower()
        if clean_ext != ".pdf":
            raise ValueError("Invalid file format. Strictly PDF format (.pdf) is permitted.")
        
        file_id = f"cv_{uuid.uuid4().hex[:12]}.pdf"
        dest_path = UPLOADS_DIR / file_id
        with open(dest_path, "wb") as f:
            f.write(file_bytes)
        return file_id

    def get_resume_path(self, filename: str) -> Optional[Path]:
        clean_filename = os.path.basename(filename)
        path = UPLOADS_DIR / clean_filename
        if path.exists() and clean_filename.lower().endswith(".pdf"):
            return path
        return None

    def submit_application(
        self,
        vacancy_id: str,
        teacher_id: str,
        teacher_name: str,
        teacher_email: str,
        teacher_phone: Optional[str] = "",
        qualification: Optional[str] = "",
        experience: Optional[str] = "",
        current_school: Optional[str] = "",
        cover_note: Optional[str] = "",
        resume_filename: str = ""
    ) -> Dict[str, Any]:
        vac = self.get_vacancy_by_id(vacancy_id)
        if not vac:
            raise ValueError("Vacancy not found")
        if vac.get("status") != "active":
            raise ValueError("This vacancy is no longer accepting applications.")

        email_clean = teacher_email.strip().lower()
        # Prevent duplicate applications
        for app in self.applications.values():
            if app.get("vacancy_id") == vacancy_id and app.get("teacher_email", "").lower() == email_clean:
                raise ValueError("You have already submitted an application for this vacancy.")

        app_id = f"app-{uuid.uuid4().hex[:10]}"
        now_iso = datetime.utcnow().isoformat()

        record = {
            "id": app_id,
            "vacancy_id": vacancy_id,
            "school_id": vac.get("school_id"),
            "school_name": vac.get("school_name"),
            "job_title": vac.get("title"),
            "job_subject": vac.get("subject"),
            "job_level": vac.get("level"),
            "teacher_id": teacher_id,
            "teacher_name": teacher_name.strip(),
            "teacher_email": email_clean,
            "teacher_phone": teacher_phone or "",
            "qualification": qualification or "B.Ed",
            "experience": experience or "1-3 Years",
            "current_school": current_school or "",
            "cover_note": cover_note or "",
            "resume_filename": resume_filename,
            "resume_url": f"/api/v1/recruitment/resumes/{resume_filename}",
            "status": "submitted",  # "submitted" | "shortlisted" | "interview" | "selected" | "rejected"
            "school_feedback": "",
            "created_at": now_iso,
            "updated_at": now_iso
        }

        self.applications[app_id] = record
        _save_json(APPLICATIONS_FILE, self.applications)
        self._sync_application_to_supabase(record)
        return record

    def get_applications_for_school(self, school_id: str) -> List[Dict[str, Any]]:
        results = [a for a in self.applications.values() if a.get("school_id") == school_id]
        return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

    def get_applications_for_teacher(self, teacher_email: str) -> List[Dict[str, Any]]:
        email_clean = teacher_email.strip().lower()
        results = [a for a in self.applications.values() if a.get("teacher_email", "").lower() == email_clean]
        return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

    def update_application_status(
        self,
        app_id: str,
        status: str,
        feedback: Optional[str] = None
    ) -> Dict[str, Any]:
        if app_id not in self.applications:
            raise ValueError("Application not found")
        app = self.applications[app_id]
        app["status"] = status
        if feedback is not None:
            app["school_feedback"] = feedback
        app["updated_at"] = datetime.utcnow().isoformat()

        self.applications[app_id] = app
        _save_json(APPLICATIONS_FILE, self.applications)
        self._sync_application_to_supabase(app)
        return app

    def _sync_application_to_supabase(self, record: Dict[str, Any]):
        if not SERVICE_KEY or not SUPABASE_URL:
            return
        try:
            with httpx.Client(timeout=4.0) as client:
                client.post(
                    f"{SUPABASE_URL}/rest/v1/job_applications",
                    headers={**supabase_headers, "Prefer": "resolution=merge-duplicates"},
                    json=record
                )
        except Exception as e:
            logger.debug(f"Supabase application sync notice: {e}")

recruitment_service = RecruitmentService()
