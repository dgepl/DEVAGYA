from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Super Admin"])

@router.get("/stats")
async def get_admin_dashboard_stats():
    return {
        "metrics": {
            "total_schools": 42,
            "active_teachers": 1280,
            "question_papers_generated": 18450,
            "ocr_pages_scanned": 6230,
            "groq_tokens_used": 14200000,
            "active_board_subscriptions": {"CBSE": 28, "ICSE": 10, "STATE": 4}
        },
        "recent_schools": [
            {"id": "1", "name": "Apex International Academy", "board": "CBSE", "teachers": 45, "joined_date": "2025-01-15"},
            {"id": "2", "name": "St. Xavier Higher Secondary", "board": "ICSE", "teachers": 62, "joined_date": "2025-02-01"},
            {"id": "3", "name": "Delhi Public World School", "board": "CBSE", "teachers": 88, "joined_date": "2025-02-14"},
            {"id": "4", "name": "Greenwood High International", "board": "IB", "teachers": 34, "joined_date": "2025-03-10"}
        ]
    }
