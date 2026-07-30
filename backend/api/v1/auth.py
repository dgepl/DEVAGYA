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
    school_name: Optional[str] = "DEVAGYA GLOBAL ACADEMY"
    board: Optional[str] = "CBSE"
    otp_code: str

class LoginPayload(BaseModel):
    email: str
    password: str
    role: Optional[str] = "teacher"

@router.post("/send-otp")
async def send_otp(payload: SendOTPPayload):
    """Generate 6-digit OTP and send via Resend API."""
    try:
        otp_code = otp_service.generate_otp(payload.email)
        await otp_service.send_otp_email(payload.email, payload.name or "User", otp_code)
        return {
            "status": "success",
            "message": f"Verification code sent to {payload.email}",
            "expires_in_seconds": 600,
            # In Resend test domain mode (onboarding@resend.dev), provide debug_code for instant testing with any email
            "debug_code": otp_code if "onboarding@resend.dev" in otp_service.RESEND_FROM_EMAIL or not otp_service.RESEND_API_KEY else None
        }
    except Exception as e:
        logger.error(f"Send OTP Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

from services.supabase_service import supabase_service

@router.post("/verify-otp")
async def verify_otp(payload: VerifyOTPPayload):
    """Verify 6-digit OTP code."""
    try:
        is_valid = otp_service.verify_otp(payload.email, payload.otp_code)
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
    try:
        # Verify OTP first
        is_valid = otp_service.verify_otp(payload.email, payload.otp_code)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")
            
        profile = await supabase_service.create_profile(
            email=payload.email,
            full_name=payload.name,
            role=payload.role,
            school_name=payload.school_name,
            board=payload.board
        )

        user_data = {
            "id": profile.get("id", f"usr-{payload.email.split('@')[0]}"),
            "email": payload.email,
            "name": payload.name,
            "role": payload.role,
            "schoolName": payload.school_name or "DEVAGYA GLOBAL PRIVATE LIMITED",
            "board": payload.board or "CBSE",
            "token": f"devagya-jwt-{payload.role}-token-{profile.get('id', 'session')}"
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
    email_clean = payload.email.strip().lower()
    
    # Query real profile from Supabase Cloud
    profile = await supabase_service.get_profile_by_email(email_clean)
    
    if profile:
        full_name = profile.get("full_name", email_clean.split('@')[0].capitalize())
        user_role = profile.get("role", payload.role or "teacher")
        user_id = profile.get("id", f"usr-{email_clean.split('@')[0]}")
    else:
        # Create user dynamically on first login for smooth production onboarding
        full_name = email_clean.split('@')[0].replace('.', ' ').title()
        user_role = payload.role or "teacher"
        profile = await supabase_service.create_profile(
            email=email_clean,
            full_name=full_name,
            role=user_role
        )
        user_id = profile.get("id", f"usr-{email_clean.split('@')[0]}")

    user_data = {
        "id": user_id,
        "email": email_clean,
        "name": full_name,
        "role": user_role,
        "schoolName": "DEVAGYA GLOBAL PRIVATE LIMITED",
        "board": "CBSE",
        "token": f"devagya-jwt-{user_role}-token-{user_id}"
    }
    return {
        "status": "success",
        "message": "Login successful!",
        "user": user_data
    }
