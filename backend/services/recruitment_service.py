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
        # Pull live data from Supabase Cloud on initialization
        self._sync_from_supabase_cloud()

    def _sync_from_supabase_cloud(self):
        """Pulls all schools, vacancies, and applications live from Supabase Cloud."""
        if not SERVICE_KEY or not SUPABASE_URL:
            return
        try:
            with httpx.Client(timeout=8.0) as client:
                # 1. Sync schools
                res_sch = client.get(
                    f"{SUPABASE_URL}/rest/v1/recruitment_schools?select=*&order=created_at.desc", 
                    headers=supabase_headers
                )
                if res_sch.status_code == 200:
                    cloud_schools = res_sch.json()
                    if isinstance(cloud_schools, list):
                        for s in cloud_schools:
                            s_id = s.get("id")
                            if s_id:
                                self.schools[s_id] = s
                        _save_json(SCHOOLS_FILE, self.schools)
                        logger.info(f"Synced {len(cloud_schools)} schools from Supabase Cloud.")

                # 2. Sync vacancies
                res_vac = client.get(
                    f"{SUPABASE_URL}/rest/v1/vacancies?select=*&order=created_at.desc", 
                    headers=supabase_headers
                )
                if res_vac.status_code == 200:
                    cloud_vac = res_vac.json()
                    if isinstance(cloud_vac, list):
                        for v in cloud_vac:
                            v_id = v.get("id")
                            if v_id:
                                self.vacancies[v_id] = v
                        _save_json(VACANCIES_FILE, self.vacancies)

                # 3. Sync job applications
                res_app = client.get(
                    f"{SUPABASE_URL}/rest/v1/job_applications?select=*&order=created_at.desc", 
                    headers=supabase_headers
                )
                if res_app.status_code == 200:
                    cloud_app = res_app.json()
                    if isinstance(cloud_app, list):
                        for a in cloud_app:
                            a_id = a.get("id")
                            if a_id:
                                self.applications[a_id] = a
                        _save_json(APPLICATIONS_FILE, self.applications)
        except Exception as e:
            logger.warning(f"Notice during Supabase recruitment sync: {e}")

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
        """Registers a school. Preserves existing verified status if already approved."""
        email_clean = email.strip().lower()
        now_iso = datetime.utcnow().isoformat()

        # Check in-memory first
        existing_id = None
        school_record = {}
        for s_id, s_data in self.schools.items():
            if s_data.get("email", "").lower() == email_clean:
                existing_id = s_id
                school_record = s_data
                break

        # If not in-memory, check Supabase Cloud
        if not existing_id and SERVICE_KEY and SUPABASE_URL:
            try:
                with httpx.Client(timeout=6.0) as client:
                    res = client.get(
                        f"{SUPABASE_URL}/rest/v1/recruitment_schools?email=eq.{email_clean}&select=*",
                        headers=supabase_headers
                    )
                    if res.status_code == 200:
                        rows = res.json()
                        if rows and isinstance(rows, list):
                            existing_id = rows[0].get("id")
                            school_record = rows[0]
            except Exception as e:
                logger.warning(f"Error checking cloud school during register: {e}")

        school_id = existing_id or f"sch-{uuid.uuid4().hex[:10]}"
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

        # Sync to Supabase Cloud
        self._sync_school_to_supabase(record)
        return record

    def get_school_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        email_clean = email.strip().lower()
        for s in self.schools.values():
            if s.get("email", "").lower() == email_clean:
                return s

        # Direct cloud check if not in local memory
        if SERVICE_KEY and SUPABASE_URL:
            try:
                with httpx.Client(timeout=6.0) as client:
                    res = client.get(
                        f"{SUPABASE_URL}/rest/v1/recruitment_schools?email=eq.{email_clean}&select=*",
                        headers=supabase_headers
                    )
                    if res.status_code == 200:
                        rows = res.json()
                        if rows and isinstance(rows, list) and len(rows) > 0:
                            sch = rows[0]
                            self.schools[sch["id"]] = sch
                            _save_json(SCHOOLS_FILE, self.schools)
                            return sch
            except Exception as e:
                logger.warning(f"Error fetching school by email from cloud: {e}")

        return None

    def get_school_by_id(self, school_id: str) -> Optional[Dict[str, Any]]:
        if school_id in self.schools:
            return self.schools[school_id]

        # Direct cloud check if not in local memory
        if SERVICE_KEY and SUPABASE_URL:
            try:
                with httpx.Client(timeout=6.0) as client:
                    res = client.get(
                        f"{SUPABASE_URL}/rest/v1/recruitment_schools?id=eq.{school_id}&select=*",
                        headers=supabase_headers
                    )
                    if res.status_code == 200:
                        rows = res.json()
                        if rows and isinstance(rows, list) and len(rows) > 0:
                            sch = rows[0]
                            self.schools[sch["id"]] = sch
                            _save_json(SCHOOLS_FILE, self.schools)
                            return sch
            except Exception as e:
                logger.warning(f"Error fetching school by id from cloud: {e}")

        return None

    def get_all_schools(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        # Always perform a live refresh from Supabase Cloud so the Admin panel stays 100% up-to-date
        self._sync_from_supabase_cloud()
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
        school = self.get_school_by_id(school_id)
        if not school:
            raise ValueError("School not found")

        now_iso = datetime.utcnow().isoformat()
        school["verification_status"] = status  # "verified" | "rejected" | "pending_verification"
        school["verification_notes"] = notes or ""
        school["verified_at"] = now_iso if status == "verified" else None
        school["updated_at"] = now_iso

        self.schools[school_id] = school
        _save_json(SCHOOLS_FILE, self.schools)

        # Sync PATCH to Supabase Cloud
        if SERVICE_KEY and SUPABASE_URL:
            try:
                patch_payload = {
                    "verification_status": status,
                    "verification_notes": notes or "",
                    "verified_at": now_iso if status == "verified" else None,
                    "updated_at": now_iso
                }
                with httpx.Client(timeout=6.0) as client:
                    patch_res = client.patch(
                        f"{SUPABASE_URL}/rest/v1/recruitment_schools?id=eq.{school_id}",
                        headers={**supabase_headers, "Prefer": "return=representation"},
                        json=patch_payload
                    )
                    if patch_res.status_code not in (200, 204):
                        # Fallback to merge-duplicates
                        client.post(
                            f"{SUPABASE_URL}/rest/v1/recruitment_schools",
                            headers={**supabase_headers, "Prefer": "resolution=merge-duplicates"},
                            json=school
                        )
            except Exception as patch_err:
                logger.warning(f"Error patching school verification to Supabase: {patch_err}")

        # Also sync verification status and role to user profile store
        try:
            from services.supabase_service import supabase_service
            school_email = school.get("email", "").strip().lower()
            if school_email:
                supabase_service.save_teacher_profile_details(
                    email=school_email,
                    verification_status=status,
                    role="school"
                )
        except Exception as sync_err:
            logger.warning(f"Notice syncing verification status to user profile: {sync_err}")

        return school

    def _sync_school_to_supabase(self, record: Dict[str, Any]):
        if not SERVICE_KEY or not SUPABASE_URL:
            return
        try:
            with httpx.Client(timeout=6.0) as client:
                res = client.post(
                    f"{SUPABASE_URL}/rest/v1/recruitment_schools",
                    headers={**supabase_headers, "Prefer": "resolution=merge-duplicates"},
                    json=record
                )
                if res.status_code not in (200, 201):
                    # Try PATCH if record already exists
                    client.patch(
                        f"{SUPABASE_URL}/rest/v1/recruitment_schools?id=eq.{record.get('id')}",
                        headers=supabase_headers,
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

        # Ensure school exists in Supabase Cloud to satisfy FK constraint
        self._sync_school_to_supabase(school)

        vacancy_id = f"vac-{uuid.uuid4().hex[:10]}"
        now_iso = datetime.utcnow().isoformat()

        record = {
            "id": vacancy_id,
            "school_id": school_id,
            "school_name": school.get("school_name", ""),
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
        self._sync_from_supabase_cloud()
        results = []
        for vac in self.vacancies.values():
            if school_id and vac.get("school_id") != school_id:
                continue
            if status and status != "all" and vac.get("status") != status:
                continue
            if level and level.lower() != "all" and vac.get("level", "").lower() != level.lower():
                continue
            if subject and subject.lower() != "all" and vac.get("subject", "").lower() != subject.lower():
                continue
            
            # Count applicants for this vacancy
            app_count = sum(1 for a in self.applications.values() if a.get("vacancy_id") == vac["id"])
            item = vac.copy()
            item["applicant_count"] = app_count
            
            # Enrich with school details
            sch = self.schools.get(vac.get("school_id"))
            if sch:
                item["school_name"] = item.get("school_name") or sch.get("school_name", "")
                item["school_city"] = sch.get("city", "")
                item["school_state"] = sch.get("state", "")
                item["school_logo"] = sch.get("logo_url", "")
            
            results.append(item)

        return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

    def get_vacancy_by_id(self, vacancy_id: str) -> Optional[Dict[str, Any]]:
        vac = self.vacancies.get(vacancy_id)
        if not vac:
            # Check cloud
            self._sync_from_supabase_cloud()
            vac = self.vacancies.get(vacancy_id)
        if vac:
            item = vac.copy()
            item["applicant_count"] = sum(1 for a in self.applications.values() if a.get("vacancy_id") == vacancy_id)
            sch = self.schools.get(vac.get("school_id"))
            if sch:
                item["school_name"] = item.get("school_name") or sch.get("school_name", "")
                item["school_city"] = sch.get("city", "")
                item["school_state"] = sch.get("state", "")
                item["school_logo"] = sch.get("logo_url", "")
            return item
        return None

    def update_vacancy(self, vacancy_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        vac = self.get_vacancy_by_id(vacancy_id)
        if not vac:
            raise ValueError("Vacancy not found")
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
        if SERVICE_KEY and SUPABASE_URL:
            try:
                with httpx.Client(timeout=6.0) as client:
                    client.delete(
                        f"{SUPABASE_URL}/rest/v1/vacancies?id=eq.{vacancy_id}",
                        headers=supabase_headers
                    )
                    logger.info(f"Deleted vacancy {vacancy_id} from Supabase Cloud")
            except Exception as e:
                logger.error(f"Error deleting vacancy from Supabase: {e}")
        return True

    def _sync_vacancy_to_supabase(self, record: Dict[str, Any]):
        if not SERVICE_KEY or not SUPABASE_URL:
            return
        try:
            valid_cols = {
                'id', 'school_id', 'school_name', 'title', 'subject', 'level', 
                'board', 'experience_required', 'salary_range', 'openings', 
                'employment_type', 'description', 'requirements', 'deadline', 
                'status', 'applicant_count', 'created_at', 'updated_at'
            }
            payload = {k: v for k, v in record.items() if k in valid_cols}
            with httpx.Client(timeout=6.0) as client:
                res = client.post(
                    f"{SUPABASE_URL}/rest/v1/vacancies",
                    headers={**supabase_headers, "Prefer": "resolution=merge-duplicates"},
                    json=payload
                )
                if res.status_code not in (200, 201):
                    # Try PATCH in case of conflict
                    client.patch(
                        f"{SUPABASE_URL}/rest/v1/vacancies?id=eq.{payload.get('id')}",
                        headers=supabase_headers,
                        json=payload
                    )
                    logger.info(f"Patched vacancy {payload.get('id')} to Supabase Cloud")
                else:
                    logger.info(f"Successfully synced vacancy {payload.get('id')} to Supabase Cloud")
        except Exception as e:
            logger.error(f"Supabase vacancy sync error: {e}")

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

        # Ensure vacancy exists in Supabase Cloud to satisfy FK constraint
        self._sync_vacancy_to_supabase(vac)

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
        self._sync_from_supabase_cloud()
        results = [a for a in self.applications.values() if a.get("school_id") == school_id]
        return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

    def get_applications_for_teacher(self, teacher_email: str) -> List[Dict[str, Any]]:
        self._sync_from_supabase_cloud()
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
            self._sync_from_supabase_cloud()
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
            valid_cols = {
                'id', 'vacancy_id', 'school_id', 'school_name', 'job_title', 
                'job_subject', 'job_level', 'teacher_id', 'teacher_name', 
                'teacher_email', 'teacher_phone', 'qualification', 'experience', 
                'current_school', 'cover_note', 'resume_filename', 'resume_url', 
                'status', 'school_feedback', 'created_at', 'updated_at'
            }
            payload = {k: v for k, v in record.items() if k in valid_cols}
            with httpx.Client(timeout=6.0) as client:
                res = client.post(
                    f"{SUPABASE_URL}/rest/v1/job_applications",
                    headers={**supabase_headers, "Prefer": "resolution=merge-duplicates"},
                    json=payload
                )
                if res.status_code not in (200, 201):
                    client.patch(
                        f"{SUPABASE_URL}/rest/v1/job_applications?id=eq.{payload.get('id')}",
                        headers=supabase_headers,
                        json=payload
                    )
                    logger.info(f"Patched application {payload.get('id')} to Supabase Cloud")
                else:
                    logger.info(f"Successfully synced application {payload.get('id')} to Supabase Cloud")
        except Exception as e:
            logger.error(f"Supabase application sync error: {e}")

recruitment_service = RecruitmentService()
