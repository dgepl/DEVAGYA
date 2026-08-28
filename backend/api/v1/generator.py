import os
import io
import base64
import json
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
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

async def _save_paper_for_user(email: Optional[str], paper_data: dict):
    if not paper_data:
        return
    email_clean = (email or "guest@devgya.com").strip().lower()
    store = _load_papers_store()
    user_papers = store.get(email_clean, [])
    filtered = [p for p in user_papers if not (p.get("title") == paper_data.get("title") and p.get("class_name") == paper_data.get("class_name"))]
    store[email_clean] = [paper_data] + filtered
    _save_papers_store(store)
    # Sync to Supabase Cloud
    await supabase_service.save_question_paper_to_cloud(email_clean, paper_data)

@router.post("/generate", response_model=GeneratedPaperResponse)
async def generate_paper(request: GeneratePaperRequest):
    """Generate Question Paper directly from syllabus/OCR context without requiring file attachment."""
    try:
        response = await groq_service.generate_question_paper(request)
        if request.user_email:
            response.user_email = request.user_email
        await _save_paper_for_user(request.user_email, response.dict())
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question paper generation failed: {str(e)}")

@router.post("/generate-from-file", response_model=GeneratedPaperResponse)
async def generate_paper_from_file(
    file: Optional[UploadFile] = File(None),
    title: str = Form("Periodic Assessment Exam"),
    class_name: str = Form("Class 10"),
    subject: str = Form("Science"),
    chapter: str = Form("General Syllabus"),
    difficulty: str = Form("medium"),
    total_marks: int = Form(40),
    time_allowed_mins: int = Form(90),
    num_mcqs: int = Form(4),
    num_short: int = Form(2),
    num_long: int = Form(1),
    school_name: str = Form("DEVGYA GLOBAL ACADEMY"),
    custom_instructions: str = Form(""),
    user_email: str = Form("")
):
    """Generate Question Paper with optional reference PDF/Photo or direct prompt."""
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
        school_name=school_name,
        custom_instructions=custom_instructions,
        user_email=user_email
    )

    # If no file is attached, generate directly from prompt/syllabus
    if not file or not file.filename:
        try:
            res = await groq_service.generate_question_paper(req)
            if user_email: res.user_email = user_email
            await _save_paper_for_user(user_email, res.dict())
            return res
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate paper: {str(e)}")

    extracted_text = ""
    image_data_url = None

    file_bytes = await file.read()
    filename = file.filename or "attachment"
    content_type = (file.content_type or "").lower()
    ext = os.path.splitext(filename)[1].lower()

    if "image" in content_type or ext in (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"):
        try:
            img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            if img.width > 1280:
                h = int(img.height * 1280 / img.width)
                img = img.resize((1280, h))
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=80)
            enc = base64.b64encode(buf.getvalue()).decode("ascii")
            image_data_url = f"data:image/jpeg;base64,{enc}"
        except Exception as img_err:
            print(f"[Generator] Image parsing notice: {img_err}")
    elif ext == ".pdf" or "pdf" in content_type:
        try:
            extracted_text, pdf_img_url = extract_pdf_content(file_bytes)
            if pdf_img_url:
                image_data_url = pdf_img_url
        except Exception as pdf_err:
            print(f"[Generator] PDF parsing notice: {pdf_err}")
            try:
                extracted_text = extract_document_text(file_bytes, filename, content_type)
            except Exception:
                pass
    else:
        try:
            extracted_text = extract_document_text(file_bytes, filename, content_type)
        except Exception as doc_err:
            print(f"[Generator] Document text extraction notice: {doc_err}")

    has_text = bool(extracted_text and len(extracted_text.strip()) >= 10)
    has_image = bool(image_data_url and len(image_data_url) > 100)

    # If file couldn't be parsed into text/image, generate directly from prompt & syllabus
    if not has_text and not has_image:
        res = await groq_service.generate_question_paper(req)
        if user_email: res.user_email = user_email
        await _save_paper_for_user(user_email, res.dict())
        return res

    try:
        response = await groq_service.generate_question_paper_with_attachment(
            req=req,
            extracted_text=extracted_text,
            image_data_url=image_data_url
        )
        if user_email: response.user_email = user_email
        await _save_paper_for_user(user_email, response.dict())
        return response
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

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
async def delete_paper_from_history(title: str, class_name: str, email: str = "guest@devgya.com"):
    """Delete a saved question paper from educator history in cloud & local store."""
    email_clean = email.strip().lower()
    store = _load_papers_store()
    user_papers = store.get(email_clean, [])

    updated = [p for p in user_papers if not (p.get("title") == title and p.get("class_name") == class_name)]
    store[email_clean] = updated

    # Clean up from guest and default pools to prevent resurrection
    for pool in ("default", "guest@devgya.com"):
        if pool in store:
            store[pool] = [p for p in store[pool] if not (p.get("title") == title and p.get("class_name") == class_name)]

    _save_papers_store(store)

    # Delete from Supabase Cloud
    await supabase_service.delete_question_paper_from_cloud(email_clean, title, class_name)

    return {
        "status": "success",
        "message": "Question paper deleted from history.",
        "count": len(updated)
    }
