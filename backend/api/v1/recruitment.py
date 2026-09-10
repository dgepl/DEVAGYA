import os
import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Query, Body, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.recruitment_service import recruitment_service

logger = logging.getLogger("recruitment_router")

router = APIRouter(prefix="/recruitment", tags=["School Portal & Teacher Recruitment"])

class CreateVacancyPayload(BaseModel):
    school_id: str
    title: str
    subject: str
    level: str  # PRT, TGT, PGT, NTT, Activity/Sports, Other
    board: Optional[str] = "CBSE"
    experience_required: Optional[str] = "1-3 Years"
    salary_range: Optional[str] = "Competitive"
    openings: Optional[int] = 1
    employment_type: Optional[str] = "Full Time"
    description: Optional[str] = ""
    requirements: Optional[List[str]] = []
    deadline: Optional[str] = None

class UpdateVacancyPayload(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    level: Optional[str] = None
    board: Optional[str] = None
    experience_required: Optional[str] = None
    salary_range: Optional[str] = None
    openings: Optional[int] = None
    employment_type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    deadline: Optional[str] = None
    status: Optional[str] = None

class UpdateApplicationStatusPayload(BaseModel):
    status: str  # "submitted" | "shortlisted" | "interview" | "selected" | "rejected"
    feedback: Optional[str] = None

class UpdateSchoolProfilePayload(BaseModel):
    email: str
    school_name: str
    phone: Optional[str] = ""
    affiliation_board: Optional[str] = "CBSE"
    city: Optional[str] = ""
    state: Optional[str] = ""
    contact_person: Optional[str] = ""
    address: Optional[str] = ""
    logo_url: Optional[str] = ""

# ==========================================
# SCHOOL VERIFICATION & PROFILE
# ==========================================

@router.get("/schools/me")
async def get_my_school(email: str = Query(...)):
    """Fetch current school profile and verification status."""
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    school = recruitment_service.get_school_by_email(email)
    if not school:
        raise HTTPException(status_code=404, detail="School profile not found")
    return {"status": "success", "school": school}

@router.put("/schools/me")
async def update_my_school(payload: UpdateSchoolProfilePayload):
    """Update school details."""
    school = recruitment_service.register_or_update_school(
        email=payload.email,
        school_name=payload.school_name,
        phone=payload.phone,
        affiliation_board=payload.affiliation_board,
        city=payload.city,
        state=payload.state,
        contact_person=payload.contact_person,
        address=payload.address,
        logo_url=payload.logo_url
    )
    return {"status": "success", "school": school}

# ==========================================
# VACANCY ENDPOINTS
# ==========================================

@router.post("/vacancies")
async def create_vacancy(payload: CreateVacancyPayload):
    """Post a new school vacancy. Requires verified school dashboard."""
    try:
        vac = recruitment_service.create_vacancy(
            school_id=payload.school_id,
            title=payload.title,
            subject=payload.subject,
            level=payload.level,
            board=payload.board or "CBSE",
            experience_required=payload.experience_required or "1-3 Years",
            salary_range=payload.salary_range or "Competitive",
            openings=payload.openings or 1,
            employment_type=payload.employment_type or "Full Time",
            description=payload.description or "",
            requirements=payload.requirements or [],
            deadline=payload.deadline
        )
        return {"status": "success", "message": "Vacancy posted successfully!", "vacancy": vac}
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error creating vacancy: {e}")
        raise HTTPException(status_code=500, detail="Failed to post vacancy.")

@router.get("/vacancies")
async def list_vacancies(
    school_id: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    status: Optional[str] = Query("active")
):
    """List vacancies with optional level/subject/school filters."""
    vacancies = recruitment_service.get_vacancies(
        school_id=school_id,
        level=level,
        subject=subject,
        status=status if status != "all" else None
    )
    return {"status": "success", "count": len(vacancies), "vacancies": vacancies}

@router.get("/vacancies/{vacancy_id}")
async def get_vacancy(vacancy_id: str):
    vac = recruitment_service.get_vacancy_by_id(vacancy_id)
    if not vac:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    return {"status": "success", "vacancy": vac}

@router.put("/vacancies/{vacancy_id}")
async def update_vacancy(vacancy_id: str, payload: UpdateVacancyPayload):
    try:
        updated = recruitment_service.update_vacancy(vacancy_id, payload.dict(exclude_unset=True))
        return {"status": "success", "message": "Vacancy updated", "vacancy": updated}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.delete("/vacancies/{vacancy_id}")
async def delete_vacancy(vacancy_id: str):
    ok = recruitment_service.delete_vacancy(vacancy_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    return {"status": "success", "message": "Vacancy deleted successfully"}

# ==========================================
# RESUME UPLOAD & APPLICATION SUBMISSION
# ==========================================

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Accepts ONLY PDF files for teacher CV/resumes."""
    original_name = file.filename or "resume.pdf"
    if not original_name.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format! Please upload your resume in strictly PDF format (.pdf)."
        )

    # Read bytes and validate size (< 10MB)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size too large. Maximum PDF size is 10MB."
        )

    try:
        saved_filename = recruitment_service.save_pdf_resume(content, original_name)
        return {
            "status": "success",
            "message": "Resume uploaded successfully",
            "filename": saved_filename,
            "url": f"/api/v1/recruitment/resumes/{saved_filename}"
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Failed to save resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to process PDF resume.")

@router.get("/resumes/{filename}")
async def stream_resume(filename: str):
    """Securely stream or download uploaded PDF resume."""
    path = recruitment_service.get_resume_path(filename)
    if not path:
        raise HTTPException(status_code=404, detail="Resume PDF not found")
    return FileResponse(
        path=str(path),
        media_type="application/pdf",
        filename=filename
    )

class SubmitApplicationPayload(BaseModel):
    vacancy_id: str
    teacher_id: str
    teacher_name: str
    teacher_email: str
    teacher_phone: Optional[str] = ""
    qualification: Optional[str] = "B.Ed"
    experience: Optional[str] = "1-3 Years"
    current_school: Optional[str] = ""
    cover_note: Optional[str] = ""
    resume_filename: str

@router.post("/apply")
async def apply_to_vacancy(payload: SubmitApplicationPayload):
    """Teacher applies to a school vacancy with PDF resume."""
    if not payload.resume_filename or not payload.resume_filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400, 
            detail="Valid PDF resume is required to apply for this vacancy."
        )

    try:
        app = recruitment_service.submit_application(
            vacancy_id=payload.vacancy_id,
            teacher_id=payload.teacher_id,
            teacher_name=payload.teacher_name,
            teacher_email=payload.teacher_email,
            teacher_phone=payload.teacher_phone,
            qualification=payload.qualification,
            experience=payload.experience,
            current_school=payload.current_school,
            cover_note=payload.cover_note,
            resume_filename=payload.resume_filename
        )
        return {
            "status": "success",
            "message": "Application submitted successfully to the school!",
            "application": app
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error submitting application: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit application.")

# ==========================================
# APPLICANT TRACKING & STATUS
# ==========================================

@router.get("/applications/school")
async def get_school_applications(school_id: str = Query(...)):
    """Fetch all teacher applications received by a school."""
    apps = recruitment_service.get_applications_for_school(school_id)
    return {"status": "success", "count": len(apps), "applications": apps}

@router.get("/applications/teacher")
async def get_teacher_applications(email: str = Query(...)):
    """Fetch all job applications submitted by a teacher."""
    apps = recruitment_service.get_applications_for_teacher(email)
    return {"status": "success", "count": len(apps), "applications": apps}

@router.patch("/applications/{app_id}/status")
async def update_application_status(app_id: str, payload: UpdateApplicationStatusPayload):
    """School updates applicant status (shortlist, interview, select, reject)."""
    try:
        app = recruitment_service.update_application_status(
            app_id=app_id,
            status=payload.status,
            feedback=payload.feedback
        )
        return {
            "status": "success",
            "message": f"Candidate status updated to {payload.status}",
            "application": app
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
