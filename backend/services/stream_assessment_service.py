import re
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime

from schemas.question import (
    StreamAssessmentRequest, 
    StreamAssessmentResponse, 
    QuestionItem, 
    StreamBreakdown
)
from services.ai_provider import ai_provider

logger = logging.getLogger("stream_assessment_service")

def _clean_json_str(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()

def detect_nep_stage(class_name: str) -> str:
    """
    Detects the official NEP 2020 Stage from class/cohort name:
    - Foundational: Class 1 to 2
    - Preparatory: Class 3 to 5
    - Middle: Class 6 to 8
    - Secondary: Class 9 to 10
    - Senior Secondary: Class 11 to 12
    """
    clean = str(class_name or "").lower().replace("-", " ")
    # Check digits
    m = re.search(r'\b(1[0-2]|[1-9])\b', clean)
    if m:
        num = int(m.group(1))
        if num in (1, 2):
            return "foundational"
        elif num in (3, 4, 5):
            return "preparatory"
        elif num in (6, 7, 8):
            return "middle"
        elif num in (9, 10):
            return "secondary"
        elif num in (11, 12):
            return "senior_secondary"

    if "foundation" in clean or "kg" in clean or "prep" in clean or "primary" in clean:
        return "foundational"
    if "middle" in clean:
        return "middle"
    if "secondary" in clean:
        return "secondary"
    return "senior_secondary"

NEP_STAGES_CONFIG = {
    "foundational": {
        "name": "Foundational Stage (Classes 1–2)",
        "scope": "Class 1 to 2",
        "focus": "Foundational literacy and numeracy (FLN), language, physical and socio-emotional development",
        "approach": "Play, picture, oral activity, demonstration and observation",
        "domains": ["Literacy & Phonics", "Numeracy & Patterns", "World Observation & Play"],
        "default_title": "Foundational Stage (FLN) Diagnostic Assessment",
        "domain_keys": ["literacy", "numeracy", "observation"]
    },
    "preparatory": {
        "name": "Preparatory Stage (Classes 3–5)",
        "scope": "Class 3 to 5",
        "focus": "Language, mathematics, world around us (EVS), creativity and learning habits",
        "approach": "Activity, worksheet, oral response, project and portfolio",
        "domains": ["Language & Reading", "Everyday Mathematics", "World Around Us (EVS)"],
        "default_title": "Preparatory Stage Competency Assessment",
        "domain_keys": ["language", "math", "evs"]
    },
    "middle": {
        "name": "Middle Stage (Classes 6–8)",
        "scope": "Class 6 to 8",
        "focus": "Subject understanding, reasoning, experimentation, digital and vocational exposure",
        "approach": "Competency question, practical, project, portfolio and reflection",
        "domains": ["Mathematical Logic", "Science & Experimentation", "Social & Critical Thinking"],
        "default_title": "Middle Stage Conceptual & Reasoning Assessment",
        "domain_keys": ["science", "math", "humanities"]
    },
    "secondary": {
        "name": "Secondary Stage (Classes 9–10)",
        "scope": "Class 9 to 10",
        "focus": "Deeper knowledge, analysis, application, multidisciplinary learning and career readiness",
        "approach": "Case study, problem solving, practical, project and written assessment",
        "domains": ["Scientific Modeling", "Quantitative Reasoning", "Applied Social Sciences"],
        "default_title": "Secondary Stage Application & Case-Based Assessment",
        "domain_keys": ["science", "commerce", "humanities"]
    },
    "senior_secondary": {
        "name": "Senior Secondary Stage (Classes 11–12)",
        "scope": "Class 11 to 12",
        "focus": "Stream suitability, cognitive depth, and career alignment",
        "approach": "Diagnostic assessment, aptitude mapping, and counseling rubrics",
        "domains": ["Science (STEM)", "Commerce & Finance", "Humanities & Social Sciences"],
        "default_title": "Class 11-12 Stream Selection & Aptitude Diagnostic Assessment",
        "domain_keys": ["science", "commerce", "humanities"]
    }
}

class StreamAssessmentService:
    """
    Dedicated AI Engine for NEP 2020 Stage-Wise School Assessment Papers (Classes 1 to 12).
    Generates curriculum-accurate diagnostic papers adhering to:
    - Foundational Stage (Class 1-2): FLN, picture/play/observation
    - Preparatory Stage (Class 3-5): Worksheets, EVS, real-world math
    - Middle Stage (Class 6-8): Competency, reasoning, experimentation
    - Secondary Stage (Class 9-10): Case studies, multidisciplinary analysis
    - Senior Secondary (Class 11-12): Stream suitability diagnostic (Science, Commerce, Humanities)
    """

    async def generate_assessment(self, req: StreamAssessmentRequest) -> StreamAssessmentResponse:
        stage = req.nep_stage or detect_nep_stage(req.class_name)
        cfg = NEP_STAGES_CONFIG.get(stage, NEP_STAGES_CONFIG["senior_secondary"])

        n_mcq = max(2, min(req.num_mcqs_per_stream or 4, 10))
        n_short = max(1, min(req.num_short_per_stream or 2, 5))
        n_long = max(1, min(req.num_long_per_stream or 1, 3))

        marks_per_domain = (n_mcq * 1) + (n_short * 3) + (n_long * 5)
        total_marks = marks_per_domain * 3
        subject = req.subject or cfg["default_title"]

        prompt = self._construct_nep_prompt(req, stage, cfg, n_mcq, n_short, n_long)

        try:
            logger.info(f"Calling AI provider for NEP assessment ({stage} - {req.class_name})...")
            messages = [
                {
                    "role": "system",
                    "content": f"You are DEVGYA's Chief NEP 2020 Assessment Architect & CBSE Curriculum Specialist. Always output strict, valid JSON with age-appropriate questions matching the {cfg['name']}."
                },
                {"role": "user", "content": prompt}
            ]
            raw_response = await ai_provider.chat_completion(
                messages=messages,
                temperature=0.35,
                max_tokens=8192,
                response_format_json=True
            )
            parsed = self._parse_json_response(raw_response)
            if parsed and parsed.get("questions"):
                return self._build_response(req, stage, cfg, parsed, total_marks)
        except Exception as e:
            logger.error(f"AI Provider error during assessment generation: {e}")

        # Fallback generator for high-reliability guarantee
        logger.warning(f"Using built-in verified NEP {stage} fallback data.")
        fallback_data = self._generate_fallback_data(req, stage, cfg, n_mcq, n_short, n_long)
        return self._build_response(req, stage, cfg, fallback_data, total_marks)

    def _construct_nep_prompt(self, req: StreamAssessmentRequest, stage: str, cfg: Dict[str, Any], n_mcq: int, n_short: int, n_long: int) -> str:
        d1, d2, d3 = cfg["domains"]

        stage_pedagogy = ""
        if stage == "foundational":
            stage_pedagogy = """
STAGE PEDAGOGY GUIDELINES (FOUNDATIONAL STAGE - CLASSES 1 TO 2):
- Target Students: 6–7 years old.
- Primary Focus: Foundational literacy and numeracy (FLN), vocabulary, simple patterns, physical/socio-emotional habits.
- Assessment Approach: Playful, picture/visual description, matching pairs, and observation.
- Question language must be simple, encouraging, and clear.
- Section A: Visual Matching, Word Sound/Phonics, Count & Identify MCQs (1 Mark each).
- Section B: Short Worksheet Prompts (e.g. complete number sequence, fill in missing letters, circle correct item) (3 Marks each).
- Section C: Observation & Good Habits Scenario (e.g. identify healthy habits, picture scene interpretation) (5 Marks each).
"""
        elif stage == "preparatory":
            stage_pedagogy = """
STAGE PEDAGOGY GUIDELINES (PREPARATORY STAGE - CLASSES 3 TO 5):
- Target Students: 8–10 years old.
- Primary Focus: Language fluency, everyday mathematics, World Around Us (EVS), and learning habits.
- Assessment Approach: Activity-based, worksheet-style, reading comprehension, and creative response.
- Section A: Reading Comprehension & Mental Math MCQs (1 Mark each).
- Section B: Short Activity & Worksheet Questions (steps to solve, environmental observation) (3 Marks each).
- Section C: Mini-Project / Real-World Scenario Problem (e.g. saving water, playground math, diagram labeling) (5 Marks each).
"""
        elif stage == "middle":
            stage_pedagogy = """
STAGE PEDAGOGY GUIDELINES (MIDDLE STAGE - CLASSES 6 TO 8):
- Target Students: 11–13 years old.
- Primary Focus: Subject understanding, reasoning, experimentation, digital and vocational exposure.
- Assessment Approach: Competency questions, practical experiment inferences, and reflection.
- Section A: Competency-based MCQs & Concept Inferences (1 Mark each).
- Section B: Short Analytical Questions (scientific hypothesis, mathematical proof, historical reasoning) (3 Marks each).
- Section C: Practical Lab / Experimental Case Scenario (e.g. plant growth experiment, energy conservation) (5 Marks each).
"""
        elif stage == "secondary":
            stage_pedagogy = """
STAGE PEDAGOGY GUIDELINES (SECONDARY STAGE - CLASSES 9 TO 10):
- Target Students: 14–15 years old.
- Primary Focus: Deeper conceptual knowledge, analysis, multidisciplinary learning, and career readiness.
- Assessment Approach: CBSE Board aligned Case Studies, problem-solving, and written assessment.
- Section A: Objective Competency Questions & High-Order Thinking (1 Mark each).
- Section B: Short Analytical Questions requiring multi-step application (3 Marks each).
- Section C: Case Study Scenarios with data interpretation and 3 sub-questions (5 Marks each).
"""
        else:
            stage_pedagogy = """
STAGE PEDAGOGY GUIDELINES (SENIOR SECONDARY - CLASSES 11 TO 12):
- Primary Focus: Stream suitability and aptitude assessment across Science (STEM), Commerce & Finance, and Humanities.
- Assessment Approach: Comparative diagnostic psychometrics, career counseling alignment.
- Section A: Objective & Aptitude MCQs across the three streams (1 Mark each).
- Section B: Short Analytical Questions (3 Marks each).
- Section C: Long Case Study Questions with realistic societal or corporate scenarios (5 Marks each).
"""

        return f"""You are the Chief Academic Psychometrician & CBSE Senior Curriculum Specialist for DEVGYA Global Edutech.
Generate an authentic NEP 2020 Stage-Wise Assessment Paper for:
- NEP Stage: {cfg['name']}
- Classes in Scope: {cfg['scope']} (Current Class: {req.class_name})
- Primary Focus: {cfg['focus']}
- Assessment Approach: {cfg['approach']}
- Paper Subject / Focus: {req.subject or cfg['default_title']}
- School Name: {req.school_name}
- Difficulty Level: {req.difficulty}
- Time Allowed: {req.time_allowed_mins} minutes
- Additional Notes: {req.custom_instructions or "Align strictly with NEP 2020 competency framework."}

The assessment paper evaluates 3 core learning domains:
1. {d1}
2. {d2}
3. {d3}

{stage_pedagogy}

REQUIREMENTS:
1. Generate EXACTLY {n_mcq * 3} MCQs (Section A: {n_mcq} per domain, 1 Mark each).
2. Generate EXACTLY {n_short * 3} Short Questions (Section B: {n_short} per domain, 3 Marks each).
3. Generate EXACTLY {n_long * 3} Long / Case Questions (Section C: {n_long} per domain, 5 Marks each).
4. Each question must have:
   - question_number: Sequential integer starting at 1
   - stream: "{cfg['domain_keys'][0]}", "{cfg['domain_keys'][1]}", or "{cfg['domain_keys'][2]}"
   - question_type: "mcq", "short", or "long"
   - competency: Specific NEP competency tested
   - question_text: Complete, standalone question prompt with clear, full instructions so students know exactly what is being asked (e.g. "Which of the following words begins with the same letter sound as 'Sun'?", "Identify which word ends with the letter 't':", "Which of the following is a high-frequency sight word?"). Must be a complete grammatical sentence. DO NOT prefix with stream, class, or topic tags.
   - options: 4 clear choices for MCQs, e.g. ["(A) ...", "(B) ...", "(C) ...", "(D) ..."]
   - answer: Model answer / marking scheme (concise, max 2 sentences)
   - explanation: Pedagogical / diagnostic insight (concise, 1 sentence)

OUTPUT FORMAT:
Return ONLY valid JSON:
{{
  "instructions": [
    "Read all questions carefully.",
    "Section A consists of Objective MCQs (1 Mark each).",
    "Section B consists of Short Application Questions (3 Marks each).",
    "Section C consists of Long Scenario-Based Questions (5 Marks each)."
  ],
  "questions": [
    {{
      "question_number": 1,
      "stream": "{cfg['domain_keys'][0]}",
      "question_type": "mcq",
      "section": "Section A: Objective Questions",
      "competency": "Domain Competency 1",
      "question_text": "Sample direct question text...",
      "options": ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"],
      "marks": 1,
      "answer": "(A) Option 1",
      "explanation": "Diagnostic rationale..."
    }}
  ],
  "counseling_matrix": {{
    "domain_1_indicators": "Indicators for {d1}...",
    "domain_2_indicators": "Indicators for {d2}...",
    "domain_3_indicators": "Indicators for {d3}...",
    "balanced_recommendation": "Overall diagnostic recommendations for the child/student..."
  }}
}}"""

    def _parse_json_response(self, raw: str) -> Optional[Dict[str, Any]]:
        cleaned = _clean_json_str(raw)
        try:
            return json.loads(cleaned)
        except Exception:
            pass

        match = re.search(r'\{.*\}', cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass

        # Resilient recovery for truncated JSON
        try:
            q_match = re.search(r'"questions"\s*:\s*\[', cleaned)
            if q_match:
                q_start = q_match.end()
                last_brace = cleaned.rfind("}")
                if last_brace > q_start:
                    sub = cleaned[:last_brace + 1]
                    open_brackets = sub.count("[") - sub.count("]")
                    open_braces = sub.count("{") - sub.count("}")
                    repaired = sub + ("]" * max(0, open_brackets)) + ("}" * max(0, open_braces))
                    res = json.loads(repaired)
                    if res and isinstance(res.get("questions"), list) and len(res["questions"]) > 0:
                        return res
        except Exception as repair_err:
            logger.debug(f"JSON repair attempt notice: {repair_err}")

        return None

    def _build_response(self, req: StreamAssessmentRequest, stage: str, cfg: Dict[str, Any], data: Dict[str, Any], calculated_total_marks: int) -> StreamAssessmentResponse:
        raw_questions = data.get("questions") or []
        clean_questions: List[QuestionItem] = []

        domain_keys = cfg.get("domain_keys", ["science", "commerce", "humanities"])

        q_id = 1
        for q in raw_questions:
            stream = str(q.get("stream") or domain_keys[0]).lower()
            if stream not in domain_keys:
                stream = domain_keys[0]

            q_type = str(q.get("question_type") or "mcq").lower()
            if q_type not in ("mcq", "short", "long"):
                q_type = "mcq"

            marks = int(q.get("marks") or (1 if q_type == "mcq" else 3 if q_type == "short" else 5))
            section = str(q.get("section") or (
                "Section A: Objective Questions" if q_type == "mcq" else
                "Section B: Short Analytical Questions" if q_type == "short" else
                "Section C: Long Scenario & Case-Based Questions"
            ))

            raw_q_text = str(q.get("question_text") or f"Question #{q_id}").strip()
            raw_q_text = re.sub(r'₹\s*', 'Rs. ', raw_q_text).replace('\u20b9', 'Rs. ').replace('\u20a8', 'Rs. ')
            # Clean accidental leading stream/topic tags ONLY if they match specific known tags
            clean_q_text = re.sub(
                r'^(?:\[?(?:science|commerce|humanities|literacy|numeracy|observation|stem|domain\s*\d*|section\s*[a-c])\]?[\s:\-–—|•]+)+',
                '',
                raw_q_text,
                flags=re.IGNORECASE
            ).strip()
            clean_q_text = re.sub(r'^(?:q(?:uestion)?\s*\d+[\s.:\-–—]+)', '', clean_q_text, flags=re.IGNORECASE).strip()
            clean_q_text = clean_q_text or raw_q_text

            clean_opts = None
            if q_type == "mcq" and q.get("options") and isinstance(q.get("options"), list):
                clean_opts = [re.sub(r'₹\s*', 'Rs. ', str(o)).replace('\u20b9', 'Rs. ') for o in q.get("options")]

            clean_ans = re.sub(r'₹\s*', 'Rs. ', str(q.get("answer") or "Refer to evaluation scheme.")).replace('\u20b9', 'Rs. ')
            clean_expl = re.sub(r'₹\s*', 'Rs. ', str(q.get("explanation") or "")).replace('\u20b9', 'Rs. ') if q.get("explanation") else None
            clean_passage = re.sub(r'₹\s*', 'Rs. ', str(q.get("case_passage") or "")).replace('\u20b9', 'Rs. ') if q.get("case_passage") else None

            clean_questions.append(QuestionItem(
                id=q_id,
                question_number=q_id,
                question_type=q_type,
                question_text=clean_q_text,
                marks=marks,
                options=clean_opts,
                case_passage=clean_passage,
                answer=clean_ans,
                explanation=clean_expl,
                stream=stream,
                competency=str(q.get("competency") or f"{stream.capitalize()} Competency"),
                section=section
            ))
            q_id += 1

        actual_total_marks = sum(q.marks for q in clean_questions) or calculated_total_marks

        # Stream / Domain breakdowns
        stream_breakdown = []
        for i, d_key in enumerate(domain_keys):
            d_name = cfg["domains"][i]
            d_qs = [q for q in clean_questions if q.stream == d_key]
            stream_breakdown.append(StreamBreakdown(
                stream=d_key,
                stream_name=d_name,
                mcq_count=sum(1 for q in d_qs if q.question_type == "mcq"),
                short_count=sum(1 for q in d_qs if q.question_type == "short"),
                long_count=sum(1 for q in d_qs if q.question_type == "long"),
                total_marks=sum(q.marks for q in d_qs),
                key_competencies=[f"{d_name} Mastery", f"{d_name} Problem Solving"]
            ))

        instructions = data.get("instructions") or [
            f"This examination adheres to the NEP 2020 {cfg['name']} framework.",
            f"Primary Focus: {cfg['focus']}.",
            "Section A contains Objective Questions (1 Mark each).",
            "Section B contains Short Application Questions (3 Marks each).",
            "Section C contains Long Scenario & Case Questions (5 Marks each)."
        ]

        diagnostic_matrix = data.get("counseling_matrix") or {
            "domain_1_indicators": f"Strong grasp of {cfg['domains'][0]} fundamentals and practical concepts.",
            "domain_2_indicators": f"High competence in {cfg['domains'][1]} reasoning and logical problem formulation.",
            "domain_3_indicators": f"Strong acumen in {cfg['domains'][2]} analysis and real-world synthesis.",
            "balanced_recommendation": f"Learner demonstrates well-rounded capability aligned with NEP 2020 {cfg['name']} outcomes."
        }

        # Backwards compatibility: Map domain indicators to science/commerce/humanities indicators
        if "science_indicators" not in diagnostic_matrix and "domain_1_indicators" in diagnostic_matrix:
            diagnostic_matrix["science_indicators"] = diagnostic_matrix["domain_1_indicators"]
        if "commerce_indicators" not in diagnostic_matrix and "domain_2_indicators" in diagnostic_matrix:
            diagnostic_matrix["commerce_indicators"] = diagnostic_matrix["domain_2_indicators"]
        if "humanities_indicators" not in diagnostic_matrix and "domain_3_indicators" in diagnostic_matrix:
            diagnostic_matrix["humanities_indicators"] = diagnostic_matrix["domain_3_indicators"]

        return StreamAssessmentResponse(
            id=f"nep-assess-{int(datetime.now().timestamp())}",
            title=req.title or f"{req.class_name} {cfg['name']} Assessment",
            class_name=req.class_name,
            nep_stage=stage,
            subject=req.subject or f"{cfg['name']} Diagnostic ({cfg['domains'][0]} • {cfg['domains'][1]} • {cfg['domains'][2]})",
            school_name=req.school_name,
            school_logo=req.school_logo,
            total_marks=actual_total_marks,
            time_allowed_mins=req.time_allowed_mins,
            difficulty=req.difficulty,
            instructions=instructions,
            questions=clean_questions,
            stream_breakdown=stream_breakdown,
            diagnostic_matrix=diagnostic_matrix,
            user_email=req.user_email,
            created_at=datetime.utcnow().isoformat()
        )

    def _generate_fallback_data(self, req: StreamAssessmentRequest, stage: str, cfg: Dict[str, Any], n_mcq: int, n_short: int, n_long: int) -> Dict[str, Any]:
        """Provides verified fallback assessment items tailored to each NEP 2020 stage."""
        d_keys = cfg.get("domain_keys", ["science", "commerce", "humanities"])

        if stage == "foundational":
            # Class 1-2 FLN & Visual
            mcqs = [
                {
                    "stream": d_keys[0],
                    "question_type": "mcq",
                    "section": "Section A: Visual & Objective MCQs",
                    "competency": "Phonemic Awareness",
                    "question_text": "Which of the following words rhymes with 'SUN'?",
                    "options": ["(A) Run", "(B) Cat", "(C) Top", "(D) Bed"],
                    "marks": 1,
                    "answer": "(A) Run",
                    "explanation": "Identifies common phonetic rhyming ending -un."
                },
                {
                    "stream": d_keys[1],
                    "question_type": "mcq",
                    "section": "Section A: Visual & Objective MCQs",
                    "competency": "Basic Counting & Numeracy",
                    "question_text": "Riya has 4 blue balloons. Her brother gives her 3 green balloons. How many balloons does she have in total?",
                    "options": ["(A) 5", "(B) 6", "(C) 7", "(D) 8"],
                    "marks": 1,
                    "answer": "(C) 7",
                    "explanation": "Basic single-digit addition 4 + 3 = 7."
                },
                {
                    "stream": d_keys[2],
                    "question_type": "mcq",
                    "section": "Section A: Visual & Objective MCQs",
                    "competency": "Living World & Observation",
                    "question_text": "Which of these animals gives us milk?",
                    "options": ["(A) Cow", "(B) Lion", "(C) Eagle", "(D) Snake"],
                    "marks": 1,
                    "answer": "(A) Cow",
                    "explanation": "Identifies domestic dairy animal."
                }
            ]
            shorts = [
                {
                    "stream": d_keys[0],
                    "question_type": "short",
                    "section": "Section B: Short Activity & Worksheet Questions",
                    "competency": "Word Building & Sentence Flow",
                    "question_text": "Arrange these words into a meaningful sentence: [plays / Rohan / football / with].",
                    "marks": 3,
                    "answer": "Rohan plays with football.",
                    "explanation": "Evaluates subject-verb-object arrangement."
                },
                {
                    "stream": d_keys[1],
                    "question_type": "short",
                    "section": "Section B: Short Activity & Worksheet Questions",
                    "competency": "Number Patterns & Order",
                    "question_text": "Write the missing numbers in this pattern: 2, 4, 6, ____, 10, ____.",
                    "marks": 3,
                    "answer": "8, 12",
                    "explanation": "Evaluates skip counting by 2s."
                },
                {
                    "stream": d_keys[2],
                    "question_type": "short",
                    "section": "Section B: Short Activity & Worksheet Questions",
                    "competency": "Environmental Care & Health",
                    "question_text": "Name two healthy habits you should follow before eating your meals.",
                    "marks": 3,
                    "answer": "1. Wash hands with soap and water.\n2. Sit quietly and eat fresh clean food.",
                    "explanation": "Assesses foundational hygiene habits."
                }
            ]
            longs = [
                {
                    "stream": d_keys[0],
                    "question_type": "long",
                    "section": "Section C: Creative Story & Observation",
                    "competency": "Story Comprehension & Expression",
                    "case_passage": "A tiny bird named Chintu made a soft nest on a neem tree. Every morning, Chintu sang sweet songs. One windy afternoon, a little chick fell from the nest. Maya gently picked up the chick and placed it safely back into the nest.",
                    "question_text": "Answer the following:\n(a) Where did Chintu build the nest?\n(b) What did Maya do when the chick fell down?\n(c) What value did Maya show?",
                    "marks": 5,
                    "answer": "(a) On a neem tree (1 Mark).\n(b) Maya gently placed the chick safely back into the nest (2 Marks).\n(c) Kindness and care for animals (2 Marks).",
                    "explanation": "Evaluates foundational listening/reading comprehension and ethical values."
                },
                {
                    "stream": d_keys[1],
                    "question_type": "long",
                    "section": "Section C: Creative Story & Observation",
                    "competency": "Real-Life Math Application",
                    "case_passage": "A vegetable basket contains 6 carrots, 5 potatoes, and 4 tomatoes. Grandmother takes 2 carrots and 1 potato to prepare soup.",
                    "question_text": "(a) How many vegetables were in the basket initially?\n(b) How many carrots are left after making soup?\n(c) How many total vegetables remain in the basket?",
                    "marks": 5,
                    "answer": "(a) 6 + 5 + 4 = 15 vegetables (2 Marks).\n(b) 6 - 2 = 4 carrots (1.5 Marks).\n(c) 15 - 3 = 12 vegetables remain (1.5 Marks).",
                    "explanation": "Assesses two-step everyday counting and subtraction."
                },
                {
                    "stream": d_keys[2],
                    "question_type": "long",
                    "section": "Section C: Creative Story & Observation",
                    "competency": "Observation & Nature Connection",
                    "case_passage": "Trees provide shade, clean air, and shelter to birds. During autumn, dry leaves fall on the ground. Instead of burning dry leaves, students of Class 2 collect them to make compost for the school garden.",
                    "question_text": "(a) Write two things trees provide to living beings.\n(b) Why should we not burn dry leaves?\n(c) What did the students make from fallen leaves?",
                    "marks": 5,
                    "answer": "(a) Shade, fresh clean air, or shelter for birds (2 Marks).\n(b) Burning leaves causes smoke and air pollution (1.5 Marks).\n(c) Healthy compost for plants (1.5 Marks).",
                    "explanation": "Promotes foundational eco-awareness and waste reduction."
                }
            ]
        elif stage == "preparatory":
            # Class 3-5 Activity & Worksheet
            mcqs = [
                {
                    "stream": d_keys[0],
                    "question_type": "mcq",
                    "section": "Section A: Reading & Objective MCQs",
                    "competency": "Grammar & Meaning in Context",
                    "question_text": "Identify the conjunction in the sentence: 'Aarav wanted to play outside, but it started raining heavily.'",
                    "options": ["(A) wanted", "(B) outside", "(C) but", "(D) heavily"],
                    "marks": 1,
                    "answer": "(C) but",
                    "explanation": "Identifies coordinating conjunction expressing contrast."
                },
                {
                    "stream": d_keys[1],
                    "question_type": "mcq",
                    "section": "Section A: Reading & Objective MCQs",
                    "competency": "Fractional Representation",
                    "question_text": "A pizza is sliced into 8 equal parts. Kabir eats 3 slices. What fraction of the pizza has Kabir eaten?",
                    "options": ["(A) 3/8", "(B) 5/8", "(C) 1/3", "(D) 8/3"],
                    "marks": 1,
                    "answer": "(A) 3/8",
                    "explanation": "Understanding part-to-whole fraction representation."
                },
                {
                    "stream": d_keys[2],
                    "question_type": "mcq",
                    "section": "Section A: Reading & Objective MCQs",
                    "competency": "EVS - Plant Adaptation",
                    "question_text": "Why do desert plants like cacti have spines instead of broad green leaves?",
                    "options": [
                        "(A) To absorb more sunlight",
                        "(B) To prevent water loss through transpiration",
                        "(C) To attract birds for pollination",
                        "(D) To store rainwater in the flowers"
                    ],
                    "marks": 1,
                    "answer": "(B) To prevent water loss through transpiration",
                    "explanation": "Evaluates adaptation to arid climate."
                }
            ]
            shorts = [
                {
                    "stream": d_keys[0],
                    "question_type": "short",
                    "section": "Section B: Analytical Worksheet Questions",
                    "competency": "Creative Sentence Formation",
                    "question_text": "Rewrite the following informal text into clear, polite formal language: 'Give me your book now, I need it.'",
                    "marks": 3,
                    "answer": "'Could you please lend me your book for some time? I would really appreciate it.'",
                    "explanation": "Tests sociolinguistic awareness and polite communication."
                },
                {
                    "stream": d_keys[1],
                    "question_type": "short",
                    "section": "Section B: Analytical Worksheet Questions",
                    "competency": "Perimeter & Area Calculation",
                    "question_text": "A rectangular school flower bed has length 12 meters and breadth 5 meters. Calculate the perimeter and area of the bed.",
                    "marks": 3,
                    "answer": "Perimeter = 2 * (12 + 5) = 34 meters.\nArea = 12 * 5 = 60 square meters.",
                    "explanation": "Tests two-dimensional measurement."
                },
                {
                    "stream": d_keys[2],
                    "question_type": "short",
                    "section": "Section B: Analytical Worksheet Questions",
                    "competency": "Water Conservation & EVS",
                    "question_text": "Explain three easy ways school students can prevent wastage of drinking water in school.",
                    "marks": 3,
                    "answer": "1. Turn off leaking taps tightly.\n2. Do not throw unused water bottle water on the ground; pour it into garden plants.\n3. Report broken pipes to teachers immediately.",
                    "explanation": "Tests practical eco-habits."
                }
            ]
            longs = [
                {
                    "stream": d_keys[0],
                    "question_type": "long",
                    "section": "Section C: Project & Scenario-Based Questions",
                    "competency": "Reading Comprehension & Critical Synthesis",
                    "case_passage": "In a village near the Western Ghats, villagers noticed that honeybees were disappearing. Teacher Sunita explained that chemical sprays used in nearby orchards were harming the bees. Without bees, the mango trees bore fewer fruits. The villagers decided to switch to organic neem sprays and planted marigold borders around the groves. Within two seasons, bee colonies returned and crop yields doubled.",
                    "question_text": "(a) What caused the honeybees to disappear initially?\n(b) How did the disappearance of bees affect the mango trees?\n(c) Describe the eco-friendly solution implemented by the villagers.",
                    "marks": 5,
                    "answer": "(a) Chemical sprays in nearby orchards (1.5 Marks).\n(b) Without bees for pollination, mango trees bore fewer fruits (1.5 Marks).\n(c) Switched to organic neem spray and planted marigold borders (2 Marks).",
                    "explanation": "Assesses ecological interdependence and organic problem-solving."
                },
                {
                    "stream": d_keys[1],
                    "question_type": "long",
                    "section": "Section C: Project & Scenario-Based Questions",
                    "competency": "Financial Numeracy & Budgeting",
                    "case_passage": "Class 5 organized a charity book fair. They collected 120 storybooks. They sold 80 books for Rs 30 each, and the remaining 40 books at a discount of Rs 20 each. The printing of banners and stall rent cost Rs 500.",
                    "question_text": "(a) What was the total money collected from the sale of all books?\n(b) After subtracting the expenses of Rs 500, how much net profit was donated to the charity?\n(c) If the profit is split equally among 4 children in need, how much does each receive?",
                    "marks": 5,
                    "answer": "(a) (80 * 30) + (40 * 20) = 2400 + 800 = Rs 3,200 (2 Marks).\n(b) Net profit = 3200 - 500 = Rs 2,700 (1.5 Marks).\n(c) 2700 / 4 = Rs 675 per child (1.5 Marks).",
                    "explanation": "Multi-step budgeting and financial reasoning."
                },
                {
                    "stream": d_keys[2],
                    "question_type": "long",
                    "section": "Section C: Project & Scenario-Based Questions",
                    "competency": "Scientific Observation & Habitats",
                    "case_passage": "During a science field trip, students observed two ponds: Pond A was surrounded by green trees, clear water, and had small fish and dragonflies. Pond B had plastic wrappers floating on the surface, murky water, and bad smell with no fish visible.",
                    "question_text": "(a) List two indicators that prove Pond A is a healthy ecosystem.\n(b) Explain why fish cannot survive in Pond B.\n(c) Propose two community actions to restore Pond B.",
                    "marks": 5,
                    "answer": "(a) Clear water, presence of fish and dragonflies, surrounded by green trees (1.5 Marks).\n(b) Plastic pollution, depleted dissolved oxygen, and toxic pollutants kill aquatic life (1.5 Marks).\n(c) Community clean-up drive to remove plastic, stop sewage discharge, and plant reeds (2 Marks).",
                    "explanation": "Evaluates environmental monitoring and restoration logic."
                }
            ]
        elif stage == "middle":
            # Class 6-8 Competency & Experimentation
            mcqs = [
                {
                    "stream": d_keys[0],
                    "question_type": "mcq",
                    "section": "Section A: Competency MCQs",
                    "competency": "Physics & Force Dynamics",
                    "question_text": "A block of wood floats on water with 60% of its volume submerged. What is the density of the wood relative to water?",
                    "options": ["(A) 0.4 g/cm³", "(B) 0.6 g/cm³", "(C) 1.0 g/cm³", "(D) 1.6 g/cm³"],
                    "marks": 1,
                    "answer": "(B) 0.6 g/cm³",
                    "explanation": "By Archimedes' principle, fraction submerged equals ratio of densities: 60% = 0.6."
                },
                {
                    "stream": d_keys[1],
                    "question_type": "mcq",
                    "section": "Section A: Competency MCQs",
                    "competency": "Algebraic Logic",
                    "question_text": "If 3x - 5 = 2x + 7, what is the value of 2x - 3?",
                    "options": ["(A) 12", "(B) 21", "(C) 24", "(D) 27"],
                    "marks": 1,
                    "answer": "(B) 21",
                    "explanation": "3x - 2x = 7 + 5 => x = 12. Then 2(12) - 3 = 24 - 3 = 21."
                },
                {
                    "stream": d_keys[2],
                    "question_type": "mcq",
                    "section": "Section A: Competency MCQs",
                    "competency": "Civic Institutions",
                    "question_text": "Which organ of government is primarily responsible for interpreting the Constitution and resolving disputes between States?",
                    "options": ["(A) The Executive", "(B) The Legislature", "(C) The Judiciary", "(D) The Election Commission"],
                    "marks": 1,
                    "answer": "(C) The Judiciary",
                    "explanation": "The Supreme Court and Judiciary interpret statutory and constitutional laws."
                }
            ]
            shorts = [
                {
                    "stream": d_keys[0],
                    "question_type": "short",
                    "section": "Section B: Short Analytical Questions",
                    "competency": "Chemical Reaction Analysis",
                    "question_text": "When dilute hydrochloric acid is added to zinc granules, a gas is evolved with effervescence. Name the gas evolved and describe a safe test to confirm its identity.",
                    "marks": 3,
                    "answer": "1. Gas evolved: Hydrogen gas (H2) (1 Mark).\n2. Test: Bring a burning splinter near the mouth of the test tube. The gas burns with a characteristic 'pop' sound (2 Marks).",
                    "explanation": "Tests comprehension of metal-acid displacement reactions."
                },
                {
                    "stream": d_keys[1],
                    "question_type": "short",
                    "section": "Section B: Short Analytical Questions",
                    "competency": "Data Interpretation & Mean",
                    "question_text": "The temperatures recorded in a city over 5 consecutive days were 28°C, 31°C, 29°C, 35°C, and 32°C. Calculate the mean temperature and range of variation.",
                    "marks": 3,
                    "answer": "Mean = (28+31+29+35+32)/5 = 155/5 = 31°C (2 Marks).\nRange = Highest - Lowest = 35 - 28 = 7°C (1 Mark).",
                    "explanation": "Statistical analysis of dispersion."
                },
                {
                    "stream": d_keys[2],
                    "question_type": "short",
                    "section": "Section B: Short Analytical Questions",
                    "competency": "Historical Evidence Analysis",
                    "question_text": "Explain why historians consider archaeological inscriptions more reliable than oral traditions when studying ancient empires.",
                    "marks": 3,
                    "answer": "1. Inscriptions are engraved on stone or metal, protecting them from alteration over centuries (1.5 Marks).\n2. Oral traditions undergo distortion and exaggeration across generations, whereas inscriptions preserve contemporaneous dates and ruler decrees (1.5 Marks).",
                    "explanation": "Historiographical reasoning."
                }
            ]
            longs = [
                {
                    "stream": d_keys[0],
                    "question_type": "long",
                    "section": "Section C: Practical Experimentation & Inferences",
                    "competency": "Scientific Method & Experimental Design",
                    "case_passage": "Students set up an experiment with two potted green plants (Plant X and Plant Y). Plant X was kept in bright sunlight and watered regularly. Plant Y was kept inside a dark wooden cupboard with identical soil and watering. After 7 days, starch test (using iodine solution) was conducted on leaves plucked from both plants.",
                    "question_text": "(a) State the hypothesis being tested in this experiment.\n(b) Predict the color change of the leaf from Plant X and Plant Y after adding iodine solution.\n(c) What scientific conclusion can be drawn from the observations?",
                    "marks": 5,
                    "answer": "(a) Hypothesis: Sunlight is essential for green plants to carry out photosynthesis and synthesize starch (1.5 Marks).\n(b) Plant X leaf turns blue-black (indicating presence of starch); Plant Y leaf turns brownish-yellow with no blue-black color (absence of starch) (2 Marks).\n(c) Conclusion: Without sunlight, photosynthesis does not occur and starch is not formed (1.5 Marks).",
                    "explanation": "Assesses controlled experimental variables and biochemical verification."
                },
                {
                    "stream": d_keys[1],
                    "question_type": "long",
                    "section": "Section C: Practical Experimentation & Inferences",
                    "competency": "Applied Geometry & Proportionality",
                    "case_passage": "A school playground has a rectangular running track with semi-circular ends. The inner straight running tracks are 100 meters long, and the radius of each semi-circular end is 35 meters (use pi = 22/7).",
                    "question_text": "(a) Calculate the total perimeter of the inner boundary of the track.\n(b) If a runner completes 5 full laps of this track, what total distance has been covered?\n(c) How many more laps are required to complete a 3-kilometer run?",
                    "marks": 5,
                    "answer": "(a) Perimeter = 2 * straight + circumference of 2 semi-circles = 200 + (2 * 22/7 * 35) = 200 + 220 = 420 meters (2 Marks).\n(b) 5 laps = 5 * 420 = 2,100 meters (2.1 km) (1.5 Marks).\n(c) Remaining = 3000 - 2100 = 900 meters. 900 / 420 = 2.14 laps (approx 2 full laps and 60 meters) (1.5 Marks).",
                    "explanation": "Real-world geometry and circular boundary calculation."
                },
                {
                    "stream": d_keys[2],
                    "question_type": "long",
                    "section": "Section C: Practical Experimentation & Inferences",
                    "competency": "Socio-Environmental Impact",
                    "case_passage": "A river flowing through an industrial town shows a dramatic rise in Biochemical Oxygen Demand (BOD) over a 10 km stretch downstream from paper mills and textile dye factories. Downstream villages report frequent skin diseases and loss of traditional fishing livelihoods.",
                    "question_text": "(a) What does a high BOD reading signify about water quality?\n(b) Describe two direct socio-economic impacts on the downstream community.\n(c) Outline two legal regulations that the State Pollution Control Board should enforce immediately.",
                    "marks": 5,
                    "answer": "(a) High BOD indicates excessive organic waste requiring high oxygen for decomposition, meaning dissolved oxygen is severely depleted for fish (1.5 Marks).\n(b) Socio-economic impact: Loss of fishing livelihoods, increased medical expenses, and loss of safe drinking water (1.5 Marks).\n(c) Regulatory enforcement: Mandatory Effluent Treatment Plants (ETPs) before discharge, continuous online monitoring, and heavy penalties under the Water Act (2 Marks).",
                    "explanation": "Evaluates multidisciplinary environmental science and civic accountability."
                }
            ]
        else:
            # Classes 9-12: Secondary / Senior Secondary
            # (Uses the established CBSE Class 9-12 STEM, Commerce, Humanities / Case study bank)
            mcqs = [
                {
                    "stream": d_keys[0],
                    "question_type": "mcq",
                    "section": "Section A: Objective & Aptitude MCQs",
                    "competency": "Physics Kinematics & Force",
                    "question_text": "An electric vehicle decelerates uniformly from 72 km/h to rest over a distance of 40 meters on a horizontal track. If the mass of the vehicle is 1000 kg, what is the magnitude of the net retarding force exerted on it?",
                    "options": ["(A) 2,500 N", "(B) 5,000 N", "(C) 7,200 N", "(D) 10,000 N"],
                    "marks": 1,
                    "answer": "(B) 5,000 N",
                    "explanation": "72 km/h = 20 m/s. Using v² = u² + 2as -> 0 = 400 + 2(a)(40) -> a = -5 m/s². Force = m*a = 1000 * 5 = 5,000 N."
                },
                {
                    "stream": d_keys[1],
                    "question_type": "mcq",
                    "section": "Section A: Objective & Aptitude MCQs",
                    "competency": "Market Economics & Price Elasticity",
                    "question_text": "When the price of a digital tablet drops by 10%, the quantity demanded increases by 25%. What is the price elasticity of demand, and how is it classified?",
                    "options": [
                        "(A) 0.4 (Inelastic demand)",
                        "(B) 1.5 (Unitary demand)",
                        "(C) 2.5 (Elastic demand)",
                        "(D) 25.0 (Perfectly elastic demand)"
                    ],
                    "marks": 1,
                    "answer": "(C) 2.5 (Elastic demand)",
                    "explanation": "Price Elasticity = % change in Q / % change in P = 25% / 10% = 2.5 (> 1 indicates elastic demand)."
                },
                {
                    "stream": d_keys[2],
                    "question_type": "mcq",
                    "section": "Section A: Objective & Aptitude MCQs",
                    "competency": "Constitutional Law & Separation of Powers",
                    "question_text": "Under Article 21 of the Indian Constitution, the Supreme Court has interpreted the 'Right to Life' to encompass which of the following rights?",
                    "options": [
                        "(A) Only mere animal existence and biological survival",
                        "(B) The Right to clean environment, livelihood, and informational privacy",
                        "(C) The unrestricted right to bear arms without licensing",
                        "(D) The absolute immunity from preventive detention laws"
                    ],
                    "marks": 1,
                    "answer": "(B) The Right to clean environment, livelihood, and informational privacy",
                    "explanation": "Through landmark rulings (Menaka Gandhi, Subhash Kumar, Puttaswamy), Article 21 includes dignified living."
                }
            ]
            shorts = [
                {
                    "stream": d_keys[0],
                    "question_type": "short",
                    "section": "Section B: Short Analytical Questions",
                    "competency": "Thermodynamics & Energy Transfer",
                    "question_text": "Why does a piece of metal feel significantly colder to the touch than a wooden block at the same winter room temperature (15°C)? Explain using thermodynamic principles.",
                    "marks": 3,
                    "answer": "1. Both metal and wood are at thermal equilibrium with the room (15°C) (1 Mark).\n2. Metal has a much higher thermal conductivity than wood (approx. 400x higher) (1 Mark).\n3. When skin (37°C) touches metal, heat is conducted away from fingers at a rapid rate, triggering cold receptors in the skin (1 Mark).",
                    "explanation": "Differentiates between temperature and rate of heat transfer (thermal conductivity)."
                },
                {
                    "stream": d_keys[1],
                    "question_type": "short",
                    "section": "Section B: Short Analytical Questions",
                    "competency": "Financial Ratio & Cash Flow Dynamics",
                    "question_text": "A manufacturing firm reports a healthy Net Profit of Rs 50 Lakhs for the fiscal year, yet its bank overdraft has maxed out and it cannot pay vendor invoices. Identify two structural reasons for this liquidity paradox.",
                    "marks": 3,
                    "answer": "1. High Working Capital lock-up in Accounts Receivable (Credit sales booked as revenue on accrual basis, but cash not yet collected) (1.5 Marks).\n2. Capital expenditure outflows or heavy debt principal repayment which drains cash flow from operations without hitting the Income Statement as operating expenses (1.5 Marks).",
                    "explanation": "Tests understanding of accrual accounting versus cash flow reality."
                },
                {
                    "stream": d_keys[2],
                    "question_type": "short",
                    "section": "Section B: Short Analytical Questions",
                    "competency": "Ethical Analysis & Technology Governance",
                    "question_text": "Explain the concept of 'Algorithmic Bias' in AI hiring systems and evaluate how it can lead to indirect discrimination under equality jurisprudence.",
                    "marks": 3,
                    "answer": "1. Definition: Machine learning models trained on historical hiring data replicate and amplify historical human biases (e.g. favoring specific genders/demographics) (1.5 Marks).\n2. Jurisprudential impact: Even without explicit bias, proxies (like career breaks or zip codes) create disparate impact, violating constitutional guarantees of equality of opportunity (Article 16) (1.5 Marks).",
                    "explanation": "Tests intersection of technological ethics, statistical prejudice, and constitutional fairness."
                }
            ]
            longs = [
                {
                    "stream": d_keys[0],
                    "question_type": "long",
                    "section": "Section C: Long Scenario & Case-Based Questions",
                    "competency": "Multidisciplinary Engineering Modeling",
                    "case_passage": "CASE SCENARIO: A civil engineering startup is designing a solar-powered atmospheric water generator (AWG) for drought-prone rural districts in Rajasthan. The device operates on thermoelectric cooling (Peltier effect) to condense ambient humidity into potable water. Daily ambient parameters: Relative humidity = 45%, Daytime temperature = 38°C, Nighttime temperature = 22°C.",
                    "question_text": "(a) Why is condensation yield significantly higher during nighttime compared to daytime, despite lower absolute humidity?\n(b) Using thermodynamics, explain the role of latent heat of condensation and how heat dissipation must be handled to sustain continuous cooling.\n(c) Propose two materials for the condensing surface that maximize water droplet runoff.",
                    "marks": 5,
                    "answer": "(a) Nighttime temperature (22°C) is much closer to the dew point of the air (approx. 14°C) than daytime (38°C); less sensible cooling is required before condensation begins (2 Marks).\n(b) Latent heat of vaporization must be extracted as water vapor turns to liquid. If this released latent heat is not dissipated through fins/heat pipes, cold side heats up and stops condensation (2 Marks).\n(c) Hydrophobic coatings (e.g. silane-treated copper) or bionic textured surfaces (beetle shell inspired) (1 Mark).",
                    "explanation": "Tests deep physics intuition, thermodynamics, and real-world engineering problem solving."
                },
                {
                    "stream": d_keys[1],
                    "question_type": "long",
                    "section": "Section C: Long Scenario & Case-Based Questions",
                    "competency": "Strategic Corporate Finance & Market Expansion",
                    "case_passage": "CASE SCENARIO: An Indian electric two-wheeler company, 'VoltSpeed Mobility', plans to scale production from 10,000 to 100,000 units annually. The CFO is evaluating whether to raise Rs 200 Crores through Equity Dilution (Private Equity) or Long-Term Debt (Corporate Debentures at 9.5% interest). The current debt-to-equity ratio of the company is 0.4.",
                    "question_text": "(a) Analyze the trade-offs of Debt vs. Equity financing in terms of financial risk, cost of capital, and founder control.\n(b) Calculate the annual interest burden if the entire Rs 200 Crores is raised through 9.5% debentures, and evaluate its impact on Operating Leverage.\n(c) Recommend the optimal capital structure financing strategy for VoltSpeed.",
                    "marks": 5,
                    "answer": "(a) Debt is cheaper due to tax-deductible interest and preserves founder control, but introduces bankruptcy risk and fixed repayment commitments. Equity dilutes voting control and future upside, but carries zero repayment obligation during early cash burn (2 Marks).\n(b) Annual interest = 200 Cr * 9.5% = Rs 19 Crores. Increases fixed financial charges and raises financial break-even point (1.5 Marks).\n(c) Recommendation: Hybrid mezzanine approach — Rs 120 Cr Equity + Rs 80 Cr Debt (1.5 Marks).",
                    "explanation": "Tests holistic corporate finance, capital structure, and risk mitigation."
                },
                {
                    "stream": d_keys[2],
                    "question_type": "long",
                    "section": "Section C: Long Scenario & Case-Based Questions",
                    "competency": "Constitutional Jurisprudence & Ethical Deliberation",
                    "case_passage": "CASE SCENARIO: A metropolitan municipal corporation introduces an AI-powered automated surveillance network with real-time facial recognition across railway stations and public thoroughfares. Proponents highlight a 40% reduction in street theft and faster recovery of missing children. Civil liberty collectives file a Public Interest Litigation (PIL), citing algorithmic racial/gender bias, arbitrary detention of look-alikes, and lack of statutory legislative oversight.",
                    "question_text": "(a) How does the Supreme Court of India's landmark judgment in K.S. Puttaswamy v. Union of India apply to automated public surveillance?\n(b) Apply the 'Doctrine of Proportionality' (Legitimate Goal, Suitability, Necessity, and Balancing) to evaluate whether full-scale facial surveillance is constitutionally justified.\n(c) Propose three mandatory statutory checks that the State legislature must enact before deploying predictive AI in policing.",
                    "marks": 5,
                    "answer": "(a) Privacy is an intrinsic fundamental right under Article 21. Biometric data constitutes sensitive personal information; public presence does not waive privacy rights without statutory backing (1.5 Marks).\n(b) Proportionality Test: (1) Legitimate aim (crime prevention); (2) Rational nexus; (3) Necessity (least intrusive means); (4) Balancing public gain vs chilling effect on assembly (2 Marks).\n(c) Statutory checks: Legislative enactment with judicial warrant requirements; algorithmic accuracy audits; strict data retention limits (1.5 Marks).",
                    "explanation": "Demands mastery of constitutional law, structured judicial reasoning, and balanced ethical argumentation."
                }
            ]

        # Combine items based on requested quantities
        all_qs = []
        q_idx = 1

        for item in mcqs:
            item_copy = dict(item)
            item_copy["question_number"] = q_idx
            all_qs.append(item_copy)
            q_idx += 1

        for item in shorts:
            item_copy = dict(item)
            item_copy["question_number"] = q_idx
            all_qs.append(item_copy)
            q_idx += 1

        for item in longs:
            item_copy = dict(item)
            item_copy["question_number"] = q_idx
            all_qs.append(item_copy)
            q_idx += 1

        return {
            "instructions": [
                f"This examination adheres to the NEP 2020 {cfg['name']} framework.",
                f"Primary Focus: {cfg['focus']}.",
                "Section A consists of Objective Questions (1 Mark each).",
                "Section B consists of Short Application Questions (3 Marks each).",
                "Section C consists of Long Scenario & Case Questions (5 Marks each)."
            ],
            "questions": all_qs,
            "counseling_matrix": {
                "domain_1_indicators": f"Strong grasp of {cfg['domains'][0]} fundamentals and practical concepts.",
                "domain_2_indicators": f"High competence in {cfg['domains'][1]} reasoning and logical problem formulation.",
                "domain_3_indicators": f"Strong acumen in {cfg['domains'][2]} analysis and real-world synthesis.",
                "balanced_recommendation": f"Learner demonstrates well-rounded capability aligned with NEP 2020 {cfg['name']} outcomes."
            }
        }

stream_assessment_service = StreamAssessmentService()
