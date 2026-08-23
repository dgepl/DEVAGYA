from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from services.otp_service import otp_service
import logging

logger = logging.getLogger("auth_router")

router = APIRouter(prefix="/auth", tags=["Authentication & OTP Verification"])

class SendOTPPayload(BaseModel):
    email: str
    name: Optional[str] = "User"
    role: Optional[str] = "teacher"

class VerifyOTPPayload(BaseModel):
    email: str
    otp_code: str

class RegisterPayload(BaseModel):
    email: str
    password: str
    name: str
    role: str = "teacher"
    school_name: Optional[str] = ""
    board: Optional[str] = "CBSE"
    subject: Optional[str] = ""
    classes: Optional[str] = "Class 10"
    school_logo: Optional[str] = ""
    otp_code: str

class LoginPayload(BaseModel):
    email: str
    password: str
    role: Optional[str] = "teacher"

class UpdateProfilePayload(BaseModel):
    email: str
    full_name: Optional[str] = None
    school_name: Optional[str] = None
    board: Optional[str] = None
    subject: Optional[str] = None
    classes: Optional[str] = None
    school_logo: Optional[str] = None
    role: Optional[str] = None
    # Student specific
    target_exam: Optional[str] = None
    strong_subject: Optional[str] = None
    weak_subject: Optional[str] = None
    daily_goal_hours: Optional[str] = None
    study_motto: Optional[str] = None
    preferred_language: Optional[str] = None
    # Parent specific
    child_name: Optional[str] = None
    child_school: Optional[str] = None
    child_class: Optional[str] = None
    child_board: Optional[str] = None
    parent_relation: Optional[str] = None
    phone: Optional[str] = None
    parenting_focus: Optional[str] = None
    weekly_report_alerts: Optional[bool] = None

from services.supabase_service import supabase_service

@router.post("/send-otp")
async def send_otp(payload: SendOTPPayload):
    """Generate 6-digit OTP and send via Resend API."""
    raw_email = payload.email or ""
    if " " in raw_email.strip():
        raise HTTPException(status_code=400, detail="Email address cannot contain spaces.")
        
    email_clean = raw_email.strip().lower()
    
    # Check if account with this email already exists in Supabase Cloud
    existing = await supabase_service.get_profile_by_email(email_clean)
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="An account with this email address already exists. Please log in instead."
        )

    try:
        otp_code = otp_service.generate_otp(email_clean)
        await otp_service.send_otp_email(email_clean, payload.name or "User", otp_code)
        return {
            "status": "success",
            "message": f"Verification code sent to {email_clean}",
            "expires_in_seconds": 600,
            "debug_code": None
        }
    except Exception as e:
        logger.error(f"Send OTP Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-otp")
async def verify_otp(payload: VerifyOTPPayload):
    """Verify 6-digit OTP code."""
    raw_email = payload.email or ""
    if " " in raw_email.strip():
        raise HTTPException(status_code=400, detail="Email address cannot contain spaces.")
    email_clean = raw_email.strip().lower()
    
    try:
        is_valid = otp_service.verify_otp(email_clean, payload.otp_code)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid OTP code. Please check your email and try again.")
        return {
            "status": "success",
            "message": "Email verified successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/register")
