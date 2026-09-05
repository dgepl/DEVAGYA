import os
import io
import base64
import json
from typing import Optional, List, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Request
from PIL import Image
from schemas.question import GeneratePaperRequest, GeneratedPaperResponse
from services.groq_service import groq_service
from services.pdf_service import extract_document_text, extract_pdf_content
from services.supabase_service import supabase_service
from services.rate_limiter import check_rate_limit

router = APIRouter(prefix="/generator", tags=["Question Generator"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
PAPERS_STORE_FILE = os.path.join(DATA_DIR, "saved_papers.json")

def _load_papers_store() -> dict:
    if not os.path.exists(PAPERS_STORE_FILE):
        return {}
    try:
        with open(PAPERS_STORE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def _save_papers_store(data: dict):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(PAPERS_STORE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

import asyncio
import logging

logger = logging.getLogger("generator")

async def _save_paper_for_user(email: Optional[str], paper_data: dict):
    if not paper_data:
        return
    try:
        email_clean = (email or "guest@devgya.com").strip().lower()
        store = _load_papers_store()
        user_papers = store.get(email_clean, [])
        filtered = [p for p in user_papers if not (p.get("title") == paper_data.get("title") and p.get("class_name") == paper_data.get("class_name"))]
        store[email_clean] = [paper_data] + filtered
        _save_papers_store(store)

        # Sync to Supabase Cloud asynchronously in background so response returns to user immediately
        async def _bg_cloud_sync():
            try:
                await supabase_service.save_question_paper_to_cloud(email_clean, paper_data)
            except Exception as sync_err:
                logger.warning(f"Background cloud sync warning for {email_clean}: {sync_err}")

        asyncio.create_task(_bg_cloud_sync())
    except Exception as e:
        logger.error(f"Error persisting paper for user {email}: {e}")

from services.error_service import format_ai_exception_detail

@router.post("/generate", response_model=GeneratedPaperResponse)
async def generate_paper(request: GeneratePaperRequest):
    """Generate Question Paper directly from syllabus/OCR context without requiring file attachment."""
    try:
        response = await groq_service.generate_question_paper(request)
        if request.user_email:
            response.user_email = request.user_email
        await _save_paper_for_user(request.user_email, response.dict())
        return response
    except HTTPException:
        raise
    except Exception as e:
        status_code, detail = format_ai_exception_detail(e, "Question Paper Generation")
        raise HTTPException(status_code=status_code, detail=detail)

@router.post("/generate-from-file", response_model=GeneratedPaperResponse)
async def generate_paper_from_file(request: Request):
    """Generate Question Paper with optional multi-file reference PDFs/Photos or direct prompt."""
    form = await request.form()

    title = str(form.get("title") or "Periodic Assessment Exam")
    class_name = str(form.get("class_name") or "Class 10")
    subject = str(form.get("subject") or "Science")
    chapter = str(form.get("chapter") or "General Syllabus")
    difficulty = str(form.get("difficulty") or "medium")
    
    try: total_marks = int(form.get("total_marks") or 40)
    except (ValueError, TypeError): total_marks = 40

    try: time_allowed_mins = int(form.get("time_allowed_mins") or 90)
    except (ValueError, TypeError): time_allowed_mins = 90

    try: num_mcqs = int(form.get("num_mcqs") or 4)
    except (ValueError, TypeError): num_mcqs = 4

    try: num_short = int(form.get("num_short") or 2)
    except (ValueError, TypeError): num_short = 2

    try: num_long = int(form.get("num_long") or 1)
    except (ValueError, TypeError): num_long = 1

    try: num_assertion_reason = int(form.get("num_assertion_reason") or 0)
    except (ValueError, TypeError): num_assertion_reason = 0

    try: num_fill_in_the_blanks = int(form.get("num_fill_in_the_blanks") or 0)
    except (ValueError, TypeError): num_fill_in_the_blanks = 0

    try: num_case_study = int(form.get("num_case_study") or 0)
    except (ValueError, TypeError): num_case_study = 0

    try: ar_marks = int(form.get("ar_marks") or 2)
    except (ValueError, TypeError): ar_marks = 2

    try: fill_marks = int(form.get("fill_marks") or 1)
    except (ValueError, TypeError): fill_marks = 1

    try: case_marks = int(form.get("case_marks") or 4)
    except (ValueError, TypeError): case_marks = 4

    school_name = str(form.get("school_name") or "DEVGYA GLOBAL ACADEMY")
    custom_instructions = str(form.get("custom_instructions") or "")
    question_type_instructions = str(form.get("question_type_instructions") or "")
    user_email = str(form.get("user_email") or "")

    req = GeneratePaperRequest(
        title=title,
        class_name=class_name,
        subject=subject,
        chapter=chapter,
        difficulty=difficulty,
        total_marks=total_marks,
        time_allowed_mins=time_allowed_mins,
        num_mcqs=num_mcqs,
        num_short=num_short,
        num_long=num_long,
        num_assertion_reason=num_assertion_reason,
        num_fill_in_the_blanks=num_fill_in_the_blanks,
        num_case_study=num_case_study,
        ar_marks=ar_marks,
        fill_marks=fill_marks,
        case_marks=case_marks,
        question_type_instructions=question_type_instructions,
        school_name=school_name,
        custom_instructions=custom_instructions,
        user_email=user_email
    )

    # Collect all uploaded files from form regardless of field name (files, files[], file, attachment, etc.)
    uploaded_files: List[Any] = []
    for k, v in form.multi_items():
        if hasattr(v, "filename") and getattr(v, "filename", None) and v not in uploaded_files:
            uploaded_files.append(v)

    # If no file is attached, generate directly from prompt/syllabus
    if not uploaded_files:
        try:
            res = await groq_service.generate_question_paper(req)
            if user_email: res.user_email = user_email
            await _save_paper_for_user(user_email, res.dict())
            return res
        except HTTPException:
            raise
        except Exception as e:
            status_code, detail = format_ai_exception_detail(e, "Question Paper Generation")
            raise HTTPException(status_code=status_code, detail=detail)

    extracted_texts: List[str] = []
    image_data_urls: List[str] = []

    for f_item in uploaded_files:
        try:
            try:
                await f_item.seek(0)
            except Exception:
                pass
            file_bytes = await f_item.read()
        except Exception:
            continue

        if len(file_bytes) == 0:
            continue

        filename = f_item.filename or "attachment"
        content_type = (f_item.content_type or "").lower()
        ext = os.path.splitext(filename)[1].lower()

        if "image" in content_type or ext in (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"):
            try:
                img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
                img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                buf = io.BytesIO()
                img.save(buf, format="JPEG", quality=70, optimize=True)
                enc = base64.b64encode(buf.getvalue()).decode("ascii")
                img_url = f"data:image/jpeg;base64,{enc}"
                if len(image_data_urls) < 5:
                    image_data_urls.append(img_url)
            except Exception as img_err:
                logger.warning(f"Failed to process image attachment {filename}: {img_err}")
        elif ext == ".pdf" or "pdf" in content_type:
            try:
                pdf_text, pdf_img_url = extract_pdf_content(file_bytes)
                if pdf_text and len(pdf_text.strip()) > 10:
                    extracted_texts.append(f"--- Document: {filename} ---\n{pdf_text}")
                if pdf_img_url and len(image_data_urls) < 5:
                    image_data_urls.append(pdf_img_url)
            except Exception:
                try:
                    doc_text = extract_document_text(file_bytes, filename, content_type)
                    if doc_text and len(doc_text.strip()) > 10:
                        extracted_texts.append(f"--- Document: {filename} ---\n{doc_text}")
                except Exception:
                    pass
        else:
            try:
                doc_text = extract_document_text(file_bytes, filename, content_type)
                if doc_text and len(doc_text.strip()) > 10:
                    extracted_texts.append(f"--- Document: {filename} ---\n{doc_text}")
            except Exception:
                pass

    unified_extracted_text = "\n\n".join(extracted_texts).strip()
    has_text = bool(unified_extracted_text and len(unified_extracted_text) >= 10)
    has_image = bool(image_data_urls and len(image_data_urls) > 0)

    # If file couldn't be parsed into text/image, raise a clear actionable error
    if not has_text and not has_image:
        raise HTTPException(
            status_code=400,
            detail=f"Unreadable Attachment: No readable text or images could be extracted from uploaded files. Please ensure files are clear documents/images, or generate directly using syllabus topics without file upload."
        )

    try:
        response = await groq_service.generate_question_paper_with_attachment(
            req=req,
            extracted_text=unified_extracted_text,
            image_data_urls=image_data_urls
        )
        if user_email: response.user_email = user_email
        await _save_paper_for_user(user_email, response.dict())
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"generate_paper_with_attachment notice: {e}. Falling back to curriculum generation so user never sees an error...")
        try:
            response = await groq_service.generate_question_paper(req)
            if user_email: response.user_email = user_email
            await _save_paper_for_user(user_email, response.dict())
            return response
        except Exception as fb_err:
            logger.error(f"Fallback generation also failed: {fb_err}")
            status_code, detail = format_ai_exception_detail(e, "Question Paper Generation with Attachment")
            raise HTTPException(status_code=status_code, detail=detail)

@router.post("/teaching-assistant")
async def generate_teaching_material(payload: dict):
    """AI Teaching Assistant: Generate worksheets, homework, MCQs, topic explanations, and revision materials."""
    content_type = payload.get("content_type", "worksheet")
    topic = payload.get("topic", "Chemical Reactions")
    grade = payload.get("grade", "Class 10")
    subject = payload.get("subject", "Science")
    difficulty = payload.get("difficulty", "Medium")
    
    result = await groq_service.teacher_assistant_generate(content_type, topic, grade, subject, difficulty)
    return {
        "status": "success",
        "data": result
    }

@router.get("/ncert-chapters")
async def get_ncert_chapters(subject: str = "Science", class_name: str = "Class 10"):
    """NCERT Subject & Chapter Directory Catalog."""
    catalog = {
        "Class 10": {
            "Science": [
                {"number": 1, "title": "Chemical Reactions and Equations", "category": "Chemistry"},
                {"number": 2, "title": "Acids, Bases and Salts", "category": "Chemistry"},
                {"number": 3, "title": "Metals and Non-metals", "category": "Chemistry"},
                {"number": 4, "title": "Carbon and its Compounds", "category": "Chemistry"},
                {"number": 5, "title": "Life Processes", "category": "Biology"},
                {"number": 6, "title": "Control and Coordination", "category": "Biology"},
                {"number": 7, "title": "How do Organisms Reproduce?", "category": "Biology"},
                {"number": 8, "title": "Heredity and Evolution", "category": "Biology"},
                {"number": 9, "title": "Light – Reflection and Refraction", "category": "Physics"},
                {"number": 10, "title": "The Human Eye and the Colorful World", "category": "Physics"},
                {"number": 11, "title": "Electricity", "category": "Physics"},
                {"number": 12, "title": "Magnetic Effects of Electric Current", "category": "Physics"}
            ],
            "Mathematics": [
                {"number": 1, "title": "Real Numbers", "category": "Algebra"},
                {"number": 2, "title": "Polynomials", "category": "Algebra"},
                {"number": 3, "title": "Pair of Linear Equations in Two Variables", "category": "Algebra"},
                {"number": 4, "title": "Quadratic Equations", "category": "Algebra"},
                {"number": 5, "title": "Arithmetic Progressions", "category": "Algebra"},
                {"number": 6, "title": "Triangles", "category": "Geometry"},
                {"number": 7, "title": "Coordinate Geometry", "category": "Geometry"},
                {"number": 8, "title": "Introduction to Trigonometry", "category": "Trigonometry"},
                {"number": 9, "title": "Some Applications of Trigonometry", "category": "Trigonometry"},
                {"number": 10, "title": "Circles", "category": "Geometry"}
            ]
        },
        "Class 12": {
            "Physics": [
                {"number": 1, "title": "Electric Charges and Fields", "category": "Electrostatics"},
                {"number": 2, "title": "Electrostatic Potential and Capacitance", "category": "Electrostatics"},
                {"number": 3, "title": "Current Electricity", "category": "Electrodynamics"},
                {"number": 4, "title": "Moving Charges and Magnetism", "category": "Magnetism"}
            ]
        }
    }
    
    selected_class = catalog.get(class_name, catalog["Class 10"])
    chapters = selected_class.get(subject, selected_class.get("Science", []))
    return {"class_name": class_name, "subject": subject, "chapters": chapters}

# --- PERSISTENT QUESTION PAPER HISTORY DATABASE ---
import json
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
PAPERS_STORE_FILE = os.path.join(DATA_DIR, "saved_papers.json")

def _load_papers_store() -> dict:
    if not os.path.exists(PAPERS_STORE_FILE):
        return {}
    try:
        with open(PAPERS_STORE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def _save_papers_store(data: dict):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(PAPERS_STORE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

@router.get("/history")
async def get_saved_papers_history(email: str = "guest@devgya.com"):
    """Retrieve saved question papers history for educator from Supabase Cloud."""
    email_clean = email.strip().lower()
    # 1. Fetch from Supabase Cloud
    cloud_papers = await supabase_service.get_question_papers_from_cloud(email_clean)
    if cloud_papers:
        return {
            "status": "success",
            "email": email_clean,
            "papers": cloud_papers
        }

    # 2. Fallback to local store
    store = _load_papers_store()
    user_papers = store.get(email_clean, [])
    return {
        "status": "success",
        "email": email_clean,
        "papers": user_papers
    }

@router.post("/history")
async def save_paper_to_history(payload: dict):
    """Save or update a generated question paper to educator history in cloud & local store."""
    email_clean = (payload.get("email") or "guest@devgya.com").strip().lower()
    paper = payload.get("paper")
    if not paper:
        raise HTTPException(status_code=400, detail="Paper object is required.")

    await _save_paper_for_user(email_clean, paper)
    return {
        "status": "success",
        "message": "Question paper saved to persistent cloud history!"
    }

@router.delete("/history")
async def delete_paper_from_history(
    title: Optional[str] = None,
    class_name: Optional[str] = None,
    id: Optional[str] = None,
    email: str = "guest@devgya.com"
):
    """Delete a saved question paper from educator history in cloud PostgreSQL & local store."""
    email_clean = email.strip().lower()
    store = _load_papers_store()
    user_papers = store.get(email_clean, [])

    # Filter out paper by id or by title/class_name
    updated = [
        p for p in user_papers 
        if not (
            (id and p.get("id") == id) or 
            (title and p.get("title") == title and (not class_name or p.get("class_name") == class_name))
        )
    ]
    store[email_clean] = updated

    # Clean up from guest and default pools to prevent resurrection
    for pool in ("default", "guest@devgya.com"):
        if pool in store:
            store[pool] = [
                p for p in store[pool] 
                if not (
                    (id and p.get("id") == id) or 
                    (title and p.get("title") == title and (not class_name or p.get("class_name") == class_name))
                )
            ]

    _save_papers_store(store)

    # Delete directly from Supabase Cloud PostgreSQL
    await supabase_service.delete_question_paper_from_cloud(
        email=email_clean,
        title=title,
        class_name=class_name,
        paper_id=id
    )

    return {
        "status": "success",
        "message": "Question paper deleted permanently from history.",
        "count": len(updated)
    }
