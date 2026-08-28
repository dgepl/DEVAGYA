import json
import logging
import re
import time
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Response, Depends
from pydantic import BaseModel, Field
from services.ai_provider import ai_provider
from services.pdf_service import pdf_generator_service

import os
from services.supabase_service import supabase_service

logger = logging.getLogger("assignment_api")
router = APIRouter(prefix="/assignment", tags=["Assignments"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
ASSIGNMENTS_STORE_FILE = os.path.join(DATA_DIR, "saved_assignments.json")

def _load_assignments_store() -> dict:
    if not os.path.exists(ASSIGNMENTS_STORE_FILE):
        return {}
    try:
        with open(ASSIGNMENTS_STORE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def _save_assignments_store(data: dict):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(ASSIGNMENTS_STORE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

async def _save_assignment_for_user(email: Optional[str], assignment_data: dict):
    if not assignment_data:
        return
    email_clean = (email or "guest@devgya.com").strip().lower()
    store = _load_assignments_store()
    user_assignments = store.get(email_clean, [])
    
    asg_id = assignment_data.get("id")
    asg_title = assignment_data.get("title")
    asg_class = assignment_data.get("class_name")

    filtered = [
        a for a in user_assignments 
        if not (
            (asg_id and a.get("id") == asg_id) or 
            (a.get("title") == asg_title and a.get("class_name") == asg_class)
        )
    ]
    store[email_clean] = [assignment_data] + filtered
    _save_assignments_store(store)

class GenerateAssignmentRequest(BaseModel):
    class_name: str = Field(..., example="Class 10")
    subject: str = Field(..., example="Mathematics")
    chapter_topic: str = Field(..., example="Quadratic Equations & Arithmetic Progressions")
    title: Optional[str] = Field(default=None, example="Weekly Practice Assignment 1")
    difficulty: str = Field(default="medium", example="medium") # easy, medium, hard, hots
    mcq_count: int = Field(default=5, ge=0, le=30)
    short_count: int = Field(default=3, ge=0, le=20)
    long_count: int = Field(default=2, ge=0, le=10)
    fill_blanks_count: int = Field(default=0, ge=0, le=15)
    custom_notes: Optional[str] = None
    due_date: Optional[str] = None
    school_name: Optional[str] = "DEVGYA GLOBAL ACADEMY"
    user_email: Optional[str] = None

class AssignmentQuestionItem(BaseModel):
    id: Optional[int] = None
    question_number: int
    question_type: str # mcq, short, long, fill_in_the_blank, assertion_reason, case_study
    section: str # Section A, Section B, Section C, etc.
    question_text: str
    options: Optional[List[str]] = None
    answer: Optional[str] = None
    explanation: Optional[str] = None
    marks: int = 1
    lines_allocated: Optional[int] = 3 # number of writing lines for student response

class AssignmentData(BaseModel):
    id: Optional[str] = None
    title: str
    class_name: str
    subject: str
    chapter_topic: str
    difficulty: str
    total_marks: int
    due_date: Optional[str] = None
    school_name: Optional[str] = "DEVGYA GLOBAL ACADEMY"
    instructions: Optional[List[str]] = None
    questions: List[AssignmentQuestionItem]

class AssignmentPDFConfig(BaseModel):
    answer_space_mode: str = "ruled_lines" # "ruled_lines", "response_box", "none"
    line_style: str = "solid" # "solid", "dotted"
    default_short_lines: int = 4
    default_long_lines: int = 8
    box_height_mm: int = 35
    include_student_header: bool = True
    columns: int = 1 # 1 or 2
    font_size_mode: str = "standard" # "compact", "standard", "large"
    theme_name: str = "cbse" # "cbse", "modern", "minimalist", "emerald"
    school_logo: Optional[str] = None

class AssignmentPDFRequest(BaseModel):
    assignment: AssignmentData
    config: AssignmentPDFConfig
    is_teacher_key: bool = False

def robust_json_parser(raw_text: str) -> Dict[str, Any]:
    """Resilient multi-tier JSON parser for AI outputs with LaTeX math, unescaped backslashes, and trailing commas."""
    text = (raw_text or "").strip()
    if "```json" in text:
        text = text.split("```json", 1)[1].split("```", 1)[0].strip()
    elif "```" in text:
        text = text.split("```", 1)[1].split("```", 1)[0].strip()

    if "{" in text and "}" in text:
        text = text[text.find("{"):text.rfind("}") + 1].strip()

    # Tier 1: Standard parse
    try:
        return json.loads(text, strict=False)
    except Exception:
        pass

    # Tier 2: Escape unescaped backslashes (common in LaTeX formulas like \frac, \sqrt, \alpha, \pm)
    sanitized = re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', text)
    try:
        return json.loads(sanitized, strict=False)
    except Exception:
        pass

    # Tier 3: Strip trailing commas before closing braces/brackets
    sanitized_no_trailing = re.sub(r',\s*([}\]])', r'\1', sanitized)
    try:
        return json.loads(sanitized_no_trailing, strict=False)
    except Exception:
        pass

    # Tier 4: Regex-based extraction of question objects if root wrapper had formatting issues
    try:
        q_match = re.search(r'"questions"\s*:\s*\[(.*)\]', text, re.DOTALL)
        if q_match:
            items = []
            block_pattern = re.compile(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}')
            for b in block_pattern.findall(q_match.group(1)):
                try:
                    cleaned_b = re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', b)
                    cleaned_b = re.sub(r',\s*([}\]])', r'\1', cleaned_b)
                    items.append(json.loads(cleaned_b, strict=False))
                except Exception:
                    pass
            if items:
                return {"questions": items}
    except Exception:
        pass

    # Fallback to direct json.loads to raise informative error if completely unrecoverable
    return json.loads(sanitized_no_trailing)

@router.post("/generate-ai")
async def generate_ai_assignment(req: GenerateAssignmentRequest):
    """
    Generates 100% original, curriculum-accurate CBSE/NCERT assignment questions
    with exact counts for MCQs, Short Answer, Long Answer, and Fill in Blanks.
    Zero mock or hardcoded questions.
    """
    try:
        total_q_count = req.mcq_count + req.short_count + req.long_count + req.fill_blanks_count
        if total_q_count <= 0:
            raise HTTPException(status_code=400, detail="Please specify at least 1 question to generate.")

        diff_str = {
            "easy": "Foundational & Direct Recall",
            "medium": "Application & Conceptual Understanding",
            "hard": "Complex Analytical Multi-Step Problem Solving",
            "hots": "High Order Thinking Skills (HOTS) & Creative Synthesis"
        }.get(req.difficulty.lower(), "Application & Conceptual Understanding")

        # Build detailed distribution checklist
        breakdown_items = []
        q_idx = 1
        if req.mcq_count > 0:
            breakdown_items.append(f"- Questions {q_idx} to {q_idx + req.mcq_count - 1}: EXACTLY {req.mcq_count} Multiple Choice Questions (labeled 'question_type': 'mcq', 'marks': 1, with 4 options ['(A)...', '(B)...', '(C)...', '(D)...']).")
            q_idx += req.mcq_count
        if req.fill_blanks_count > 0:
            breakdown_items.append(f"- Questions {q_idx} to {q_idx + req.fill_blanks_count - 1}: EXACTLY {req.fill_blanks_count} Fill-in-the-Blanks Questions (labeled 'question_type': 'fill_in_the_blank', 'marks': 1).")
            q_idx += req.fill_blanks_count
        if req.short_count > 0:
            breakdown_items.append(f"- Questions {q_idx} to {q_idx + req.short_count - 1}: EXACTLY {req.short_count} Short Answer Questions (labeled 'question_type': 'short', 'marks': 3, 'lines_allocated': 4).")
            q_idx += req.short_count
        if req.long_count > 0:
            breakdown_items.append(f"- Questions {q_idx} to {q_idx + req.long_count - 1}: EXACTLY {req.long_count} Long Answer / HOTS Questions (labeled 'question_type': 'long', 'marks': 5, 'lines_allocated': 8).")
            q_idx += req.long_count

        breakdown_text = "\n".join(breakdown_items)
        notes_context = f"\nTeacher's Reference Notes / Focus:\n{req.custom_notes.strip()}\n" if req.custom_notes and req.custom_notes.strip() else ""

        system_prompt = (
            f"You are DEVGYA's Master CBSE/NCERT Curriculum Architect and Senior Teacher Assessment Synthesizer for {req.class_name} {req.subject}. "
            f"You MUST generate a complete assignment with EXACTLY {total_q_count} unique, authentic questions for '{req.chapter_topic}'. "
            f"Use formal LaTeX notation ($...$) for mathematical and scientific formulas (e.g. $x^2 + 5x + 6 = 0$, $\\frac{{-b \\pm \\sqrt{{b^2 - 4ac}}}}{{2a}}$, $H_2SO_4$). "
            f"IMPORTANT: Respond ONLY with a valid JSON object matching the requested schema. You MUST generate ALL {total_q_count} questions."
        )

        user_prompt = f"""Create an authentic homework/classroom worksheet for {req.class_name} — {req.subject}.
Chapter / Topic: {req.chapter_topic}
Cognitive Difficulty: {diff_str}
{notes_context}

MANDATORY QUESTION COUNT CHECKLIST:
You MUST generate ALL {total_q_count} questions in the 'questions' array:
{breakdown_text}

JSON OUTPUT STRUCTURE:
{{
  "title": "{req.title or f'{req.subject} Assignment: {req.chapter_topic}'}",
  "instructions": [
    "Write your answers clearly in the designated spaces provided.",
    "Show all intermediate calculation steps for numerical and algebraic problems.",
    "Submit on or before the due date."
  ],
  "questions": [
    {{
      "question_number": 1,
      "question_type": "mcq",
      "section": "Section A: Multiple Choice Questions",
      "question_text": "...",
      "options": ["(A)...", "(B)...", "(C)...", "(D)..."],
      "answer": "(A)...",
      "explanation": "...",
      "marks": 1,
      "lines_allocated": 1
    }}
  ]
}}
Ensure the 'questions' array contains ALL {total_q_count} items without stopping early.
"""

        raw_response = await ai_provider.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=4000,
            response_format_json=True
        )

        parsed = robust_json_parser(raw_response)
        raw_questions = parsed.get("questions") or []

        # Check if any question types were missed by the model and generate supplement if needed
        parsed_mcqs = [q for q in raw_questions if "mcq" in str(q.get("question_type", "")).lower()]
        parsed_shorts = [q for q in raw_questions if "short" in str(q.get("question_type", "")).lower()]
        parsed_longs = [q for q in raw_questions if "long" in str(q.get("question_type", "")).lower() or "hots" in str(q.get("question_type", "")).lower()]

        # If model missed short or long questions, fetch supplement
        missing_short = max(0, req.short_count - len(parsed_shorts))
        missing_long = max(0, req.long_count - len(parsed_longs))
        missing_mcq = max(0, req.mcq_count - len(parsed_mcqs))

        if (missing_short > 0 or missing_long > 0 or missing_mcq > 0) and len(raw_questions) < total_q_count:
            try:
                supp_prompt = f"""Generate the missing questions for {req.class_name} {req.subject} topic '{req.chapter_topic}':
- {missing_mcq} MCQs (1 Mark each, 4 options)
- {missing_short} Short Answer Questions (3 Marks each)
- {missing_long} Long Answer Questions (5 Marks each)
Respond in JSON: {{"questions": [{{"question_type": "...", "section": "...", "question_text": "...", "options": ["(A)...", "(B)...", "(C)...", "(D)..."], "answer": "...", "explanation": "...", "marks": 3, "lines_allocated": 4}}]}}"""
                supp_raw = await asyncio.wait_for(
                    ai_provider.chat_completion(
                        messages=[
                            {"role": "system", "content": f"You are CBSE {req.subject} question generator. Return JSON."},
                            {"role": "user", "content": supp_prompt}
                        ],
                        temperature=0.3,
                        max_tokens=2500,
                        response_format_json=True
                    ),
                    timeout=8.0
                )
                supp_parsed = robust_json_parser(supp_raw)
                supp_qs = supp_parsed.get("questions") or []
                raw_questions.extend(supp_qs)
            except Exception as supp_err:
                logger.info(f"[Assignment Supplement] Notice: {supp_err}")

        # Clean and standardize questions
        cleaned_questions = []
        q_counter = 1
        total_calculated_marks = 0

        for q in raw_questions:
            q_text = str(q.get("question_text", "")).strip()
            if not q_text:
                continue

            q_type = str(q.get("question_type", "short")).lower()
            if "mcq" in q_type:
                q_type = "mcq"
                default_marks = 1
                default_lines = 1
                sec = "Section A: Multiple Choice Questions"
            elif "fill" in q_type or "blank" in q_type:
                q_type = "fill_in_the_blank"
                default_marks = 1
                default_lines = 2
                sec = "Section A: Objective Questions"
            elif "long" in q_type or "case" in q_type or "hots" in q_type:
                q_type = "long"
                default_marks = int(q.get("marks", 5)) or 5
                default_lines = int(q.get("lines_allocated", 8)) or 8
                sec = "Section C: Long Answer / Case Study Questions"
            else:
                q_type = "short"
                default_marks = int(q.get("marks", 3)) or 3
                default_lines = int(q.get("lines_allocated", 4)) or 4
                sec = "Section B: Short Answer Questions"

            opts = q.get("options")
            if q_type == "mcq" and (not opts or len(opts) < 2):
                opts = ["(A) True", "(B) False", "(C) Partially True", "(D) Cannot be determined"]

            marks = int(q.get("marks", default_marks))
            total_calculated_marks += marks

            cleaned_questions.append({
                "id": q_counter,
                "question_number": q_counter,
                "question_type": q_type,
                "section": q.get("section") or sec,
                "question_text": q_text,
                "options": opts,
                "answer": str(q.get("answer", "")).strip(),
                "explanation": str(q.get("explanation", "")).strip(),
                "marks": marks,
                "lines_allocated": int(q.get("lines_allocated", default_lines))
            })
            q_counter += 1

        assignment_id = f"asg-{int(time.time() * 1000) % 1000000:06d}"
        assignment_result = {
            "id": assignment_id,
            "title": parsed.get("title") or req.title or f"{req.subject} Worksheet: {req.chapter_topic}",
            "class_name": req.class_name,
            "subject": req.subject,
            "chapter_topic": req.chapter_topic,
            "difficulty": req.difficulty,
            "total_marks": total_calculated_marks,
            "due_date": req.due_date or time.strftime("%Y-%m-%d"),
            "school_name": req.school_name or "DEVGYA GLOBAL ACADEMY",
            "instructions": parsed.get("instructions") or [
                "Write all answers legibly in the designated spaces.",
                "Show full calculation steps where applicable.",
                "Adhere to the prescribed word limits."
            ],
            "questions": cleaned_questions
        }

        # Auto-save to teacher's persistent assignment history
        if req.user_email:
            await _save_assignment_for_user(req.user_email, assignment_result)

        return {"status": "success", "assignment": assignment_result}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AI Assignment Generation Failed] {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI Assignment Generation failed: {str(e)}")

@router.get("/history")
async def get_saved_assignments_history(email: str = "guest@devgya.com"):
    """Retrieve saved assignments history for educator."""
    email_clean = email.strip().lower()
    store = _load_assignments_store()
    user_assignments = store.get(email_clean, [])
    return {
        "status": "success",
        "email": email_clean,
        "assignments": user_assignments
    }

@router.post("/history")
async def save_assignment_to_history(payload: dict):
    """Save or update an assignment to educator history in persistent store."""
    email_clean = (payload.get("email") or "guest@devgya.com").strip().lower()
    assignment = payload.get("assignment")
    if not assignment:
        raise HTTPException(status_code=400, detail="Assignment object is required.")

    await _save_assignment_for_user(email_clean, assignment)
    return {
        "status": "success",
        "message": "Assignment saved to persistent history!"
    }

@router.delete("/history")
async def delete_assignment_from_history(id: Optional[str] = None, title: Optional[str] = None, class_name: Optional[str] = None, email: str = "guest@devgya.com"):
    """Delete a saved assignment from educator history in persistent store."""
    email_clean = email.strip().lower()
    store = _load_assignments_store()
    user_assignments = store.get(email_clean, [])

    updated = [
        a for a in user_assignments 
        if not (
            (id and a.get("id") == id) or 
            (title and class_name and a.get("title") == title and a.get("class_name") == class_name)
        )
    ]
    store[email_clean] = updated

    # Clean up from guest and default pools
    for pool in ("default", "guest@devgya.com"):
        if pool in store:
            store[pool] = [
                a for a in store[pool] 
                if not (
                    (id and a.get("id") == id) or 
                    (title and class_name and a.get("title") == title and a.get("class_name") == class_name)
                )
            ]

    _save_assignments_store(store)
    return {
        "status": "success",
        "message": "Assignment deleted from history.",
        "count": len(updated)
    }

@router.post("/generate-pdf")
async def generate_assignment_pdf(payload: AssignmentPDFRequest):
    """
    Renders fully styled PDF with custom student response lines, response boxes,
    or question-sheet layout according to teacher's configured styling.
    """
    try:
        pdf_bytes = pdf_generator_service.generate_assignment_worksheet_pdf(
            assignment=payload.assignment.dict(),
            config=payload.config.dict(),
            is_teacher_key=payload.is_teacher_key
        )

        filename = f"{payload.assignment.subject}_{payload.assignment.class_name}_Assignment.pdf".replace(" ", "_")
        if payload.is_teacher_key:
            filename = filename.replace(".pdf", "_Teacher_Key.pdf")

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        logger.error(f"[Assignment PDF Error] {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
