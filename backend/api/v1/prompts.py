from fastapi import APIRouter
from typing import List
from schemas.phase2 import PromptItem

router = APIRouter(prefix="/prompts", tags=["AI Prompt Library"])

PROMPT_CATALOG: List[PromptItem] = [
    PromptItem(
        id="p1",
        title="Explain Complex Concept to Class 10",
        category="teaching",
        prompt_template="Explain the topic '{topic}' for Class 10 students using simple real-life analogies, step-by-step logic, and a quick quiz.",
        description="Generates engaging, intuitive explanations for difficult STEM topics."
    ),
    PromptItem(
        id="p2",
        title="Bloom's Taxonomy Assessment Builder",
        category="assessment",
        prompt_template="Formulate 6 questions for '{topic}' covering all levels of Bloom's Taxonomy: Remember, Understand, Apply, Analyze, Evaluate, and Create.",
        description="Creates balanced diagnostic test items."
    ),
    PromptItem(
        id="p3",
        title="5E Lesson Plan Generator",
        category="lesson_planning",
        prompt_template="Generate a full 45-minute 5E (Engage, Explore, Explain, Elaborate, Evaluate) lesson plan for '{topic}'.",
        description="Formats active inquiry lesson timelines."
    ),
    PromptItem(
        id="p4",
        title="Differentiated Homework Assignment",
        category="homework",
        prompt_template="Create a 3-tier homework assignment for '{topic}' with Tier 1 (Foundational), Tier 2 (Intermediate), and Tier 3 (HOTS Challenge).",
        description="Customized homework for diverse student learning speeds."
    ),
    PromptItem(
        id="p5",
        title="English Classroom Conversation Scenario",
        category="english",
        prompt_template="Design a roleplay conversation scenario for students practicing English speaking about '{topic}'. Include vocabulary bank.",
        description="Interactive speaking exercise for English medium development."
    ),
    PromptItem(
        id="p6",
        title="Parent-Teacher Meeting Preparation",
        category="productivity",
        prompt_template="Provide professional talking points and constructive feedback structure for a parent meeting regarding '{topic}'.",
        description="Time-saving communication framework."
    )
]

@router.get("/list", response_model=List[PromptItem])
async def list_prompts(category: str = "all"):
    if category != "all":
        return [p for p in PROMPT_CATALOG if p.category == category]
    return PROMPT_CATALOG
