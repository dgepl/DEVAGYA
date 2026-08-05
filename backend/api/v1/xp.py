"""XP & Leaderboard API Router."""
from fastapi import APIRouter, Query
from services.xp_service import xp_service

router = APIRouter(prefix="/xp", tags=["XP & Leaderboard"])


@router.get("/me")
async def get_my_xp(user_id: str = Query(...)):
    """Get current user's XP, level, streak."""
    data = await xp_service.get_user_xp(user_id)
    if data:
        return {
            "total_xp": data.get("total_xp", 0),
            "level": data.get("level", 1),
            "streak": data.get("streak", 0),
            "user_name": data.get("user_name", "Student"),
        }
    return {"total_xp": 0, "level": 1, "streak": 0, "user_name": "Student"}


@router.get("/leaderboard")
async def get_leaderboard(limit: int = Query(20, ge=1, le=100)):
    """Get top users by XP."""
    data = await xp_service.get_leaderboard(limit)
    return {"leaderboard": data}
