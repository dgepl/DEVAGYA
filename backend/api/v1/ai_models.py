from fastapi import APIRouter
from services.model_manager_service import model_manager_service

router = APIRouter(prefix="/models", tags=["AI Model Settings & Token Cost Analytics"])

@router.get("/config")
async def get_model_config():
    """Get active AI provider & model settings."""
    return model_manager_service.get_current_model_config()

@router.get("/cost-analytics")
async def get_cost_analytics():
    """Get token consumption and cost analytics dashboard metrics."""
    return model_manager_service.get_cost_analytics()
