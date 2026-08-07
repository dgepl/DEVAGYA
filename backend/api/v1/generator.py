import io
import base64
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from PIL import Image
from schemas.question import GeneratePaperRequest, GeneratedPaperResponse
from services.groq_service import groq_service
from services.pdf_service import extract_document_text

router = APIRouter(prefix="/generator", tags=["Question Generator"])

@router.post("/generate", response_model=GeneratedPaperResponse)
async def generate_paper(request: GeneratePaperRequest):
    try:
        response = await groq_service.generate_question_paper(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
    custom_instructions: str = Form("")
):
    """Generate Question Paper from Form Data and optional PDF/Word/Photo file upload."""
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
        custom_instructions=custom_instructions
    )

    try:
        response = await groq_service.generate_question_paper_with_attachment(
            req, extracted_text=extracted_text, image_data_url=image_data_url
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
