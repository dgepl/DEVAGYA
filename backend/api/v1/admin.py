from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from services.supabase_service import supabase_service

router = APIRouter(prefix="/admin", tags=["Super Admin"])

class AdminLoginPayload(BaseModel):
    username: str
    password: str

@router.post("/login")
async def admin_login(payload: AdminLoginPayload):
    """Authenticate Admin user with credentials admin / admin123."""
    if payload.username.strip() == "admin" and payload.password.strip() == "admin123":
        return {
            "status": "success",
            "message": "Super Admin access granted",
            "token": "devagya-super-admin-auth-token-9999"
        }
    raise HTTPException(status_code=401, detail="Invalid Super Admin credentials. Use username: admin, password: admin123")

@router.get("/stats")
async def get_admin_dashboard_stats():
    profiles = await supabase_service.get_all_profiles()
    
    total_users = len(profiles)
    teachers_count = len([p for p in profiles if p.get("role") == "teacher"])
    students_count = len([p for p in profiles if p.get("role") == "student"])
    parents_count = len([p for p in profiles if p.get("role") == "parent"])

    return {
        "metrics": {
            "total_users": total_users,
            "teachers_count": teachers_count,
            "students_count": students_count,
            "parents_count": parents_count,
            "total_schools": 42,
            "active_board_subscriptions": {"CBSE": 28, "ICSE": 10, "STATE": 4}
        },
        "profiles": profiles
    }

@router.get("/users")
async def get_all_users():
    """Fetch real user profiles from Supabase Cloud."""
    profiles = await supabase_service.get_all_profiles()
    return {
        "status": "success",
        "count": len(profiles),
        "users": profiles
    }

@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Delete profile from Supabase Cloud."""
    success = await supabase_service.delete_profile(user_id)
    if success:
        return {"status": "success", "message": f"User {user_id} deleted successfully."}
    raise HTTPException(status_code=400, detail="Failed to delete user profile from database.")
