import io
import base64
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, File, UploadFile, Form
from PIL import Image
from schemas.phase3 import (
    SocraticQueryPayload, SocraticResponse,
    StudyPlanGeneratePayload, NoteCreatePayload, NoteActionPayload, PomodoroLogPayload
)
from services.socratic_tutor_service import socratic_tutor_service
from services.student_service import student_service
from services.ai_provider import ai_provider
from services.pdf_service import extract_document_text
import json

router = APIRouter(prefix="/student", tags=["Student Portal & AI Services"])

@router.get("/dashboard")
async def get_student_dashboard(student_id: str = Query("std-1")):
    """Fetch complete dynamic dashboard data for student."""
    return await student_service.get_student_dashboard_data(student_id)

from services.groq_service import groq_service

@router.post("/socratic-tutor", response_model=SocraticResponse)
async def ask_socratic_tutor(payload: SocraticQueryPayload):
    """Socratic AI Homework Tutor endpoint - guides learning with hints without directly spoiling answers."""
    result = await groq_service.socratic_chat(
        question=payload.query,
        subject=payload.subject or "Science",
        grade=payload.grade or "Class 10",
        action=payload.action or "normal"
    )
    return {
        "response": result.get("response", ""),
        "hints": result.get("hints", []),
        "guiding_question": result.get("guiding_question", ""),
        "suggested_actions": ["Explain differently", "Give me an example", "Check my answer"]
    }

@router.post("/voice-tutor")
async def voice_tutor_chat(payload: Dict[str, Any]):
    """AI Voice Tutor - Spoken audio transcription response."""
    transcript = payload.get("transcript", "")
    subject = payload.get("subject", "Science")
    grade = payload.get("grade", "Class 10")
    response_text = await groq_service.voice_tutor_response(transcript, subject, grade)
    return {
        "status": "success",
        "transcript": transcript,
        "response": response_text
    }

@router.post("/practice-quiz")
async def generate_practice_quiz_groq(payload: Dict[str, Any]):
    """Generate AI practice questions with explanations."""
    student_class = payload.get("student_class", "Class 10")
    subject = payload.get("subject", "Science")
    topic = payload.get("topic", "")
    difficulty = payload.get("difficulty", "Medium")
    num_questions = payload.get("num_questions", 5)
    
    questions = await groq_service.generate_practice_quiz_from_content(
        student_class=student_class,
        subject=subject,
        topic=topic,
        difficulty=difficulty,
        num_questions=num_questions
    )
    return {
        "status": "success",
        "student_class": student_class,
        "subject": subject,
        "topic": topic,
        "difficulty": difficulty,
        "questions": questions
    }

@router.post("/practice-quiz-from-file")
async def generate_practice_quiz_from_file(
    file: Optional[UploadFile] = File(None),
    student_class: str = Form("Class 10"),
    subject: str = Form("Science"),
    topic: str = Form(""),
    difficulty: str = Form("Medium"),
    num_questions: int = Form(5)
):
    """Generate AI practice quiz questions from uploaded photo, document (PDF, DOCX, TXT), or topic."""
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

    questions = await groq_service.generate_practice_quiz_from_content(
        student_class=student_class,
        subject=subject,
        topic=topic,
        difficulty=difficulty,
        num_questions=num_questions,
        extracted_text=extracted_text,
        image_data_url=image_data_url
    )
    return {
        "status": "success",
        "student_class": student_class,
        "subject": subject,
        "topic": topic,
        "difficulty": difficulty,
        "questions": questions
    }

@router.post("/generate-planner")
async def generate_student_planner(payload: StudyPlanGeneratePayload):
    """AI Auto-generated Daily/Weekly study schedule."""
    return await student_service.generate_study_plan(payload)

@router.get("/leaderboard")
async def get_leaderboard(
    scope: str = Query("class"),
    period: str = Query("weekly")
):
    """Fetch school, class, or subject leaderboard rankings."""
    return [
        {"rank": 1, "name": "Rohan Verma", "xp": 720, "level": 7, "streak": 14, "is_user": False},
        {"rank": 2, "name": "Priya Nair", "xp": 590, "level": 6, "streak": 10, "is_user": False},
        {"rank": 3, "name": "Aarav Sharma (You)", "xp": 480, "level": 5, "streak": 7, "is_user": True},
        {"rank": 4, "name": "Ananya Patel", "xp": 450, "level": 5, "streak": 5, "is_user": False},
        {"rank": 5, "name": "Karan Gupta", "xp": 410, "level": 4, "streak": 4, "is_user": False}
    ]

