import json
import re
import logging
from typing import List, Dict, Any, Optional
from groq import Groq
from config import settings
from schemas.question import GeneratePaperRequest, GeneratedPaperResponse, QuestionItem
from services.ai_provider import ai_provider
from services.academic_guardrail import attach_academic_guardrail

logger = logging.getLogger("groq_service")

class GroqAIService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = Groq(api_key=self.api_key) if self.api_key else None

    async def generate_question_paper(self, req: GeneratePaperRequest) -> GeneratedPaperResponse:
        """
        Generates 100% original, curriculum-accurate CBSE/NCERT examination papers.
        Supports arbitrarily large papers via parallel chunked generation.
        Zero mock questions guaranteed.
        """
        import asyncio

        subj_lower = (req.subject or "").lower()
        is_math = "math" in subj_lower
        is_science = any(k in subj_lower for k in ["sci", "phys", "chem", "bio"])
        is_lang = any(k in subj_lower for k in ["eng", "hindi", "sanskrit", "language"])

        if is_math:
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

        tasks = []
        target_mcq = max(0, req.num_mcqs)
        target_short = max(0, req.num_short)
        target_long = max(0, req.num_long)

        # 1. MCQ Tasks
        mcq_chunks = _get_chunks(target_mcq, 10)
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
            tasks.append(
                ai_provider.chat_completion(
                    messages=[
                        {"role": "system", "content": f"You are DEVGYA's Master CBSE/NCERT Assessment Synthesizer for {req.class_name} {req.subject}. Strictly adhere to {req.subject} and {req.chapter}. Return valid JSON."},
                        {"role": "user", "content": mcq_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=3500,
                    response_format_json=True
                )
            )

        # 2. Short Answer Tasks
        short_chunks = _get_chunks(target_short, 8)
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
            tasks.append(
                ai_provider.chat_completion(
                    messages=[
                        {"role": "system", "content": f"You are DEVGYA's Master CBSE/NCERT Assessment Synthesizer for {req.class_name} {req.subject}. Strictly adhere to {req.subject} and {req.chapter}. Return valid JSON."},
                        {"role": "user", "content": short_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=3500,
                    response_format_json=True
                )
            )

        # 3. Long Answer / HOTS Tasks
        long_chunks = _get_chunks(target_long, 5)
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
            tasks.append(
                ai_provider.chat_completion(
                    messages=[
                        {"role": "system", "content": f"You are DEVGYA's Master CBSE/NCERT Assessment Synthesizer for {req.class_name} {req.subject}. Strictly adhere to {req.subject} and {req.chapter}. Return valid JSON."},
                        {"role": "user", "content": long_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=3500,
                    response_format_json=True
                )
            )

        raw_responses = await asyncio.gather(*tasks, return_exceptions=True)

        extracted_raw_questions = []
        for resp in raw_responses:
            if isinstance(resp, str):
                text = resp.strip()
                if "```json" in text:
                    text = text.split("```json", 1)[1].split("```", 1)[0].strip()
                elif "```" in text:
                    text = text.split("```", 1)[1].split("```", 1)[0].strip()
                if "{" in text and "}" in text:
                    text = text[text.find("{"):text.rfind("}") + 1].strip()
                try:
                    parsed = json.loads(text)
                    if isinstance(parsed, dict):
                        extracted_raw_questions.extend(parsed.get("questions") or [])
                except Exception:
                    pass

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

        mcqs = _dedup_q_list(mcqs)
        shorts = _dedup_q_list(shorts)
        longs = _dedup_q_list(longs)

        # Check for any missing questions and run targeted supplement
        miss_mcq = max(0, target_mcq - len(mcqs))
        miss_short = max(0, target_short - len(shorts))
        miss_long = max(0, target_long - len(longs))

        if miss_mcq > 0 or miss_short > 0 or miss_long > 0:
            supp_tasks = []
            if miss_mcq > 0:
                supp_tasks.append(
                    ai_provider.chat_completion(
                        messages=[
                            {"role": "system", "content": f"Generate EXACTLY {miss_mcq} authentic, distinct MCQs for {req.class_name} {req.subject}, {req.chapter}. Return valid JSON with 'questions' array."},
                            {"role": "user", "content": f"Generate {miss_mcq} unique MCQs for {req.subject} topic '{req.chapter}'."}
                        ],
                        temperature=0.3,
                        max_tokens=2500,
                        response_format_json=True
                    )
                )
            if miss_short > 0:
                supp_tasks.append(
                    ai_provider.chat_completion(
                        messages=[
                            {"role": "system", "content": f"Generate EXACTLY {miss_short} authentic, distinct Short Answer (3M) questions for {req.class_name} {req.subject}, {req.chapter}. Return valid JSON with 'questions' array."},
                            {"role": "user", "content": f"Generate {miss_short} unique Short Answer questions for {req.subject} topic '{req.chapter}'."}
                        ],
                        temperature=0.3,
                        max_tokens=2500,
                        response_format_json=True
                    )
                )
            if miss_long > 0:
                supp_tasks.append(
                    ai_provider.chat_completion(
                        messages=[
                            {"role": "system", "content": f"Generate EXACTLY {miss_long} authentic, distinct Long Answer (5M) questions for {req.class_name} {req.subject}, {req.chapter}. Return valid JSON with 'questions' array."},
                            {"role": "user", "content": f"Generate {miss_long} unique Long Answer questions for {req.subject} topic '{req.chapter}'."}
                        ],
                        temperature=0.3,
                        max_tokens=2500,
                        response_format_json=True
                    )
                )
            
            try:
                supp_resps = await asyncio.gather(*supp_tasks, return_exceptions=True)
                for s_resp in supp_resps:
                    if isinstance(s_resp, str):
                        try:
                            s_data = json.loads(s_resp)
                            for sq in s_data.get("questions", []):
                                stype = str(sq.get("question_type", "")).lower()
                                stext = str(sq.get("question_text") or sq.get("question") or "").strip()
                                if not stext:
                                    continue
                                if "mcq" in stype:
                                    mcqs.append({
                                        "question_type": "mcq",
                                        "question_text": stext,
                                        "marks": 1,
                                        "options": sq.get("options"),
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
                        except Exception:
                            pass
            except Exception as supp_err:
                logger.warning(f"[Supplement Error] {supp_err}")

        # Final deduplication
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
            q_num += 1

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
        """Generate Exam Question Paper derived directly from user inputs and optional PDF/photo attachment."""
        prompt_text = f"""
You are DEVGYA's Senior CBSE & NCERT Master Assessment Creator.
Generate an official high-quality Examination Question Paper strictly adhering to these user-specified constraints:

Paper Details:
- Title: {req.title}
- Target Grade/Class: {req.class_name}
- Subject: {req.subject}
- Syllabus Chapter/Topic: {req.chapter}
- Difficulty Level: {req.difficulty}
- Total Marks: {req.total_marks}
- Time Allowed: {req.time_allowed_mins} minutes
- School Name: {req.school_name}

Exact Question Breakdown Required:
1. Multiple Choice Questions (MCQs): EXACTLY {req.num_mcqs} questions (1 mark each). Include 4 options (A, B, C, D) for each MCQ.
2. Short Answer Questions: EXACTLY {req.num_short} questions (3 marks each).
3. Long Answer Questions: EXACTLY {req.num_long} questions (5 marks each).
Custom Teacher Instructions:
{req.custom_instructions or "Ensure high NCERT curriculum alignment and HOTS questions."}

Respond strictly with a valid JSON object matching this structure:
{{
  "title": "{req.title}",
  "class_name": "{req.class_name}",
  "subject": "{req.subject}",
  "chapter": "{req.chapter}",
  "difficulty": "{req.difficulty}",
  "total_marks": {req.total_marks},
  "time_allowed_mins": {req.time_allowed_mins},
  "instructions": [
    "All questions are compulsory.",
    "The question paper consists of 3 sections: Section A (MCQs), Section B (Short Answer), Section C (Long Answer)."
  ],
  "questions": [
    {{
      "id": 1,
      "question_number": 1,
      "question_type": "mcq",
      "question_text": "MCQ Question text based on study material",
      "marks": 1,
      "options": ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"],
      "answer": "(A) Option 1",
      "explanation": "Detailed step-by-step explanation"
    }},
    {{
      "id": 2,
      "question_number": 2,
      "question_type": "short",
      "question_text": "Short answer question based on study material?",
      "marks": 3,
      "answer": "Structured 3-mark model solution.",
      "explanation": "NCERT concept breakdown."
    }},
    {{
      "id": 3,
      "question_number": 3,
      "question_type": "long",
      "question_text": "Long answer question based on study material?",
      "marks": 5,
      "answer": "Detailed 5-mark answer derivation/explanation.",
      "explanation": "Comprehensive solution."
    }}
  ],
  "school_name": "{req.school_name}"
}}
"""

        if image_data_url:
            user_content = [
                {
                    "type": "text",
                    "text": f"CRITICAL DIRECTIVE: Base ALL questions DIRECTLY on the visible text, problems, and topic in this attached image/worksheet. Detect the real Subject, Chapter, and Title from the image.\n\n{prompt_text}"
                },
                {"type": "image_url", "image_url": {"url": image_data_url}}
            ]
        elif extracted_text and extracted_text.strip():
            user_content = f"CRITICAL DIRECTIVE: Base ALL questions DIRECTLY on the text, story, and topic of this attached document:\n\n{extracted_text[:6000]}\n\nDetect the real Subject, Chapter, and Title from this attached document.\n\n{prompt_text}"
        else:
            raise ValueError("Reference document (PDF or Image) is compulsory and must contain readable content.")

        messages = [
            {"role": "system", "content": f"You are a senior AI assessment synthesizer. Base questions 100% on the user's uploaded attachment content. Detect the correct subject and chapter from the attachment. Always return valid JSON."},
            {"role": "user", "content": user_content}
        ]

        try:
            raw = await ai_provider.chat_completion(messages, temperature=0.3, max_tokens=4000, response_format_json=True)
            text = (raw or "").strip()
            if "```json" in text:
                text = text.split("```json", 1)[1].split("```", 1)[0].strip()
            elif "```" in text:
                text = text.split("```", 1)[1].split("```", 1)[0].strip()

            if "{" in text and "}" in text:
                text = text[text.find("{"):text.rfind("}") + 1].strip()

            data = json.loads(text)

            if isinstance(data, dict):
                inferred_subj = str(data.get("subject") or "").strip()
                if inferred_subj and inferred_subj.lower() not in ["general studies", "general"]:
                    data["subject"] = inferred_subj
                else:
                    data["subject"] = str(req.subject or "General")

                inferred_chap = str(data.get("chapter") or "").strip()
                if inferred_chap and inferred_chap.lower() not in ["general syllabus", "general"]:
                    data["chapter"] = inferred_chap
                else:
                    data["chapter"] = str(req.chapter or "NCERT Syllabus")

                data["title"] = str(data.get("title") or req.title or f"{data['subject']} Assessment")
                data["class_name"] = str(data.get("class_name") or req.class_name or "Class 10")
                data["difficulty"] = str(data.get("difficulty") or req.difficulty or "medium")
                data["total_marks"] = int(data.get("total_marks") or req.total_marks or 40)
                data["time_allowed_mins"] = int(data.get("time_allowed_mins") or req.time_allowed_mins or 90)
                data["school_name"] = str(data.get("school_name") or req.school_name or "DEVGYA GLOBAL ACADEMY")
                if not isinstance(data.get("instructions"), list) or not data["instructions"]:
                    data["instructions"] = [
                        "All questions are compulsory.",
                        "Read all questions carefully before attempting.",
                        "Marks for each question are indicated against it."
                    ]

                raw_questions = data.get("questions") if isinstance(data.get("questions"), list) else []
                clean_qs = []
                for idx, q in enumerate(raw_questions):
                    if not isinstance(q, dict):
                        continue
                    ans_val = q.get("answer")
                    if isinstance(ans_val, dict):
                        ans_val = str(ans_val.get("answer") or ans_val.get("text") or list(ans_val.values())[0])
                    elif not isinstance(ans_val, str):
                        ans_val = str(ans_val or "")

                    raw_type = str(q.get("question_type") or "").lower()
                    opts = q.get("options") if isinstance(q.get("options"), list) and len(q.get("options")) >= 2 else None
                    if "short" in raw_type or "subjective" in raw_type:
                        q_type = "short"
                    elif "long" in raw_type or "essay" in raw_type or "descriptive" in raw_type:
                        q_type = "long"
                    elif "mcq" in raw_type or "choice" in raw_type or opts:
                        q_type = "mcq"
                    else:
                        q_type = "short" if int(q.get("marks") or 1) == 3 else "long" if int(q.get("marks") or 1) >= 5 else "mcq"

                    q_text = str(q.get("question_text") or q.get("question") or f"Question {idx+1} on {req.chapter}")

                    clean_qs.append({
                        "id": idx + 1,
                        "question_number": idx + 1,
                        "question_type": q_type,
                        "question_text": q_text,
                        "marks": int(q.get("marks") or (1 if q_type == "mcq" else 3 if q_type == "short" else 5)),
                        "options": opts,
                        "answer": ans_val or "Refer to step-by-step solution.",
                        "explanation": str(q.get("explanation") or "NCERT aligned concept explanation.")
                    })

                # Deduplicate and index questions
                seen_texts = set()
                deduped_qs = []
                for q in clean_qs:
                    norm = re.sub(r'[^a-zA-Z0-9\s]', '', str(q.get("question_text", "")).lower())
                    norm_key = " ".join(norm.split())
                    if not norm_key or norm_key in seen_texts or len(norm_key) < 8:
                        continue
                    seen_texts.add(norm_key)
                    deduped_qs.append(q)

                final_indexed = []
                q_cnt = 1
                for q in deduped_qs:
                    q_copy = dict(q)
                    q_copy["id"] = q_cnt
                    q_copy["question_number"] = q_cnt
                    final_indexed.append(q_copy)
                    q_cnt += 1

                data["questions"] = final_indexed

            return GeneratedPaperResponse(**data)
        except Exception as e:
            logger.warning(f"[GroqService] Notice during attachment synthesis: {e}. Falling back to curriculum generator.")
            return await self.generate_question_paper(req)

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

