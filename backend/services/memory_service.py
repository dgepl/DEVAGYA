import logging
from typing import Dict, Any, List
from schemas.phase4 import MemoryItemPayload

logger = logging.getLogger("memory_service")

DEFAULT_MEMORIES: List[Dict[str, Any]] = [
    {
        "id": "mem-1",
        "memory_type": "learning_style",
        "memory_key": "preferred_explanation_style",
        "memory_value": "Prefers step-by-step visual analogies and real-world physics examples before numerical derivations.",
        "importance_score": 5,
        "is_active": True,
        "tags": ["visual", "physics"]
    },
    {
        "id": "mem-2",
        "memory_type": "weakness",
        "memory_key": "weak_topics_math",
        "memory_value": "Struggles with Quadratic Equations word problems involving speed/distance and pipe filling.",
        "importance_score": 4,
        "is_active": True,
        "tags": ["math", "quadratic"]
    },
    {
        "id": "mem-3",
        "memory_type": "goal",
        "memory_key": "target_board_score",
        "memory_value": "Aiming for 95%+ distinction in CBSE Class 10 Science & Mathematics Board Exams.",
        "importance_score": 5,
        "is_active": True,
        "tags": ["exam", "cbse"]
    }
]

class MemoryService:
    def get_memories(self, user_id: str = "usr-1") -> List[Dict[str, Any]]:
        return DEFAULT_MEMORIES

    def add_memory(self, payload: MemoryItemPayload) -> Dict[str, Any]:
        new_mem = {
            "id": f"mem-{len(DEFAULT_MEMORIES) + 1}",
            "memory_type": payload.memory_type,
            "memory_key": payload.memory_key,
            "memory_value": payload.memory_value,
            "importance_score": payload.importance_score,
            "is_active": True,
            "tags": payload.tags
        }
        DEFAULT_MEMORIES.append(new_mem)
        return new_mem

memory_service = MemoryService()