@router.post("/notes/ai-action")
async def handle_notes_ai_action(payload: NoteActionPayload):
    """Perform AI Summarize, AI Rewrite, or AI Quiz creation from student notes."""
    prompt = f"Perform '{payload.action}' on the following student note:\n\n{payload.content}"
    messages = [
        {"role": "system", "content": "You are an expert AI Note Assistant for CBSE/NCERT students. Format your response cleanly using rich Markdown (headings, bullet points, bold key terms). For any mathematics or physics formulas, equations, or scientific units, wrap them in single dollar signs ($E = mc^2$, $\\frac{a}{b}$, $F = ma$) for LaTeX/KaTeX math rendering. If the note is in Hindi, write in fluent, natural Devanagari script."},
        {"role": "user", "content": prompt}
    ]
    try:
        res = await ai_provider.chat_completion(messages, temperature=0.5)
        return {"action": payload.action, "result": (res or "").strip()}
    except Exception as e:
        return {"action": payload.action, "result": f"### {payload.action.upper()} Result\n\nKey concepts summarized cleanly from note content."}

@router.post("/pomodoro/log")
async def log_pomodoro_session(payload: PomodoroLogPayload):
    """Log completed Pomodoro focus session and calculate earned XP."""
    earned_xp = (payload.duration_seconds // 60) * 2 + (payload.focus_rating * 2)
    return {
        "status": "success",
        "duration_minutes": payload.duration_seconds // 60,
        "xp_earned": earned_xp,
        "message": f"Awesome focus! You logged {payload.duration_seconds // 60} mins of deep study and earned +{earned_xp} XP!"
    }

@router.post("/exam-prep")
async def generate_exam_prep(payload: Dict[str, Any]):
    """AI Exam Preparation — generates strategy, high-yield topics, revision roadmap, expected questions."""
    exam_name = payload.get("exam_name", "CBSE Board Exam")
    subject = payload.get("subject", "Science")
    days_remaining = payload.get("days_remaining", 14)

    prompt = f"""You are an expert CBSE/NCERT exam coach. Generate a comprehensive exam preparation strategy.

Exam: {exam_name}
Subject: {subject}
Days Remaining: {days_remaining}

Return a valid JSON object with EXACTLY this structure (no markdown, no extra text):
{{
  "exam_name": "{exam_name}",
  "subject": "{subject}",
  "confidence_score": <number 50-95>,
  "high_yield_topics": [
    {{"topic": "<topic name>", "weightage_marks": <marks out of total>}},
    {{"topic": "<topic name>", "weightage_marks": <marks>}},
    {{"topic": "<topic name>", "weightage_marks": <marks>}},
    {{"topic": "<topic name>", "weightage_marks": <marks>}},
    {{"topic": "<topic name>", "weightage_marks": <marks>}}
  ],
  "revision_roadmap": [
    {{"day": 1, "focus": "<what to study>", "hours": <float>}},
    {{"day": 2, "focus": "<what to study>", "hours": <float>}},
    {{"day": 3, "focus": "<what to study>", "hours": <float>}},
    {{"day": 4, "focus": "<what to study>", "hours": <float>}},
    {{"day": 5, "focus": "<what to study>", "hours": <float>}}
  ],
  "expected_questions": [
    {{"question": "<likely exam question>", "marks": <int>, "outline": "<brief answer outline>"}},
    {{"question": "<likely exam question>", "marks": <int>, "outline": "<brief answer outline>"}},
    {{"question": "<likely exam question>", "marks": <int>, "outline": "<brief answer outline>"}}
  ],
  "top_tips": [
    "<exam tip 1>",
    "<exam tip 2>",
    "<exam tip 3>"
  ]
}}

Generate {days_remaining} days in revision_roadmap if days_remaining <= 7, otherwise 7 days.
Make topics, questions, and tips specific to {subject} for {exam_name}. Return ONLY valid JSON."""

    try:
        response = await ai_provider.chat_completion([
            {"role": "system", "content": "You are an expert exam preparation AI. Return ONLY valid JSON, no markdown."},
            {"role": "user", "content": prompt}
        ])
        
        # Parse JSON from response
        text = response.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        
        data = json.loads(text)
        return data
    except json.JSONDecodeError:
        # Fallback with basic structure
        return {
            "exam_name": exam_name,
            "subject": subject,
            "confidence_score": 72,
            "high_yield_topics": [
                {"topic": f"{subject} - Core Chapter 1", "weightage_marks": 12},
                {"topic": f"{subject} - Core Chapter 2", "weightage_marks": 10},
                {"topic": f"{subject} - Core Chapter 3", "weightage_marks": 8},
            ],
            "revision_roadmap": [
                {"day": i + 1, "focus": f"Day {i+1}: Revise key concepts", "hours": 3.0}
                for i in range(min(days_remaining, 7))
            ],
            "expected_questions": [
                {"question": "AI could not generate questions. Please try again.", "marks": 5, "outline": "Try regenerating."}
            ],
            "top_tips": ["Focus on NCERT textbook", "Practice previous year papers", "Revise formulas daily"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain-topic")
async def explain_topic_briefly(payload: Dict[str, Any]):
    """AI Brief Topic Explainer — provides a structured, concise breakdown for exam preparation topics."""
    topic = payload.get("topic", "")
    subject = payload.get("subject", "General")
    exam_name = payload.get("exam_name", "Board Exam")

    if not topic or not topic.strip():
        raise HTTPException(status_code=400, detail="Topic is required.")

    prompt = f"""You are a master NCERT & CBSE Exam Educator.
Synthesize a clear, brief, structured revision guide for the following topic:

Topic / Chapter: {topic}
Subject: {subject}
Target Exam: {exam_name}

LANGUAGE & NOTATION DIRECTIVE:
1. If the topic is written in Hindi (e.g. 'सूरजमुखी – कहानी का सार' or 'विद्युत धारा के चुंबकीय प्रभाव'), explain in clear, fluent Hindi (Devanagari script). If in English, explain in English.
2. For any mathematics formulas, physics equations, or chemistry reactions, use LaTeX formatted with single dollar signs (e.g. $F = G \\frac{{m_1 m_2}}{{r^2}}$, $v = u + at$, $\\text{{Fe}} + \\text{{CuSO}}_4 \\rightarrow \\text{{FeSO}}_4 + \\text{{Cu}}$).

Respond strictly with a valid JSON object matching this structure:
{{
  "topic": "{topic}",
  "subject": "{subject}",
  "title": "Brief Concept Explanation: {topic}",
  "summary": "2-3 crisp sentences providing the core essence of the topic/chapter.",
  "key_concepts": [
    "Key Point 1: Essential definition or character/plot point",
    "Key Point 2: Core principle, formula, or theme",
    "Key Point 3: Important relationship or conclusion"
  ],
  "common_exam_traps": [
    "Common mistake 1: What students often forget or lose marks on",
    "Common mistake 2: Technical term or diagram label pitfall"
  ],
  "practice_question": {{
    "question": "1 high-probability exam question on this topic",
    "answer": "Concise 2-3 step model answer",
    "explanation": "Scoring tip for full marks"
  }}
}}
"""

    try:
        response = await ai_provider.chat_completion([
            {"role": "system", "content": "You are a master CBSE/NCERT exam preparation assistant. Always return valid JSON."},
            {"role": "user", "content": prompt}
        ], temperature=0.4, max_tokens=3000, response_format_json=True)

        text = (response or "").strip()
        if "```json" in text:
            text = text.split("```json", 1)[1].split("```", 1)[0].strip()
        elif "```" in text:
            text = text.split("```", 1)[1].split("```", 1)[0].strip()

        data = json.loads(text)
        return data
    except Exception as e:
        return {
            "topic": topic,
            "subject": subject,
            "title": f"Revision Guide: {topic}",
            "summary": f"Core concepts and revision points for {topic} in {subject}.",
            "key_concepts": [
                f"Review fundamental NCERT definitions and key principles of {topic}.",
                "Focus on high-weightage sub-topics and solved textbook examples.",
                "Practice writing structured step-by-step answers with neat diagrams/equations."
            ],
            "common_exam_traps": [
                "Avoid skipping units or mandatory diagram labels.",
                "Ensure technical terms are spelled accurately to secure full marks."
            ],
            "practice_question": {
                "question": f"Explain the primary significance of {topic} in {subject}.",
                "answer": "Refer to standard NCERT textbook solutions and marking guidelines.",
                "explanation": "Highlight key technical terms in pencil for maximum examiner clarity."
            }
        }
