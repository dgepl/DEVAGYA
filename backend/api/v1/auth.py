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
    school_name: Optional[str] = "DEVGYA GLOBAL ACADEMY"
    board: Optional[str] = "CBSE"
    otp_code: str

class LoginPayload(BaseModel):
    email: str
    password: str
    role: Optional[str] = "teacher"

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
            school_name=payload.school_name,
            board=payload.board
        )
        
        # Save password hash
        if payload.password:
            supabase_service.set_user_password(email_clean, payload.password)

        user_data = {
            "id": profile.get("id", f"usr-{email_clean.split('@')[0]}"),
            "email": email_clean,
            "name": payload.name,
            "role": payload.role,
            "schoolName": payload.school_name or "DEVGYA GLOBAL PRIVATE LIMITED",
            "board": payload.board or "CBSE",
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
        "schoolName": "DEVGYA GLOBAL PRIVATE LIMITED",
        "board": "CBSE",
        "token": f"devgya-jwt-{user_role}-token-{user_id}"
    }
    return {
        "status": "success",
        "message": "Login successful!",
        "user": user_data
    }
