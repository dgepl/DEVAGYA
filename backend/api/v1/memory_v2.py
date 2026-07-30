from fastapi import APIRouter, Query
from schemas.phase4 import MemoryItemPayload
from services.memory_service import memory_service

router = APIRouter(prefix="/memory-v2", tags=["Memory 2.0 Management"])

@router.get("/list")
async def list_user_memories(user_id: str = Query("usr-1")):
    """List Memory 2.0 preference items for user."""
    return memory_service.get_memories(user_id)

@router.post("/add")
async def add_user_memory(payload: MemoryItemPayload):
    """Add a new memory record."""
    return memory_service.add_memory(payload)
