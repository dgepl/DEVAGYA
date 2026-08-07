import io
import base64
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from PIL import Image
from schemas.phase3 import FlashcardGeneratePayload, RevisionGeneratePayload, ExamPrepPayload
from services.revision_service import revision_service
from services.pdf_service import extract_document_text

router = APIRouter(prefix="/revision", tags=["Flashcards, Mindmaps & AI Exam Prep"])

@router.post("/flashcards")
async def generate_flashcard_deck(payload: FlashcardGeneratePayload):
    """Generate AI Spaced Repetition Flashcards."""
    return await revision_service.generate_flashcards(payload)

@router.post("/flashcards-from-file")
async def generate_flashcards_from_file(
    file: Optional[UploadFile] = File(None),
    student_class: str = Form("Class 10"),
    subject: str = Form(""),
    topic: str = Form(""),
    num_cards: int = Form(6)
):
    """Generate AI Spaced Repetition Flashcards from uploaded photo or document (PDF, DOCX, TXT)."""
    extracted_text = ""
    image_data_url = None

    if file:
        file_bytes = await file.read()
        filename = file.filename or "attachment"
        content_type = (file.content_type or "").lower()

        if "image" in content_type or filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            try:
                img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
                if img.width > 1280:
                    h = int(img.height * 1280 / img.width)
                    img = img.resize((1280, h))
                buf = io.BytesIO()
                img.save(buf, format="JPEG", quality=80)
                enc = base64.b64encode(buf.getvalue()).decode("ascii")
                image_data_url = f"data:image/jpeg;base64,{enc}"
            except Exception:
                enc = base64.b64encode(file_bytes).decode("ascii")
                image_data_url = f"data:{content_type or 'image/jpeg'};base64,{enc}"
        else:
            extracted_text = extract_document_text(file_bytes, filename, content_type)

    cards = await revision_service.generate_flashcards_from_content(
        student_class=student_class,
        subject=subject,
        topic=topic,
        num_cards=num_cards,
        extracted_text=extracted_text,
        image_data_url=image_data_url
    )
    return {"cards": cards}

@router.post("/material")
async def generate_revision_material(payload: RevisionGeneratePayload):
    """Generate Quick Notes, Mind Maps, Formula Sheets, or Cheat Sheets."""
    return await revision_service.generate_revision_material(payload)

@router.post("/exam-prep")
async def generate_exam_preparation_suite(payload: ExamPrepPayload):
    """Generate AI Exam Prep Strategy, Roadmap, High Yield Topics & Confidence Score."""
    return await revision_service.generate_exam_prep(payload)
