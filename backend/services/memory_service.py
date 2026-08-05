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

    def get_relevant_memories(self, query: str, user_id: str = "usr-1", top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Credit-saving RAG filter: Returns only memories relevant to the user query.
        Reduces memory payload size by up to 80% compared to dumping full memory lists.
        """
        query_words = set(query.lower().split())
        scored_memories = []

        for mem in DEFAULT_MEMORIES:
            if not mem.get("is_active", True):
                continue
            
            score = mem.get("importance_score", 1)
            val_words = mem.get("memory_value", "").lower().split()
            tags = [t.lower() for t in mem.get("tags", [])]
            
            overlap = len(query_words.intersection(set(val_words + tags)))
            total_score = score + (overlap * 3)
            scored_memories.append((total_score, mem))

        scored_memories.sort(key=lambda x: x[0], reverse=True)
        return [mem for _, mem in scored_memories[:top_k]]

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