async def register_user(payload: RegisterPayload):
    """Complete registration and store profile in Supabase Cloud after OTP verification."""
    raw_email = payload.email or ""
    if " " in raw_email.strip():
        raise HTTPException(status_code=400, detail="Email address cannot contain spaces.")
    email_clean = raw_email.strip().lower()

    # Check duplicate email
    existing = await supabase_service.get_profile_by_email(email_clean)
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="An account with this email address already exists. Please log in instead."
        )

    try:
        # Verify OTP first
        is_valid = otp_service.verify_otp(email_clean, payload.otp_code)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")
            
        profile = await supabase_service.create_profile(
            email=email_clean,
            full_name=payload.name,
            role=payload.role,
            school_name=payload.school_name or "",
            board=payload.board or "CBSE",
            subject=payload.subject or "",
            classes=payload.classes or "Class 10",
            school_logo=payload.school_logo or ""
        )
        
        # Save password hash
        if payload.password:
            supabase_service.set_user_password(email_clean, payload.password)

        user_data = {
            "id": profile.get("id", f"usr-{email_clean.split('@')[0]}"),
            "email": email_clean,
            "name": payload.name,
            "role": payload.role,
            "schoolName": profile.get("school_name", ""),
            "board": profile.get("board", "CBSE"),
            "subject": profile.get("subject", ""),
            "classes": profile.get("classes", "Class 10"),
            "schoolLogo": profile.get("school_logo", ""),
            "isProfileComplete": profile.get("is_profile_complete", False),
            "token": f"devgya-jwt-{payload.role}-token-{profile.get('id', 'session')}"
        }
        return {
            "status": "success",
            "message": "Account created successfully!",
            "user": user_data
        }
    except Exception as e:
        logger.error(f"Register error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login_user(payload: LoginPayload):
    """Authenticate user login from Supabase Cloud."""
    raw_email = payload.email or ""
    if " " in raw_email.strip():
        raise HTTPException(status_code=400, detail="Email address cannot contain spaces.")
    email_clean = raw_email.strip().lower()
    
    # Query real profile from Supabase Cloud
    profile = await supabase_service.get_profile_by_email(email_clean)
    
    if not profile:
        raise HTTPException(
            status_code=400, 
            detail="No account found with this email address. Please create an account first."
        )

    # Verify Password strictly
    if not supabase_service.check_user_password(email_clean, payload.password or ""):
        raise HTTPException(
            status_code=400,
            detail="Incorrect password. Please check your credentials and try again."
        )

    full_name = profile.get("full_name", email_clean.split('@')[0].capitalize())
    user_role = profile.get("role", payload.role or "teacher")
    user_id = profile.get("id", f"usr-{email_clean.split('@')[0]}")

    # Enforce strict Role Matching
    if payload.role and payload.role.strip().lower() != user_role.strip().lower():
        raise HTTPException(
            status_code=400,
            detail=f"Role Mismatch: This account is registered as a {user_role.capitalize()}. Please select the {user_role.capitalize()} tab to log in."
        )

    user_data = {
        "id": user_id,
        "email": email_clean,
        "name": full_name,
        "role": user_role,
        "schoolName": profile.get("school_name", ""),
        "board": profile.get("board", "CBSE"),
        "subject": profile.get("subject", ""),
        "classes": profile.get("classes", "Class 10"),
        "schoolLogo": profile.get("school_logo", ""),
        "isProfileComplete": True,
        # Student specific
        "targetExam": profile.get("target_exam", ""),
        "strongSubject": profile.get("strong_subject", ""),
        "weakSubject": profile.get("weak_subject", ""),
        "dailyGoalHours": profile.get("daily_goal_hours", "2"),
        "studyMotto": profile.get("study_motto", ""),
        "preferredLanguage": profile.get("preferred_language", "english"),
        # Parent specific
        "childName": profile.get("child_name", ""),
        "childSchool": profile.get("child_school", ""),
        "childClass": profile.get("child_class", "Class 10"),
        "childBoard": profile.get("child_board", "CBSE"),
        "parentRelation": profile.get("parent_relation", "Father"),
        "phone": profile.get("phone", ""),
        "parentingFocus": profile.get("parenting_focus", "Exam Preparation"),
        "weeklyReportAlerts": profile.get("weekly_report_alerts", True),
        "token": f"devgya-jwt-{user_role}-token-{user_id}"
    }
    return {
        "status": "success",
        "message": "Login successful!",
        "user": user_data
    }

@router.get("/profile")
async def get_profile(email: str):
    """Fetch real-time profile data from server to keep multiple devices in sync."""
    if not email:
        raise HTTPException(status_code=400, detail="Email parameter is required.")
    email_clean = email.strip().lower()
    profile = await supabase_service.get_profile_by_email(email_clean)
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found.")

    user_role = profile.get("role", "teacher")
    user_id = profile.get("id", f"usr-{email_clean.split('@')[0]}")
    user_data = {
        "id": user_id,
        "email": email_clean,
        "name": profile.get("full_name", email_clean.split('@')[0].capitalize()),
        "role": user_role,
        "schoolName": profile.get("school_name", ""),
        "board": profile.get("board", "CBSE"),
        "subject": profile.get("subject", ""),
        "classes": profile.get("classes", "Class 10"),
        "schoolLogo": profile.get("school_logo", ""),
        "isProfileComplete": True,
        # Student specific
        "targetExam": profile.get("target_exam", ""),
        "strongSubject": profile.get("strong_subject", ""),
        "weakSubject": profile.get("weak_subject", ""),
        "dailyGoalHours": profile.get("daily_goal_hours", "2"),
        "studyMotto": profile.get("study_motto", ""),
        "preferredLanguage": profile.get("preferred_language", "english"),
        # Parent specific
        "childName": profile.get("child_name", ""),
        "childSchool": profile.get("child_school", ""),
        "childClass": profile.get("child_class", "Class 10"),
        "childBoard": profile.get("child_board", "CBSE"),
        "parentRelation": profile.get("parent_relation", "Father"),
        "phone": profile.get("phone", ""),
        "parentingFocus": profile.get("parenting_focus", "Exam Preparation"),
        "weeklyReportAlerts": profile.get("weekly_report_alerts", True),
        "token": f"devgya-jwt-{user_role}-token-{user_id}"
    }
    return {
        "status": "success",
        "user": user_data
    }

from services.cloudinary_service import cloudinary_service

class UploadLogoPayload(BaseModel):
    image: str
    email: Optional[str] = None

@router.post("/upload-logo")
async def upload_school_logo(payload: UploadLogoPayload):
    """Upload school logo image directly to Cloudinary storage."""
    res = cloudinary_service.upload_image(payload.image, folder="devgya_school_logos")
    return {
        "status": "success",
        "url": res.get("secure_url", payload.image),
        "secure_url": res.get("secure_url", payload.image)
    }

@router.put("/profile")
async def update_profile(payload: UpdateProfilePayload):
    """Update teacher, student, or parent institutional and personal profile metadata."""
    raw_email = payload.email or ""
    if " " in raw_email.strip():
        raise HTTPException(status_code=400, detail="Email address cannot contain spaces.")
    email_clean = raw_email.strip().lower()

    # Upload to Cloudinary if base64 image data is provided
    school_logo_url = payload.school_logo
    if payload.school_logo and payload.school_logo.startswith("data:image"):
        upload_res = cloudinary_service.upload_image(payload.school_logo, folder="devgya_school_logos")
        school_logo_url = upload_res.get("secure_url") or payload.school_logo

    payload_dict = payload.dict(exclude_unset=True)
    if "school_logo" in payload_dict:
        payload_dict["school_logo"] = school_logo_url
    if "email" in payload_dict:
        del payload_dict["email"]

    updated = supabase_service.save_teacher_profile_details(
        email=email_clean,
        **payload_dict
    )

    profile = await supabase_service.get_profile_by_email(email_clean) or {}
    user_role = profile.get("role", payload.role or "teacher")
    user_data = {
        "id": profile.get("id", f"usr-{email_clean.split('@')[0]}"),
        "email": email_clean,
        "name": profile.get("full_name", payload.full_name or email_clean.split('@')[0].capitalize()),
        "role": user_role,
        "schoolName": profile.get("school_name", ""),
        "board": profile.get("board", "CBSE"),
        "subject": profile.get("subject", ""),
        "classes": profile.get("classes", "Class 10"),
        "schoolLogo": profile.get("school_logo", school_logo_url),
        "isProfileComplete": True,
        # Student specific
        "targetExam": profile.get("target_exam", payload.target_exam or ""),
        "strongSubject": profile.get("strong_subject", payload.strong_subject or ""),
        "weakSubject": profile.get("weak_subject", payload.weak_subject or ""),
        "dailyGoalHours": profile.get("daily_goal_hours", payload.daily_goal_hours or "2"),
        "studyMotto": profile.get("study_motto", payload.study_motto or ""),
        "preferredLanguage": profile.get("preferred_language", payload.preferred_language or "english"),
        # Parent specific
        "childName": profile.get("child_name", payload.child_name or ""),
        "childSchool": profile.get("child_school", payload.child_school or ""),
        "childClass": profile.get("child_class", payload.child_class or "Class 10"),
        "childBoard": profile.get("child_board", payload.child_board or "CBSE"),
        "parentRelation": profile.get("parent_relation", payload.parent_relation or "Father"),
        "phone": profile.get("phone", payload.phone or ""),
        "parentingFocus": profile.get("parenting_focus", payload.parenting_focus or "Exam Preparation"),
        "weeklyReportAlerts": profile.get("weekly_report_alerts", True if payload.weekly_report_alerts is None else payload.weekly_report_alerts),
        "token": f"devgya-jwt-{user_role}-token-{email_clean}"
    }

    return {
        "status": "success",
        "message": "Profile updated successfully!",
        "user": user_data
    }


class ForgotPasswordSendOTPPayload(BaseModel):
    email: str

class ForgotPasswordVerifyOTPPayload(BaseModel):
    email: str
    otp_code: str

class ResetPasswordPayload(BaseModel):
    email: str
    otp_code: str
    new_password: str

@router.post("/forgot-password/send-otp")
async def forgot_password_send_otp(payload: ForgotPasswordSendOTPPayload):
    """Generate and send 6-digit OTP for Forgot Password flow."""
    raw_email = payload.email or ""
    if " " in raw_email.strip():
        raise HTTPException(status_code=400, detail="Email address cannot contain spaces.")
    email_clean = raw_email.strip().lower()

    profile = await supabase_service.get_profile_by_email(email_clean)
    if not profile:
        raise HTTPException(
            status_code=400,
            detail="No account found with this email address. Please check your email or sign up."
        )

    user_name = profile.get("full_name", "Educator")
    try:
        otp_code = otp_service.generate_otp(email_clean)
        await otp_service.send_otp_email(email_clean, user_name, otp_code)
        return {
            "status": "success",
            "message": f"Password reset OTP code sent to {email_clean}",
            "expires_in_seconds": 600
        }
    except Exception as e:
        logger.error(f"Forgot password send OTP error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/forgot-password/verify-otp")
async def forgot_password_verify_otp(payload: ForgotPasswordVerifyOTPPayload):
    """Verify 6-digit OTP code for Forgot Password flow."""
    raw_email = payload.email or ""
    if " " in raw_email.strip():
        raise HTTPException(status_code=400, detail="Email address cannot contain spaces.")
    email_clean = raw_email.strip().lower()

    try:
        is_valid = otp_service.verify_otp(email_clean, payload.otp_code)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid OTP code. Please check your email and try again.")
        return {
            "status": "success",
            "message": "OTP verified successfully. You can now set a new password."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/forgot-password/reset")
async def forgot_password_reset(payload: ResetPasswordPayload):
    """Reset password after OTP verification."""
    raw_email = payload.email or ""
    if " " in raw_email.strip():
        raise HTTPException(status_code=400, detail="Email address cannot contain spaces.")
    email_clean = raw_email.strip().lower()

    if not payload.new_password or len(payload.new_password.strip()) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")

    try:
        is_valid = otp_service.verify_otp(email_clean, payload.otp_code)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")

        supabase_service.set_user_password(email_clean, payload.new_password.strip())
        return {
            "status": "success",
            "message": "Password reset successfully! You can now log in with your new password."
        }
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
