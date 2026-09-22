from fastapi import APIRouter, HTTPException, Query, Body, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from services.suggestion_service import suggestion_service

router = APIRouter(prefix="/suggestions", tags=["User Portal Suggestions & Feedback"])

class CreateSuggestionPayload(BaseModel):
    user_name: Optional[str] = "User"
    user_email: str
    user_role: Optional[str] = "teacher"
    school_name: Optional[str] = ""
    feature_id: Optional[str] = "general"
    feature_name: Optional[str] = "General Platform"
    category: Optional[str] = "Feature Request"
    title: str
    description: str
    impact_rating: Optional[str] = "Medium"

class UpdateSuggestionPayload(BaseModel):
    status: str
    admin_response: Optional[str] = None

@router.post("")
async def submit_suggestion(payload: CreateSuggestionPayload):
    """Submits a user feedback or feature suggestion."""
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Suggestion title is required.")
    if not payload.description.strip():
        raise HTTPException(status_code=400, detail="Suggestion description is required.")
    if not payload.user_email.strip():
        raise HTTPException(status_code=400, detail="User email is required.")

    suggestion = suggestion_service.create_suggestion(payload.model_dump())
    return {
        "status": "success",
        "message": "Thank you! Your suggestion has been recorded and submitted to the DEVGYA product team.",
        "suggestion": suggestion
    }

@router.get("/my")
async def get_my_suggestions(email: str = Query(...)):
    """Retrieves all suggestions submitted by a specific user."""
    items = suggestion_service.get_user_suggestions(email)
    return {
        "status": "success",
        "count": len(items),
        "suggestions": items
    }

@router.get("/admin/all")
async def get_admin_suggestions(
    role: Optional[str] = Query(None),
    feature: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Admin endpoint: lists all user suggestions across roles and features with search/filter support."""
    items = suggestion_service.get_all_suggestions(
        role=role,
        feature=feature,
        status=status,
        search=search
    )
    return {
        "status": "success",
        "count": len(items),
        "suggestions": items
    }

@router.patch("/admin/{suggestion_id}")
async def update_suggestion_status(suggestion_id: str, payload: UpdateSuggestionPayload):
    """Admin endpoint: updates the status or response note for a suggestion."""
    updated = suggestion_service.update_suggestion_status(
        s_id=suggestion_id,
        status=payload.status,
        admin_response=payload.admin_response
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Suggestion not found.")
    return {
        "status": "success",
        "message": "Suggestion status updated successfully.",
        "suggestion": updated
    }

@router.delete("/admin/{suggestion_id}")
async def delete_suggestion(suggestion_id: str):
    """Admin endpoint: permanently deletes a suggestion."""
    deleted = suggestion_service.delete_suggestion(suggestion_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Suggestion not found.")
    return {
        "status": "success",
        "message": "Suggestion deleted successfully."
    }
