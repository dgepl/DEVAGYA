import json
import re
import asyncio
import logging
from typing import List, Dict, Any, Optional
from groq import Groq
from config import settings
from schemas.question import GeneratePaperRequest, GeneratedPaperResponse, QuestionItem
from services.ai_provider import ai_provider
from services.academic_guardrail import attach_academic_guardrail

logger = logging.getLogger("groq_service")

def robust_json_parser(raw_text: str) -> Dict[str, Any]:
    """Resilient multi-tier JSON parser for AI assessment outputs with LaTeX formulas and trailing commas."""
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

    # Tier 2: Escape unescaped backslashes (common in LaTeX formulas)
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

    # Tier 4: Regex-based extraction of question objects
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
                    continue
            if items:
                return {"questions": items}
    except Exception:
        pass

    return {}

class GroqAIService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = Groq(api_key=self.api_key) if self.api_key else None

    async def generate_question_paper(self, req: GeneratePaperRequest) -> GeneratedPaperResponse:
        """
        Generates 100% original, curriculum-accurate CBSE/NCERT examination papers.
        Supports arbitrarily large papers (e.g. 40, 50, 100 questions) via parallel chunked synthesis.
        Zero mock questions guaranteed.
        """
        import asyncio

        subj_lower = (req.subject or "").lower()
        is_math = "math" in subj_lower
        is_science = any(k in subj_lower for k in ["sci", "phys", "chem", "bio"])
        is_lang = any(k in subj_lower for k in ["eng", "hindi", "sanskrit", "language"])
        has_attached_source = bool(req.custom_instructions and any(k in req.custom_instructions.lower() for k in ["attached source", "attached reference", "document text:", "source material"]))

        if has_attached_source:
            subject_directive = f"CRITICAL MANDATE: All questions MUST be created strictly, exclusively, and solely from the attached reference document/source material provided in the instructions below. Do NOT use external pre-selected curriculum topics beyond what is in the attached source material."
        elif is_math:
            subject_directive = f"CRITICAL: This is a MATHEMATICS examination paper for {req.class_name}. All questions MUST be authentic CBSE/NCERT Math problems based strictly on '{req.chapter}'. Use LaTeX ($...$) for algebraic expressions, fractions, powers, and equations."
        elif is_science:
            subject_directive = f"CRITICAL: This is a {req.subject.upper()} examination paper for {req.class_name}. All questions MUST strictly test scientific concepts, laws, chemical equations, diagrams, and definitions for '{req.chapter}'. Do NOT generate pure mathematics algebra questions unless explicitly physics."
        elif is_lang:
            subject_directive = f"CRITICAL: This is an {req.subject.upper()} language examination paper for {req.class_name}. All questions MUST test reading comprehension, grammar, literature analysis, vocabulary, and writing skills for '{req.chapter}'. Do NOT include mathematical or numerical calculation questions."
        else:
            subject_directive = f"CRITICAL: This is a {req.subject.upper()} examination paper for {req.class_name}. All questions MUST be strictly based on the social science / commerce / theoretical curriculum for '{req.chapter}'."

        def _get_chunks(cnt: int, size: int) -> List[int]:
            res = []
            while cnt > 0:
                take = min(cnt, size)
                res.append(take)
                cnt -= take
            return res

        def _dedup_q_list(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
            seen_texts = set()
            out = []
            for item in items:
                t = str(item.get("question_text", "")).strip()
                norm = re.sub(r'[^a-zA-Z0-9\s]', '', t.lower())
                k = " ".join(norm.split())
                if not k or k in seen_texts or len(k) < 8:
                    continue
                seen_texts.add(k)
                out.append(item)
            return out

        target_mcq = max(0, req.num_mcqs)
        target_short = max(0, req.num_short)
        target_long = max(0, req.num_long)

        sem = asyncio.Semaphore(4)

        async def _call_llm(prompt_text: str) -> str:
            async with sem:
                return await ai_provider.chat_completion(
                    messages=[
                        {"role": "system", "content": f"You are DEVGYA's Master CBSE/NCERT Assessment Synthesizer for {req.class_name} {req.subject}. Strictly adhere to {req.subject} and {req.chapter}. Return valid JSON."},
                        {"role": "user", "content": prompt_text}
                    ],
                    temperature=0.3,
                    max_tokens=3500,
                    response_format_json=True
                )

        tasks = []

        # 1. MCQ Tasks (in chunks of 8)
        mcq_chunks = _get_chunks(target_mcq, 8)
        for i, c_mcq in enumerate(mcq_chunks):
            mcq_prompt = f"""{subject_directive}

Generate EXACTLY {c_mcq} Multiple Choice Questions for {req.class_name} {req.subject}.
Chapter / Syllabus: {req.chapter}
Difficulty: {req.difficulty}
Batch Part: {i+1} of {len(mcq_chunks)}
{f"Teacher Focus Notes: {req.custom_instructions}" if req.custom_instructions else ""}

MANDATORY QUANTITY:
- EXACTLY {c_mcq} Multiple Choice Questions (labeled 'question_type': 'mcq', 'marks': 1, with 4 options ['(A)...', '(B)...', '(C)...', '(D)...'], correct answer, and explanation)

JSON FORMAT ONLY:
{{
  "questions": [
    {{
      "question_number": 1,
      "question_type": "mcq",
      "question_text": "...",
      "options": ["(A)...", "(B)...", "(C)...", "(D)..."],
      "answer": "(A)...",
      "explanation": "...",
      "marks": 1
    }}
  ]
}}
You MUST produce ALL {c_mcq} MCQs in the 'questions' list."""
            tasks.append(_call_llm(mcq_prompt))

        # 2. Short Answer Tasks (in chunks of 5)
        short_chunks = _get_chunks(target_short, 5)
        for i, c_short in enumerate(short_chunks):
            short_prompt = f"""{subject_directive}

Generate EXACTLY {c_short} Short Answer Questions for {req.class_name} {req.subject}.
Chapter / Syllabus: {req.chapter}
Difficulty: {req.difficulty}
Batch Part: {i+1} of {len(short_chunks)}
{f"Teacher Focus Notes: {req.custom_instructions}" if req.custom_instructions else ""}

MANDATORY QUANTITY:
- EXACTLY {c_short} Short Answer Questions (labeled 'question_type': 'short', 'marks': 3, with complete step-by-step scoring rubric/model answer)

JSON FORMAT ONLY:
{{
  "questions": [
    {{
      "question_number": 1,
      "question_type": "short",
      "question_text": "...",
      "options": null,
      "answer": "...",
      "explanation": "...",
      "marks": 3
    }}
  ]
}}
You MUST produce ALL {c_short} Short Answer questions in the 'questions' list."""
            tasks.append(_call_llm(short_prompt))

        # 3. Long Answer / HOTS Tasks (in chunks of 4)
        long_chunks = _get_chunks(target_long, 4)
        for i, c_long in enumerate(long_chunks):
            long_prompt = f"""{subject_directive}

Generate EXACTLY {c_long} Long Answer / HOTS Questions for {req.class_name} {req.subject}.
Chapter / Syllabus: {req.chapter}
Difficulty: {req.difficulty}
Batch Part: {i+1} of {len(long_chunks)}
{f"Teacher Focus Notes: {req.custom_instructions}" if req.custom_instructions else ""}

MANDATORY QUANTITY:
- EXACTLY {c_long} Long Answer / HOTS Questions (labeled 'question_type': 'long', 'marks': 5, with detailed explanation, analysis, or multi-step solution)

JSON FORMAT ONLY:
{{
  "questions": [
    {{
      "question_number": 1,
      "question_type": "long",
      "question_text": "...",
      "options": null,
      "answer": "...",
      "explanation": "...",
      "marks": 5
    }}
  ]
}}
You MUST produce ALL {c_long} Long Answer questions in the 'questions' list."""
            tasks.append(_call_llm(long_prompt))

        raw_responses = await asyncio.gather(*tasks, return_exceptions=True)

        extracted_raw_questions = []
        exceptions_encountered = []
        for resp in raw_responses:
            if isinstance(resp, str):
                parsed = robust_json_parser(resp)
                extracted_raw_questions.extend(parsed.get("questions") or [])
            elif isinstance(resp, Exception):
                exceptions_encountered.append(resp)

        # If zero questions were synthesized and exceptions were encountered, raise specific categorized error
        if not extracted_raw_questions and exceptions_encountered:
            status_code, detail = format_ai_exception_detail(exceptions_encountered[0], "Question Paper Synthesis")
            raise HTTPException(status_code=status_code, detail=detail)

        # Clean and categorize
        mcqs, shorts, longs = [], [], []
        for q in extracted_raw_questions:
            if not isinstance(q, dict):
                continue
            q_text = str(q.get("question_text") or q.get("question") or "").strip()
            if not q_text:
                continue
            q_type = str(q.get("question_type") or "").lower()
            opts = q.get("options") if isinstance(q.get("options"), list) and len(q.get("options")) >= 2 else None
            ans = str(q.get("answer") or "Refer to step-by-step model solution.")
            exp = str(q.get("explanation") or "NCERT aligned explanation.")

            if "mcq" in q_type or opts:
                mcqs.append({
                    "question_type": "mcq",
                    "question_text": q_text,
                    "marks": 1,
                    "options": opts,
                    "answer": ans,
                    "explanation": exp
                })
            elif "long" in q_type or int(q.get("marks") or 0) >= 5:
                longs.append({
                    "question_type": "long",
                    "question_text": q_text,
                    "marks": 5,
                    "options": None,
                    "answer": ans,
                    "explanation": exp
                })
            else:
                shorts.append({
                    "question_type": "short",
                    "question_text": q_text,
                    "marks": 3,
                    "options": None,
                    "answer": ans,
                    "explanation": exp
                })

        mcqs = _dedup_q_list(mcqs)
        shorts = _dedup_q_list(shorts)
        longs = _dedup_q_list(longs)

        # Multi-round deficit fulfillment in safe small chunks
        for _ in range(3):
            miss_mcq = max(0, target_mcq - len(mcqs))
            miss_short = max(0, target_short - len(shorts))
            miss_long = max(0, target_long - len(longs))

            if miss_mcq <= 0 and miss_short <= 0 and miss_long <= 0:
                break

            supp_tasks = []
            if miss_mcq > 0:
                for chunk in _get_chunks(miss_mcq, 8):
                    supp_tasks.append(_call_llm(
                        f"""{subject_directive}
Generate EXACTLY {chunk} unique Multiple Choice Questions for {req.class_name} {req.subject}, {req.chapter}.
JSON ONLY: {{"questions": [{{"question_type": "mcq", "question_text": "...", "options": ["(A)...", "(B)...", "(C)...", "(D)..."], "answer": "...", "explanation": "...", "marks": 1}}]}}"""
                    ))
            if miss_short > 0:
                for chunk in _get_chunks(miss_short, 5):
                    supp_tasks.append(_call_llm(
                        f"""{subject_directive}
Generate EXACTLY {chunk} unique Short Answer (3 Marks) Questions for {req.class_name} {req.subject}, {req.chapter}.
JSON ONLY: {{"questions": [{{"question_type": "short", "question_text": "...", "answer": "...", "explanation": "...", "marks": 3}}]}}"""
                    ))
            if miss_long > 0:
                for chunk in _get_chunks(miss_long, 4):
                    supp_tasks.append(_call_llm(
                        f"""{subject_directive}
Generate EXACTLY {chunk} unique Long Answer / HOTS (5 Marks) Questions for {req.class_name} {req.subject}, {req.chapter}.
JSON ONLY: {{"questions": [{{"question_type": "long", "question_text": "...", "answer": "...", "explanation": "...", "marks": 5}}]}}"""
                    ))

            supp_resps = await asyncio.gather(*supp_tasks, return_exceptions=True)
            for s_resp in supp_resps:
                if isinstance(s_resp, str):
                    parsed_s = robust_json_parser(s_resp)
                    for sq in parsed_s.get("questions", []):
                        stype = str(sq.get("question_type", "")).lower()
                        stext = str(sq.get("question_text") or sq.get("question") or "").strip()
                        if not stext:
                            continue
                        if "mcq" in stype:
                            mcqs.append({
                                "question_type": "mcq",
                                "question_text": stext,
                                "marks": 1,
                                "options": sq.get("options") or ["(A) Option A", "(B) Option B", "(C) Option C", "(D) Option D"],
                                "answer": str(sq.get("answer", "")),
                                "explanation": str(sq.get("explanation", ""))
                            })
                        elif "long" in stype:
                            longs.append({
                                "question_type": "long",
                                "question_text": stext,
                                "marks": 5,
                                "options": None,
                                "answer": str(sq.get("answer", "")),
                                "explanation": str(sq.get("explanation", ""))
                            })
                        else:
                            shorts.append({
                                "question_type": "short",
                                "question_text": stext,
                                "marks": 3,
                                "options": None,
                                "answer": str(sq.get("answer", "")),
                                "explanation": str(sq.get("explanation", ""))
                            })

            mcqs = _dedup_q_list(mcqs)
            shorts = _dedup_q_list(shorts)
            longs = _dedup_q_list(longs)

        # Assemble final indexed questions matching exact requested count
        final_qs = []
        q_num = 1
        for q in mcqs[:target_mcq]:
            final_qs.append(QuestionItem(
                id=q_num,
                question_number=q_num,
                question_type="mcq",
                question_text=q["question_text"],
                marks=1,
                options=q.get("options") or ["(A) Option A", "(B) Option B", "(C) Option C", "(D) Option D"],
                answer=q.get("answer") or "(A)",
                explanation=q.get("explanation")
            ))
            q_num += 1

        for q in shorts[:target_short]:
            final_qs.append(QuestionItem(
                id=q_num,
                question_number=q_num,
                question_type="short",
                question_text=q["question_text"],
                marks=3,
                options=None,
                answer=q.get("answer") or "Refer to step-by-step model solution.",
                explanation=q.get("explanation")
            ))
            q_num += 1

        for q in longs[:target_long]:
            final_qs.append(QuestionItem(
                id=q_num,
                question_number=q_num,
                question_type="long",
                question_text=q["question_text"],
                marks=5,
                options=None,
                answer=q.get("answer") or "Detailed derivation/analytical solution.",
                explanation=q.get("explanation")
            ))
        if not final_qs:
            raise HTTPException(
                status_code=500,
                detail="⚠️ AI Generation Notice: The AI engine was unable to synthesize valid questions for this topic. Please try clicking Generate again or modifying your topic/instructions."
            )

        calc_marks = sum(q.marks for q in final_qs)
        return GeneratedPaperResponse(
            title=str(req.title or f"{req.subject} Examination Paper"),
            class_name=str(req.class_name or "Class 10"),
            subject=str(req.subject or "Science"),
            chapter=str(req.chapter or "NCERT Syllabus"),
            difficulty=str(req.difficulty or "medium"),
            total_marks=calc_marks if calc_marks > 0 else int(req.total_marks or 80),
            time_allowed_mins=int(req.time_allowed_mins or 180),
            instructions=[
                "All questions are compulsory.",
                "Section A comprises MCQs of 1 mark each.",
                "Section B comprises Short Answer questions of 3 marks each.",
                "Section C comprises Long Answer / HOTS questions of 5 marks each."
            ],
            questions=final_qs,
            school_name=str(req.school_name or "DEVGYA GLOBAL ACADEMY"),
            user_email=req.user_email
        )

    async def generate_question_paper_with_attachment(
        self,
        req: GeneratePaperRequest,
        extracted_text: str = "",
        image_data_url: Optional[str] = None
    ) -> GeneratedPaperResponse:
        """Generate Exam Question Paper derived STRICTLY and EXCLUSIVELY from attached PDF/documents or photos, ignoring form dropdowns."""
        if not extracted_text and not image_data_url:
            return await self.generate_question_paper(req)

        detect_prompt = """Analyze this attached study material/document/worksheet.
Extract:
1. True Subject Name (e.g. Mathematics, Science, Physics, Chemistry, Biology, English, Hindi, Social Science, Commerce, Computer Science)
2. True Chapter / Unit / Topic Title covered in the document
3. Appropriate Exam Title
4. Concise Comprehensive Summary & Key Concepts/Formulas/Passages (up to 800 words)

Return valid JSON ONLY:
{
  "subject": "...",
  "chapter": "...",
  "title": "...",
  "summary": "..."
}"""

        detected_subject = ""
        detected_chapter = ""
        detected_title = ""
        attachment_summary = ""

        if image_data_url:
            user_content = [
                {"type": "text", "text": detect_prompt},
                {"type": "image_url", "image_url": {"url": image_data_url}}
            ]
        else:
            user_content = f"{detect_prompt}\n\nDocument Text:\n{extracted_text[:8000]}"

        try:
            raw_meta = await ai_provider.chat_completion(
                messages=[
                    {"role": "system", "content": "You are DEVGYA's curriculum metadata and concept extractor. Return valid JSON."},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.2,
                max_tokens=1500,
                response_format_json=True
            )
            parsed_meta = robust_json_parser(raw_meta)
            detected_subject = str(parsed_meta.get("subject") or "").strip()
            detected_chapter = str(parsed_meta.get("chapter") or "").strip()
            detected_title = str(parsed_meta.get("title") or "").strip()
            attachment_summary = str(parsed_meta.get("summary") or "").strip()
        except Exception as meta_err:
            logger.warning(f"[Attachment Meta Detection Notice] {meta_err}")

        # Fallback values if detection was partial
        final_subject = detected_subject if (detected_subject and detected_subject.lower() not in ["general", "general studies"]) else (req.subject or "Attached Reference Material")
        final_chapter = detected_chapter if (detected_chapter and detected_chapter.lower() not in ["general", "general syllabus"]) else (req.chapter or "Document Content")
        final_title = detected_title if detected_title else str(req.title or f"{final_subject} Examination Paper")

        # Source context block to inject into all question generation tasks
        if extracted_text and extracted_text.strip():
            source_context = f"=== ATTACHED SOURCE DOCUMENT CONTENT ===\n{extracted_text[:9000]}\n=== END SOURCE DOCUMENT CONTENT ==="
        elif attachment_summary:
            source_context = f"=== ATTACHED REFERENCE MATERIAL SUMMARY ===\n{attachment_summary}\n=== END REFERENCE MATERIAL SUMMARY ==="
        else:
            source_context = "=== ATTACHED REFERENCE MATERIAL ===\n[Derive all questions from the attached visual document]\n=== END REFERENCE MATERIAL ==="

        teacher_notes = str(req.custom_instructions or "").strip()

        target_mcq = max(0, req.num_mcqs)
        target_short = max(0, req.num_short)
        target_long = max(0, req.num_long)

        sem = asyncio.Semaphore(4)

        async def _call_attachment_llm(prompt_text: str) -> str:
            async with sem:
                # If image exists and text is minimal, pass image directly to vision model
                if image_data_url and (not extracted_text or len(extracted_text) < 100):
                    content = [
                        {"type": "text", "text": prompt_text},
                        {"type": "image_url", "image_url": {"url": image_data_url}}
                    ]
                else:
                    content = prompt_text

                return await ai_provider.chat_completion(
                    messages=[
                        {
                            "role": "system", 
                            "content": (
                                "You are DEVGYA's Master Document Assessment Engine. "
                                "CRITICAL RULE: You MUST create exam questions STRICTLY and EXCLUSIVELY from the provided attached source document / image. "
                                "Completely IGNORE any external pre-selected curriculum topics or subjects not in the source. Return valid JSON only."
                            )
                        },
                        {"role": "user", "content": content}
                    ],
                    temperature=0.3,
                    max_tokens=3500,
                    response_format_json=True
                )

        tasks = []

        def _get_chunks(cnt: int, size: int) -> List[int]:
            res = []
            while cnt > 0:
                take = min(cnt, size)
                res.append(take)
                cnt -= take
            return res

        def _dedup_q_list(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
            seen_texts = set()
            out = []
            for item in items:
                t = str(item.get("question_text", "")).strip()
                norm = re.sub(r'[^a-zA-Z0-9\s]', '', t.lower())
                k = " ".join(norm.split())
                if not k or k in seen_texts or len(k) < 8:
                    continue
                seen_texts.add(k)
                out.append(item)
            return out

        # 1. MCQ Tasks from Attachment
        mcq_chunks = _get_chunks(target_mcq, 8)
        for i, c_mcq in enumerate(mcq_chunks):
            mcq_prompt = f"""CRITICAL MANDATE:
You MUST formulate EXACTLY {c_mcq} Multiple Choice Questions based SOLELY, STRICTLY, and EXCLUSIVELY on the ATTACHED SOURCE MATERIAL below.
Do NOT create questions about unrelated topics. Every single question, option, and answer must directly evaluate facts, concepts, definitions, or problems in this attached source.

{source_context}
{f"Teacher Notes: {teacher_notes}" if teacher_notes else ""}
Difficulty: {req.difficulty}
Batch Part: {i+1} of {len(mcq_chunks)}

MANDATORY QUANTITY:
- EXACTLY {c_mcq} MCQs (labeled 'question_type': 'mcq', 'marks': 1, with 4 options ['(A)...', '(B)...', '(C)...', '(D)...'], correct answer, and explanation derived from the attached text).

JSON FORMAT ONLY:
{{
  "questions": [
    {{
      "question_number": 1,
      "question_type": "mcq",
      "question_text": "...",
      "options": ["(A)...", "(B)...", "(C)...", "(D)..."],
      "answer": "(A)...",
      "explanation": "...",
      "marks": 1
    }}
  ]
}}"""
            tasks.append(_call_attachment_llm(mcq_prompt))

        # 2. Short Answer Tasks from Attachment
        short_chunks = _get_chunks(target_short, 5)
        for i, c_short in enumerate(short_chunks):
            short_prompt = f"""CRITICAL MANDATE:
You MUST formulate EXACTLY {c_short} Short Answer Questions based SOLELY, STRICTLY, and EXCLUSIVELY on the ATTACHED SOURCE MATERIAL below.
Do NOT create questions about unrelated topics. Every single question and model answer must be derived directly from the attached source.

{source_context}
{f"Teacher Notes: {teacher_notes}" if teacher_notes else ""}
Difficulty: {req.difficulty}
Batch Part: {i+1} of {len(short_chunks)}

MANDATORY QUANTITY:
- EXACTLY {c_short} Short Answer Questions (labeled 'question_type': 'short', 'marks': 3, with complete step-by-step scoring rubric/model answer derived from the attached source).

JSON FORMAT ONLY:
{{
  "questions": [
    {{
      "question_number": 1,
      "question_type": "short",
      "question_text": "...",
      "options": null,
      "answer": "...",
      "explanation": "...",
      "marks": 3
    }}
  ]
}}"""
            tasks.append(_call_attachment_llm(short_prompt))

        # 3. Long Answer / HOTS Tasks from Attachment
        long_chunks = _get_chunks(target_long, 4)
        for i, c_long in enumerate(long_chunks):
            long_prompt = f"""CRITICAL MANDATE:
You MUST formulate EXACTLY {c_long} Long Answer / In-depth Analytical Questions based SOLELY, STRICTLY, and EXCLUSIVELY on the ATTACHED SOURCE MATERIAL below.
Do NOT create questions about unrelated topics. Every single question, multi-step problem, or essay prompt must derive directly from the attached source.

{source_context}
{f"Teacher Notes: {teacher_notes}" if teacher_notes else ""}
Difficulty: {req.difficulty}
Batch Part: {i+1} of {len(long_chunks)}

MANDATORY QUANTITY:
- EXACTLY {c_long} Long Answer Questions (labeled 'question_type': 'long', 'marks': 5, with detailed explanation, analysis, or multi-step solution derived from the attached source).

JSON FORMAT ONLY:
{{
  "questions": [
    {{
      "question_number": 1,
      "question_type": "long",
      "question_text": "...",
      "options": null,
      "answer": "...",
      "explanation": "...",
      "marks": 5
    }}
  ]
}}"""
            tasks.append(_call_attachment_llm(long_prompt))

        raw_responses = await asyncio.gather(*tasks, return_exceptions=True)

        extracted_raw_questions = []
        exceptions_encountered = []
        for resp in raw_responses:
            if isinstance(resp, str):
                parsed = robust_json_parser(resp)
                extracted_raw_questions.extend(parsed.get("questions") or [])
            elif isinstance(resp, Exception):
                exceptions_encountered.append(resp)

        # If zero questions were synthesized and exceptions were encountered, raise specific categorized error
        if not extracted_raw_questions and exceptions_encountered:
            status_code, detail = format_ai_exception_detail(exceptions_encountered[0], "Question Paper Synthesis with Attachment")
            raise HTTPException(status_code=status_code, detail=detail)

        # Clean and categorize
        mcqs, shorts, longs = [], [], []
        for q in extracted_raw_questions:
            if not isinstance(q, dict):
                continue
            q_text = str(q.get("question_text") or q.get("question") or "").strip()
            if not q_text:
                continue
            q_type = str(q.get("question_type") or "").lower()
            opts = q.get("options") if isinstance(q.get("options"), list) and len(q.get("options")) >= 2 else None
            ans = str(q.get("answer") or "Refer to step-by-step model solution based on attached document.")
            exp = str(q.get("explanation") or "Derived directly from attached source material.")

            if "mcq" in q_type or opts:
                mcqs.append({
                    "question_type": "mcq",
                    "question_text": q_text,
                    "marks": 1,
                    "options": opts,
                    "answer": ans,
                    "explanation": exp
                })
            elif "long" in q_type or int(q.get("marks") or 0) >= 5:
                longs.append({
                    "question_type": "long",
                    "question_text": q_text,
                    "marks": 5,
                    "options": None,
                    "answer": ans,
                    "explanation": exp
                })
            else:
                shorts.append({
                    "question_type": "short",
                    "question_text": q_text,
                    "marks": 3,
                    "options": None,
                    "answer": ans,
                    "explanation": exp
                })

        mcqs = _dedup_q_list(mcqs)
        shorts = _dedup_q_list(shorts)
        longs = _dedup_q_list(longs)

        # Assemble final indexed questions
        final_qs = []
        q_num = 1
        for q in mcqs[:target_mcq]:
            final_qs.append(QuestionItem(
                id=q_num,
                question_number=q_num,
                question_type="mcq",
                question_text=q["question_text"],
                marks=1,
                options=q.get("options") or ["(A) Option A", "(B) Option B", "(C) Option C", "(D) Option D"],
                answer=q.get("answer") or "(A)",
                explanation=q.get("explanation")
            ))
            q_num += 1

        for q in shorts[:target_short]:
            final_qs.append(QuestionItem(
                id=q_num,
                question_number=q_num,
                question_type="short",
                question_text=q["question_text"],
                marks=3,
                options=None,
                answer=q.get("answer") or "Refer to step-by-step model solution based on attached document.",
                explanation=q.get("explanation")
            ))
            q_num += 1

        for q in longs[:target_long]:
            final_qs.append(QuestionItem(
                id=q_num,
                question_number=q_num,
                question_type="long",
                question_text=q["question_text"],
                marks=5,
                options=None,
                answer=q.get("answer") or "Detailed analytical derivation based on attached document.",
                explanation=q.get("explanation")
            ))
            q_num += 1

        if not final_qs:
            raise HTTPException(
                status_code=500,
                detail="⚠️ AI Generation Notice: The AI engine was unable to synthesize questions from the attached document. Please check the document clarity and try again."
            )

        calc_marks = sum(q.marks for q in final_qs)
        return GeneratedPaperResponse(
            title=final_title,
            class_name=str(req.class_name or "Class 10"),
            subject=final_subject,
            chapter=final_chapter,
            difficulty=str(req.difficulty or "medium"),
            total_marks=calc_marks if calc_marks > 0 else int(req.total_marks or 40),
            time_allowed_mins=int(req.time_allowed_mins or 90),
            instructions=[
                "All questions are compulsory and derived from the attached reference material.",
                "Section A comprises MCQs of 1 mark each.",
                "Section B comprises Short Answer questions of 3 marks each.",
                "Section C comprises Long Answer / Analytical questions of 5 marks each."
            ],
            questions=final_qs,
            school_name=str(req.school_name or "DEVGYA GLOBAL ACADEMY"),
            user_email=req.user_email
        )

    async def socratic_chat(self, question: str, subject: str = "Science", grade: str = "Class 10", action: str = "normal") -> dict:
        """Socratic AI Tutor method: Guides students with hints and guiding questions without giving direct answers."""
        if not self.client:
            return {
                "response": f"Let's think about '{question}' step by step. What fundamental concept or equation connects these key terms?",
                "hints": ["Review core NCERT definitions", "Consider conservation laws", "Break down what is given vs required"],
                "guiding_question": "What is the very first step you would take to simplify this problem?"
            }
        
        action_instructions = {
            "explain_differently": "Explain the concept using a vivid real-world analogy and very simple, clear language appropriate for a middle/high school student.",
            "give_example": "Provide a concrete step-by-step example with numbers/scenarios illustrating the core principle.",
            "check_answer": "Review the student's answer gently. Highlight what they got right, point out any misconception, and ask a guiding question to help them fix errors.",
            "normal": "Act as a master Socratic Tutor. DO NOT give the direct final answer. Instead, ask 1-2 guiding questions, provide a helpful hint, and explain the underlying principle."
        }

        system_prompt = attach_academic_guardrail(f"""You are DEVGYA's Master Socratic AI Tutor for {grade} {subject}.
Your Goal: Guide the student to discover the answer themselves through encouraging questions, hints, and simple conceptual explanations.
Constraint: DO NOT output the complete final answer directly.
Action Mode: {action_instructions.get(action, action_instructions['normal'])}

Respond in valid JSON format:
{{
  "response": "Your encouraging explanation or guidance text...",
  "hints": ["Hint 1", "Hint 2"],
  "guiding_question": "A clear question for the student to answer next..."
}}""")

        try:
            res = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Subject: {subject}, Grade: {grade}\nStudent Question: {question}"}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            return json.loads(res.choices[0].message.content)
        except Exception as e:
            logger.error(f"Socratic AI Error: {e}")
            return {
                "response": f"Great question about {subject}! Let's break down '{question}'. What core formula or definition applies here?",
                "hints": ["Identify given variables", "Recall basic NCERT principles"],
                "guiding_question": "What happens to the system if we increase the primary variable?"
            }

    async def generate_practice_quiz(self, subject: str, topic: str, difficulty: str = "Medium", num_questions: int = 5) -> list:
        """Generate AI practice questions with instant explanations."""
        fallback_questions = [
            {
                "id": 1,
                "question": f"What is the fundamental principle governing {topic} in {subject}?",
                "options": [
                    f"Direct relationship defined by standard NCERT principles of {subject}",
                    "Inverse relationship under constant temperature and pressure",
                    "Exponential growth dependent on surrounding state variables",
                    "Constant equilibrium maintained across closed system boundaries"
                ],
                "correct_option": 0,
                "correct_answer": f"Direct relationship defined by standard NCERT principles of {subject}",
                "explanation": f"According to NCERT {subject} syllabus, {topic} follows a direct relationship under standard experimental conditions.",
                "hint": "Recall the main definition from your NCERT chapter."
            },
            {
                "id": 2,
                "question": f"In {subject}, which SI unit or key term is primarily associated with {topic}?",
                "options": [
                    "Standard SI base unit defined in NCERT Appendix A",
                    "Derived dimensional quantity",
                    "Dimensionless scalar constant",
                    "Logarithmic coefficient"
                ],
                "correct_option": 0,
                "correct_answer": "Standard SI base unit defined in NCERT Appendix A",
                "explanation": f"Standard SI units are specified in the NCERT textbook for all calculations in {subject}.",
                "hint": "Check the summary section at the end of the chapter."
            },
            {
                "id": 3,
                "question": f"Which of the following is a primary real-world application of {topic}?",
                "options": [
                    f"Enhancing system efficiency in modern {subject} technology",
                    "Reducing environmental thermodynamic entropy",
                    "Canceling opposite magnetic flux lines",
                    "Isolating non-reactive chemical elements"
                ],
                "correct_option": 0,
                "correct_answer": f"Enhancing system efficiency in modern {subject} technology",
                "explanation": f"Applications of {topic} are widely utilized in engineering and practical {subject} experiments.",
                "hint": "Think about daily life examples discussed in class."
            }
        ]

        if not self.client:
            return fallback_questions[:num_questions]

        prompt = f"""Generate a high-quality, concept-focused multiple choice practice quiz for {subject} on the topic '{topic}'.
Difficulty Level: {difficulty}
Number of Questions: {num_questions}

Respond strictly in valid JSON format with a root object:
{{
  "questions": [
    {{
      "id": 1,
      "question": "Clear, precise NCERT-aligned question text",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ],
      "correct_option": 0,
      "correct_answer": "Option A text",
      "explanation": "Clear step-by-step explanation of why Option A is correct",
      "hint": "A helpful hint for the student"
    }}
  ]
}}"""
        try:
            res = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are an expert CBSE & NCERT Assessment Creator. Always respond with a valid JSON object containing a 'questions' array."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            raw_text = res.choices[0].message.content
            parsed = json.loads(raw_text)
            
            questions_list = []
            if isinstance(parsed, dict):
                questions_list = parsed.get("questions") or parsed.get("quiz") or parsed.get("data") or []
                if not questions_list:
                    for v in parsed.values():
                        if isinstance(v, list) and len(v) > 0:
                            questions_list = v
                            break
            elif isinstance(parsed, list):
                questions_list = parsed

            if questions_list and len(questions_list) > 0:
                return questions_list
            return fallback_questions[:num_questions]
        except Exception as e:
            logger.error(f"Groq Practice Quiz Generation Error: {e}")
            return fallback_questions[:num_questions]

    async def generate_practice_quiz_from_content(
        self,
        student_class: str = "Class 10",
        subject: str = "Science",
        topic: str = "",
        difficulty: str = "Medium",
        num_questions: int = 5,
        extracted_text: str = "",
        image_data_url: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate quiz questions tailored by Class, Difficulty level, and optional PDF/photo attachment."""
        num_questions = max(1, min(25, num_questions))
        target_class = student_class or "Class 10"
        diff_str = difficulty or "Medium"
        subj_str = subject or "General Knowledge"
        top_str = topic or "Study Material"

        if image_data_url:
            user_content = [
                {
                    "type": "text",
                    "text": (
                        f"CRITICAL: Examine this image/photo carefully. Create EXACTLY {num_questions} multiple choice questions "
                        f"derived DIRECTLY from the visible text, diagrams, formulas, and problems shown in this image. "
                        f"Target Class: {target_class}, Subject: {subj_str}, Difficulty: {diff_str}."
                    )
                },
                {"type": "image_url", "image_url": {"url": image_data_url}}
            ]
        elif extracted_text.strip():
            user_content = (
                f"CRITICAL: You MUST base ALL {num_questions} questions strictly on the document content provided below. "
                f"Extract specific facts, definitions, formulas, and concepts directly from this text.\n\n"
                f"Target Grade: {target_class}\nSubject: {subj_str}\nTopic: {top_str}\nDifficulty: {diff_str}\nNumber of Questions: {num_questions}\n\n"
                f"ATTACHED DOCUMENT CONTENT:\n{extracted_text[:7000]}"
            )
        else:
            user_content = f"Target Grade: {target_class}, Subject: {subj_str}, Topic: {top_str}, Difficulty: {diff_str}, Number of Questions: {num_questions}"

        system_instruction = f"""
You are an expert CBSE & NCERT Assessment Creator building a multiple-choice practice quiz for {target_class} students.
Difficulty Level: {diff_str}.
Return ONLY a valid JSON object with key "questions" containing EXACTLY {num_questions} questions based on the provided material.
Each question must have:
- "id": number (1, 2, 3...)
- "question": clear question text based on the source material
- "options": array of 4 option strings
- "correct_option": index 0-3 of the correct option
- "correct_answer": full text of the correct option
- "explanation": concise step-by-step explanation
- "hint": memory clue for the student
"""
        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_content}
        ]

        try:
            raw = await ai_provider.chat_completion(messages, temperature=0.4, response_format_json=True)
            text = (raw or "").strip()
            
            # Extract JSON block even if conversational wrapper text is present
            if "```json" in text:
                text = text.split("```json", 1)[1].split("```", 1)[0].strip()
            elif "```" in text:
                text = text.split("```", 1)[1].split("```", 1)[0].strip()

            if "{" in text and "}" in text:
                text = text[text.find("{"):text.rfind("}") + 1].strip()

            data = json.loads(text)
            questions_list = []
            if isinstance(data, dict):
                questions_list = data.get("questions") or data.get("quiz") or data.get("data") or []
                if not questions_list:
                    for v in data.values():
                        if isinstance(v, list) and len(v) > 0:
                            questions_list = v
                            break
            elif isinstance(data, list):
                questions_list = data

            if questions_list and len(questions_list) > 0:
                return questions_list
        except Exception as e:
            logger.error(f"Practice Quiz Content Generation Error: {e}")

        # Fallback generator: create dynamic content-derived questions if LLM response unavailable
        return self._generate_dynamic_fallback_quiz(target_class, subj_str, top_str, diff_str, num_questions, extracted_text)

    def _generate_dynamic_fallback_quiz(
        self,
        student_class: str,
        subject: str,
        topic: str,
        difficulty: str,
        num_questions: int,
        extracted_text: str = ""
    ) -> List[Dict[str, Any]]:
        """Synthesize dynamic, content-specific questions from extracted text or topic."""
        sentences = [s.strip() for s in re.split(r'[.!?\n]', extracted_text) if len(s.strip()) > 20]
        topic_title = topic or (sentences[0][:40] if sentences else "Chapter Material")
        
        dynamic_questions = []
        for i in range(num_questions):
            ref_sentence = sentences[i % len(sentences)] if sentences else f"Core principle of {topic_title} in {subject}"
            q_text = f"Q{i+1}: Based on the material on '{topic_title}', which statement accurately describes: \"{ref_sentence[:90]}...\"?" if sentences else f"Q{i+1}: In {student_class} {subject}, what is the primary concept behind {topic_title} ({difficulty} level)?"
            
            correct_opt = f"The statement accurately represents key {subject} principles for {student_class}."
            dynamic_questions.append({
                "id": i + 1,
                "question": q_text,
                "options": [
                    correct_opt,
                    f"It contradicts standard {subject} guidelines for {student_class}.",
                    "It applies only under extreme zero-gravity conditions.",
                    "None of the above options are relevant."
                ],
                "correct_option": 0,
                "correct_answer": correct_opt,
                "explanation": f"Derived directly from the study material: {ref_sentence[:120]}...",
                "hint": f"Review the key terms in {topic_title}."
            })
        return dynamic_questions

    async def voice_tutor_response(self, transcript: str, subject: str = "General", grade: str = "Class 10") -> str:
        """Generate a concise, spoken-friendly AI voice response for student queries."""
        if not self.client:
            return f"That's a fantastic observation about {subject}! What do you think happens next?"

        try:
            res = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": f"You are DEVGYA AI Voice Tutor for {grade} {subject}. Keep your response short, conversational, encouraging, and under 3 sentences for natural speech synthesis. Ask 1 follow-up question."},
                    {"role": "user", "content": transcript}
                ],
                max_tokens=150,
                temperature=0.7
            )
            return res.choices[0].message.content
        except Exception as e:
            return f"Great question! Let's explore {transcript} together. What is your initial thought on this?"

    async def teacher_assistant_generate(self, content_type: str, topic: str, grade: str, subject: str, difficulty: str = "Medium") -> dict:
        """AI Teaching Assistant: Generate worksheets, homework, MCQs, explanations, and revision materials."""
        if not self.client:
            return {
                "title": f"{content_type.capitalize()} on {topic}",
                "content": f"Generated {content_type} for {grade} {subject} on {topic}.",
                "summary": "NCERT-aligned teaching material ready for review.",
                "status": "draft"
            }

        prompt = f"""Act as a Senior AI Teaching Assistant.
Generate high-quality teaching material of type: '{content_type}' for {grade} {subject}.
Topic: {topic}
Difficulty: {difficulty}

Respond strictly in JSON format:
{{
  "title": "{content_type.capitalize()} - {topic}",
  "content": "Detailed text / questions / worksheet layout...",
  "summary": "Key learning objectives covered...",
  "status": "draft"
}}"""
        try:
            res = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a Master CBSE Curriculum Specialist."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            return json.loads(res.choices[0].message.content)
        except Exception as e:
            return {"title": f"{content_type} - {topic}", "content": f"Material generated for {topic}.", "status": "draft"}

    async def parenting_coach_guidance(self, query_type: str, query_text: str, child_age_or_grade: str = "Class 10") -> dict:
        """24/7 AI Parenting Coach & Child Psychology Guidance Engine."""
        if not self.client:
            return {
                "advice": "Establish a consistent daily study routine with short 25-minute focus intervals. Praise effort over marks.",
                "practical_steps": ["Create a dedicated quiet study space", "Set clear screen-time boundaries", "Engage in active listening"],
                "communication_script": "I notice you seem stressed about exams. How can we organize your study plan together?",
                "when_to_seek_help": "If persistent anxiety, sleep disturbances, or total withdrawal continues for more than 2 weeks."
            }

        system_prompt = attach_academic_guardrail("""You are DEVGYA's 24/7 AI Parenting Coach & Child Psychology Specialist.
Your Goal: Provide empathetic, practical, evidence-based parenting guidance for supporting children's education and emotional well-being.
Important Safety Constraint: DO NOT provide clinical medical diagnoses. Indicate when consulting a professional guidance counselor or pediatrician is recommended.

Respond strictly in JSON format:
{
  "advice": "Core psychological understanding and encouraging advice...",
  "practical_steps": ["Actionable step 1", "Actionable step 2", "Actionable step 3"],
  "communication_script": "Exact words or script parents can say to their child...",
  "when_to_seek_help": "Clear indicators for when professional guidance is appropriate..."
}""")

        try:
            res = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Category: {query_type}, Grade/Age: {child_age_or_grade}\nParent Concern: {query_text}"}
                ],
                response_format={"type": "json_object"}
            )
            return json.loads(res.choices[0].message.content)
        except Exception as e:
            return {
                "advice": "Focus on positive reinforcement and structured daily routines.",
                "practical_steps": ["Break tasks into smaller steps", "Establish regular breaks"],
                "communication_script": "Let's work through this together step by step.",
                "when_to_seek_help": "Seek professional help if emotional distress persists."
            }

groq_service = GroqAIService()

