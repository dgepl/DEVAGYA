import asyncio
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

from services.rate_limiter import check_rate_limit

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
    # Sync to Supabase Cloud
    await supabase_service.save_assignment_to_cloud(email_clean, assignment_data)

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

    return json.loads(sanitized_no_trailing)

def _classify_and_bucket_questions(raw_questions: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """Accurately categorizes generated questions into MCQ, Fill in the Blanks, Short Answer, and Long Answer."""
    buckets: Dict[str, List[Dict[str, Any]]] = {
        "mcq": [],
        "fill_in_the_blank": [],
        "short": [],
        "long": []
    }
    
    for q in raw_questions:
        if not isinstance(q, dict):
            continue
        q_text = str(q.get("question_text", "")).strip()
        if not q_text:
            continue
            
        q_type = str(q.get("question_type", "")).lower()
        opts = q.get("options")
        
        if "mcq" in q_type or "multiple" in q_type or (opts and isinstance(opts, list) and len(opts) >= 2):
            buckets["mcq"].append(q)
        elif "fill" in q_type or "blank" in q_type or "____" in q_text:
            buckets["fill_in_the_blank"].append(q)
        elif "long" in q_type or "hots" in q_type or "case" in q_type or int(q.get("marks", 0) or 0) >= 5:
            buckets["long"].append(q)
        else:
            buckets["short"].append(q)
            
    return buckets

@router.post("/generate-ai", dependencies=[Depends(check_rate_limit(max_requests=15, window_seconds=60, key_prefix="asg_gen"))])
async def generate_ai_assignment(req: GenerateAssignmentRequest):
    """
    Generates 100% original, curriculum-accurate CBSE/NCERT assignment questions
    with EXACT counts for MCQs, Short Answer, Long Answer, and Fill in Blanks.
    Zero mock or hardcoded questions.
    """
    try:
        target_mcq = max(0, req.mcq_count)
        target_fill = max(0, req.fill_blanks_count)
        target_short = max(0, req.short_count)
        target_long = max(0, req.long_count)
        total_q_count = target_mcq + target_fill + target_short + target_long
        
        if total_q_count <= 0:
            raise HTTPException(status_code=400, detail="Please specify at least 1 question to generate.")

        diff_str = {
            "easy": "Foundational & Direct Recall",
            "medium": "Application & Conceptual Understanding",
            "hard": "Complex Analytical Multi-Step Problem Solving",
            "hots": "High Order Thinking Skills (HOTS) & Creative Synthesis"
        }.get(req.difficulty.lower(), "Application & Conceptual Understanding")

        subj_lower = (req.subject or "").lower()
        is_math = "math" in subj_lower
        is_science = any(k in subj_lower for k in ["sci", "phys", "chem", "bio"])
        is_lang = any(k in subj_lower for k in ["eng", "hindi", "sanskrit", "language"])

        if is_math:
            subject_directive = f"CRITICAL: This is a MATHEMATICS assignment for {req.class_name}. All questions MUST be authentic CBSE/NCERT Math problems based strictly on '{req.chapter_topic}'. Use LaTeX ($...$) for algebraic expressions, fractions, powers, and equations."
            sample_instructions = [
                "Write all answers clearly in the designated spaces provided.",
                "Show all intermediate calculation and algebraic steps for numerical problems."
            ]
        elif is_science:
            subject_directive = f"CRITICAL: This is a {req.subject.upper()} assignment for {req.class_name}. All questions MUST strictly test scientific concepts, laws, chemical equations, diagrams, and definitions for '{req.chapter_topic}'. Do NOT generate pure mathematics algebra questions unless explicitly requested in physics."
            sample_instructions = [
                "Write all answers clearly in the designated spaces provided.",
                "Draw neat labeled diagrams and write balanced chemical equations where applicable."
            ]
        elif is_lang:
            subject_directive = f"CRITICAL: This is an {req.subject.upper()} language assignment for {req.class_name}. All questions MUST test language comprehension, grammar, literature analysis, vocabulary, and writing skills for '{req.chapter_topic}'. Do NOT include mathematical or numerical calculation questions."
            sample_instructions = [
                "Write all answers legibly in clear sentences.",
                "Pay careful attention to grammar, spelling, and word limit."
            ]
        else:
            subject_directive = f"CRITICAL: This is a {req.subject.upper()} assignment for {req.class_name}. All questions MUST be strictly based on the social science / commerce / theoretical curriculum for '{req.chapter_topic}'. Do NOT generate math or numerical calculation questions."
            sample_instructions = [
                "Write all answers clearly in the designated spaces provided.",
                "Structure subjective answers with clear headings and bullet points."
            ]

        notes_context = f"\nTeacher's Reference Notes / Focus Area:\n{req.custom_notes.strip()}\n" if req.custom_notes and req.custom_notes.strip() else ""

        tasks = []
        
        # 1. Objective Task (MCQs and Fill-in-the-blanks) if requested
        if target_mcq > 0 or target_fill > 0:
            obj_prompt = f"""{subject_directive}

Generate EXACTLY the following objective questions for {req.class_name} {req.subject}.
Chapter / Topic: {req.chapter_topic}
Difficulty: {diff_str}
{notes_context}

MANDATORY EXACT QUESTION QUANTITIES:
- EXACTLY {target_mcq} Multiple Choice Questions (labeled 'question_type': 'mcq', 'marks': 1, with 4 options ['(A)...', '(B)...', '(C)...', '(D)...'], correct answer, and explanation)
- EXACTLY {target_fill} Fill-in-the-Blanks Questions (labeled 'question_type': 'fill_in_the_blank', 'marks': 1, with answer and explanation)

JSON FORMAT ONLY:
{{
  "title": "{req.title or f'{req.subject} Assignment: {req.chapter_topic}'}",
  "instructions": {json.dumps(sample_instructions)},
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
You MUST produce ALL {target_mcq + target_fill} objective questions in the 'questions' list."""
            tasks.append(
                ai_provider.chat_completion(
                    messages=[
                        {"role": "system", "content": f"You are DEVGYA's Master CBSE/NCERT Assessment Creator for {req.class_name} {req.subject}. Strictly adhere to the requested subject ({req.subject}) and topic ({req.chapter_topic}). Return valid JSON."},
                        {"role": "user", "content": obj_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=3500,
                    response_format_json=True
                )
            )

        # 2. Subjective Task (Short Answer and Long Answer / HOTS) if requested
        if target_short > 0 or target_long > 0:
            subj_prompt = f"""{subject_directive}

Generate EXACTLY the following subjective questions for {req.class_name} {req.subject}.
Chapter / Topic: {req.chapter_topic}
Difficulty: {diff_str}
{notes_context}

MANDATORY EXACT QUESTION QUANTITIES:
- EXACTLY {target_short} Short Answer Questions (labeled 'question_type': 'short', 'marks': 3, 'lines_allocated': 4, with complete step-by-step scoring rubric/model answer)
- EXACTLY {target_long} Long Answer / HOTS Questions (labeled 'question_type': 'long', 'marks': 5, 'lines_allocated': 8, with detailed explanation, analysis, or multi-step solution)

JSON FORMAT ONLY:
{{
  "title": "{req.title or f'{req.subject} Assignment: {req.chapter_topic}'}",
  "instructions": {json.dumps(sample_instructions)},
  "questions": [
    {{
      "question_number": 1,
      "question_type": "short",
      "section": "Section B: Short Answer Questions",
      "question_text": "...",
      "options": null,
      "answer": "...",
      "explanation": "...",
      "marks": 3,
      "lines_allocated": 4
    }}
  ]
}}
You MUST produce ALL {target_short + target_long} subjective questions in the 'questions' list."""
            tasks.append(
                ai_provider.chat_completion(
                    messages=[
                        {"role": "system", "content": f"You are DEVGYA's Master CBSE/NCERT Assessment Creator for {req.class_name} {req.subject}. Strictly adhere to the requested subject ({req.subject}) and topic ({req.chapter_topic}). Return valid JSON."},
                        {"role": "user", "content": subj_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=3500,
                    response_format_json=True
                )
            )

        # Run tasks in parallel for lightning-fast, high-quality output
        raw_responses = await asyncio.gather(*tasks, return_exceptions=True)

        extracted_raw_questions = []
        assignment_title = req.title or f"{req.subject} Worksheet: {req.chapter_topic}"
        instructions = [
            "Write all answers legibly in the designated spaces provided.",
            "Show full intermediate calculation steps for numerical problems.",
            "Adhere to the prescribed marks allocation and word limits."
        ]

        for resp in raw_responses:
            if isinstance(resp, str):
                parsed = robust_json_parser(resp)
                if parsed.get("title"):
                    assignment_title = parsed.get("title")
                if parsed.get("instructions"):
                    instructions = parsed.get("instructions")
                extracted_raw_questions.extend(parsed.get("questions") or [])
            elif isinstance(resp, Exception):
                logger.warning(f"[Assignment Section Error] {resp}")

        # Bucket and count
        buckets = _classify_and_bucket_questions(extracted_raw_questions)

        # Check for any deficit and run targeted supplementary generation
        missing_mcq = max(0, target_mcq - len(buckets["mcq"]))
        missing_fill = max(0, target_fill - len(buckets["fill_in_the_blank"]))
        missing_short = max(0, target_short - len(buckets["short"]))
        missing_long = max(0, target_long - len(buckets["long"]))

        total_missing = missing_mcq + missing_fill + missing_short + missing_long

        if total_missing > 0:
            logger.info(f"[Assignment Deficit Detected] Need: MCQ={missing_mcq}, Fill={missing_fill}, Short={missing_short}, Long={missing_long}. Fetching authentic supplement...")
            supp_lines = []
            if missing_mcq > 0:
                supp_lines.append(f"- EXACTLY {missing_mcq} MCQs (labeled 'question_type': 'mcq', 'marks': 1, with 4 options ['(A)...', '(B)...', '(C)...', '(D)...'])")
            if missing_fill > 0:
                supp_lines.append(f"- EXACTLY {missing_fill} Fill-in-the-Blanks (labeled 'question_type': 'fill_in_the_blank', 'marks': 1)")
            if missing_short > 0:
                supp_lines.append(f"- EXACTLY {missing_short} Short Answer Questions (labeled 'question_type': 'short', 'marks': 3)")
            if missing_long > 0:
                supp_lines.append(f"- EXACTLY {missing_long} Long Answer / HOTS Questions (labeled 'question_type': 'long', 'marks': 5)")

            supp_prompt = f"""Generate EXACTLY {total_missing} authentic CBSE questions for {req.class_name} {req.subject}, topic '{req.chapter_topic}':
{chr(10).join(supp_lines)}

Return JSON ONLY:
{{"questions": [{{"question_type": "...", "section": "...", "question_text": "...", "options": ["(A)...", "(B)...", "(C)...", "(D)..."], "answer": "...", "explanation": "...", "marks": 1, "lines_allocated": 3}}]}}"""
            try:
                supp_raw = await ai_provider.chat_completion(
                    messages=[
                        {"role": "system", "content": f"You are CBSE {req.subject} expert question generator. Return JSON."},
                        {"role": "user", "content": supp_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=3000,
                    response_format_json=True
                )
                supp_parsed = robust_json_parser(supp_raw)
                supp_bucket = _classify_and_bucket_questions(supp_parsed.get("questions") or [])
                buckets["mcq"].extend(supp_bucket["mcq"])
                buckets["fill_in_the_blank"].extend(supp_bucket["fill_in_the_blank"])
                buckets["short"].extend(supp_bucket["short"])
                buckets["long"].extend(supp_bucket["long"])
            except Exception as supp_err:
                logger.warning(f"[Assignment Supplement Error] {supp_err}")

        # Assemble exact requested counts
        selected_mcqs = buckets["mcq"][:target_mcq]
        selected_fills = buckets["fill_in_the_blank"][:target_fill]
        selected_shorts = buckets["short"][:target_short]
        selected_longs = buckets["long"][:target_long]

        # Standardize question numbering, sections, marks, lines
        cleaned_questions = []
        q_counter = 1
        total_calculated_marks = 0

        # Section A: MCQs
        for q in selected_mcqs:
            opts = q.get("options")
            if not opts or len(opts) < 2:
                opts = ["(A) True", "(B) False", "(C) Partially True", "(D) Cannot be determined"]
            cleaned_questions.append({
                "id": q_counter,
                "question_number": q_counter,
                "question_type": "mcq",
                "section": "Section A: Multiple Choice Questions",
                "question_text": str(q.get("question_text", "")).strip(),
                "options": opts,
                "answer": str(q.get("answer", "")).strip(),
                "explanation": str(q.get("explanation", "")).strip(),
                "marks": 1,
                "lines_allocated": 1
            })
            total_calculated_marks += 1
            q_counter += 1

        # Section B: Fill in Blanks
        for q in selected_fills:
            cleaned_questions.append({
                "id": q_counter,
                "question_number": q_counter,
                "question_type": "fill_in_the_blank",
                "section": "Section B: Objective / Fill in the Blanks",
                "question_text": str(q.get("question_text", "")).strip(),
                "options": None,
                "answer": str(q.get("answer", "")).strip(),
                "explanation": str(q.get("explanation", "")).strip(),
                "marks": 1,
                "lines_allocated": 2
            })
            total_calculated_marks += 1
            q_counter += 1

        # Section C: Short Answer Questions
        for q in selected_shorts:
            marks = int(q.get("marks", 3) or 3)
            cleaned_questions.append({
                "id": q_counter,
                "question_number": q_counter,
                "question_type": "short",
                "section": "Section C: Short Answer Questions",
                "question_text": str(q.get("question_text", "")).strip(),
                "options": None,
                "answer": str(q.get("answer", "")).strip(),
                "explanation": str(q.get("explanation", "")).strip(),
                "marks": marks,
                "lines_allocated": int(q.get("lines_allocated", 4) or 4)
            })
            total_calculated_marks += marks
            q_counter += 1

        # Section D: Long Answer Questions
        for q in selected_longs:
            marks = int(q.get("marks", 5) or 5)
            cleaned_questions.append({
                "id": q_counter,
                "question_number": q_counter,
                "question_type": "long",
                "section": "Section D: Long Answer & HOTS Questions",
                "question_text": str(q.get("question_text", "")).strip(),
                "options": None,
                "answer": str(q.get("answer", "")).strip(),
                "explanation": str(q.get("explanation", "")).strip(),
                "marks": marks,
                "lines_allocated": int(q.get("lines_allocated", 8) or 8)
            })
            total_calculated_marks += marks
            q_counter += 1

        assignment_id = f"asg-{int(time.time() * 1000) % 1000000:06d}"
        assignment_result = {
            "id": assignment_id,
            "title": assignment_title,
            "class_name": req.class_name,
            "subject": req.subject,
            "chapter_topic": req.chapter_topic,
            "difficulty": req.difficulty,
            "total_marks": total_calculated_marks,
            "due_date": req.due_date or time.strftime("%Y-%m-%d"),
            "school_name": req.school_name or "DEVGYA GLOBAL ACADEMY",
            "instructions": instructions,
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
