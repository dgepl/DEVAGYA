from fastapi import APIRouter
from schemas.phase3 import FlashcardGeneratePayload, RevisionGeneratePayload, ExamPrepPayload
from services.revision_service import revision_service

router = APIRouter(prefix="/revision", tags=["Flashcards, Mindmaps & AI Exam Prep"])

@router.post("/flashcards")
async def generate_flashcard_deck(payload: FlashcardGeneratePayload):
    """Generate AI Spaced Repetition Flashcards."""
    return await revision_service.generate_flashcards(payload)

@router.post("/material")
async def generate_revision_material(payload: RevisionGeneratePayload):
    """Generate Quick Notes, Mind Maps, Formula Sheets, or Cheat Sheets."""
    return await revision_service.generate_revision_material(payload)

@router.post("/exam-prep")
async def generate_exam_preparation_suite(payload: ExamPrepPayload):
    """Generate AI Exam Prep Strategy, Roadmap, High Yield Topics & Confidence Score."""
    return await revision_service.generate_exam_prep(payload)
