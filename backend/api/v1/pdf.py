import logging
from typing import Dict, Any
from fastapi import APIRouter, Response, HTTPException, Body
from schemas.question import GeneratedPaperResponse, QuestionItem
from services.pdf_service import pdf_generator_service

logger = logging.getLogger("pdf_router")

router = APIRouter(prefix="/pdf", tags=["PDF Engine"])

@router.post("/generate")
async def generate_pdf(payload: Dict[str, Any] = Body(...), include_answers: bool = False):
    try:
        title = str(payload.get("title") or "Question Paper")
        class_name = str(payload.get("class_name") or "Class 10")
        subject = str(payload.get("subject") or "General")
        chapter = str(payload.get("chapter") or "Syllabus")
        difficulty = str(payload.get("difficulty") or "medium")
        total_marks = int(payload.get("total_marks") or 40)
        time_allowed_mins = int(payload.get("time_allowed_mins") or 90)
        school_name = str(payload.get("school_name") or "DEVGYA GLOBAL ACADEMY")
        school_logo = payload.get("school_logo")
        
        raw_instructions = payload.get("instructions")
        instructions = [str(i) for i in raw_instructions] if isinstance(raw_instructions, list) and raw_instructions else [
            "All questions are compulsory.",
            "Read all questions carefully before attempting."
        ]

        raw_questions = payload.get("questions") if isinstance(payload.get("questions"), list) else []
        clean_questions = []
        for idx, q in enumerate(raw_questions):
            if not isinstance(q, dict):
                continue
            
            q_id = idx + 1
            q_num = int(q.get("question_number") or idx + 1)
            q_type = str(q.get("question_type") or "mcq").lower()
            if "short" in q_type:
                q_type = "short"
            elif "long" in q_type:
                q_type = "long"
            else:
                q_type = "mcq"

            q_text = str(q.get("question_text") or q.get("question") or f"Question #{q_num}")
            marks = int(q.get("marks") or (1 if q_type == "mcq" else 3 if q_type == "short" else 5))
            
            raw_opts = q.get("options")
            options = [str(o) for o in raw_opts] if isinstance(raw_opts, list) and len(raw_opts) >= 2 else None
            answer = str(q.get("answer") or "Refer to detailed solution.")
            explanation = str(q.get("explanation")) if q.get("explanation") else None

            clean_questions.append(QuestionItem(
                id=q_id,
                question_number=q_num,
                question_type=q_type,
                question_text=q_text,
                marks=marks,
                options=options,
                answer=answer,
                explanation=explanation
            ))

        clean_paper = GeneratedPaperResponse(
            title=title,
            class_name=class_name,
            subject=subject,
            chapter=chapter,
            difficulty=difficulty,
            total_marks=total_marks,
            time_allowed_mins=time_allowed_mins,
            instructions=instructions,
            questions=clean_questions,
            school_name=school_name,
            school_logo=school_logo
        )

        pdf_bytes = pdf_generator_service.generate_question_paper_pdf(clean_paper, include_answers=include_answers)
        filename = f"{subject}_{class_name}_{'AnswerKey' if include_answers else 'QuestionPaper'}.pdf".replace(" ", "_")
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
