from fastapi import APIRouter, HTTPException, Depends
from schemas.question import GeneratePaperRequest, GeneratedPaperResponse
from services.groq_service import groq_service

router = APIRouter(prefix="/generator", tags=["Question Generator"])

@router.post("/generate", response_model=GeneratedPaperResponse)
async def generate_paper(request: GeneratePaperRequest):
    try:
        response = await groq_service.generate_question_paper(request)
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
