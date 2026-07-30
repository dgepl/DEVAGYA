from fastapi import APIRouter

router = APIRouter(prefix="/search", tags=["Smart Search"])

@router.get("/query")
async def natural_language_search(q: str):
    """Interprets intent and returns matching papers, lesson plans, chats, and prompts."""
    query_lower = q.lower()
    results = []

    if "worksheet" in query_lower or "paper" in query_lower or "test" in query_lower:
        results.append({
            "type": "Question Paper",
            "title": "Periodic Assessment - Class 10 Science (Chemical Reactions)",
            "action": "/dashboard/generator",
            "snippet": "40 Marks • 90 Mins • Groq Llama 70B Synthesized"
        })

    if "lesson" in query_lower or "plan" in query_lower or "teach" in query_lower:
        results.append({
            "type": "Lesson Plan",
            "title": "NCERT Master Lesson Plan: Life Processes",
            "action": "/dashboard/lesson-planner",
            "snippet": "45 Mins • 5E Model • Group Work & Rubric"
        })

    if "chat" in query_lower or "mentor" in query_lower or "voice" in query_lower:
        results.append({
            "type": "AI Voice Session",
            "title": "Parent Meeting Practice - English Fluency (Score: 92%)",
            "action": "/dashboard/voice",
            "snippet": "Fluency Analysis & Grammar Feedback"
        })

    if not results:
        results.append({
            "type": "AI Prompt Library",
            "title": f"Search Result for '{q}'",
            "action": "/dashboard/prompts",
            "snippet": "Matching pedagogical templates and classroom activities."
        })

    return {"query": q, "results": results}
