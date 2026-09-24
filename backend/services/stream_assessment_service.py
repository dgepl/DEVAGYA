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

class StreamAssessmentService:
    """
    Dedicated AI Engine for Class 11-12 Stream Selection & Aptitude Diagnostic Examination.
    Evaluates aptitude across Science (STEM), Commerce & Finance, and Humanities & Social Sciences.
    """

    async def generate_assessment(self, req: StreamAssessmentRequest) -> StreamAssessmentResponse:
        n_mcq = max(2, min(req.num_mcqs_per_stream or 4, 10))
        n_short = max(1, min(req.num_short_per_stream or 2, 5))
        n_long = max(1, min(req.num_long_per_stream or 1, 3))

        total_questions = (n_mcq + n_short + n_long) * 3
        # 1 mark per MCQ, 3 marks per Short, 5 marks per Long
        marks_per_stream = (n_mcq * 1) + (n_short * 3) + (n_long * 5)
        total_marks = marks_per_stream * 3

        prompt = f"""You are the Chief Academic Psychometrician and CBSE Senior Curriculum Specialist for DEVGYA Global Edutech.
Generate a comprehensive, high-validity Class 11-12 (and Class 10 Transition) Stream Suitability & Aptitude Diagnostic Assessment Paper.

The goal is to help the school administration, academic counselors, and parents discover whether the student has the highest natural aptitude and cognitive alignment for:
1. SCIENCE (STEM - Physics, Chemistry, Biology/Mathematics, scientific inquiry, quantitative logic)
2. COMMERCE (Economics, Financial logic, Business acumen, Market dynamics, resource allocation)
3. HUMANITIES (Critical thinking, Social Sciences, Civics/Law, Ethics, Linguistic depth & Argumentation)

CONFIGURATION:
- Class / Cohort: {req.class_name}
- School Name: {req.school_name}
- Difficulty Level: {req.difficulty}
- Time Allowed: {req.time_allowed_mins} minutes
- MCQ Questions per stream: {n_mcq} (1 mark each)
- Short Answer Questions per stream: {n_short} (3 marks each)
- Long Answer / Case Questions per stream: {n_long} (5 marks each)
- Additional School Notes: {req.custom_instructions or "Align with CBSE/NCERT and NEP 2020 competency-based evaluation standards."}

MANDATORY INSTRUCTIONS:
1. Generate EXACTLY {n_mcq * 3} MCQs (Section A: {n_mcq} Science, {n_mcq} Commerce, {n_mcq} Humanities).
   Each MCQ must have 4 clear options labelled ["(A) ...", "(B) ...", "(C) ...", "(D) ..."], correct answer, explanation, and competency tested.
2. Generate EXACTLY {n_short * 3} Short Questions (Section B: {n_short} Science, {n_short} Commerce, {n_short} Humanities, 3 marks each).
   Must test analytical thinking, problem formulation, and real-world application. Provide model answer and marking points.
3. Generate EXACTLY {n_long * 3} Long Answer / Case-Based Questions (Section C: {n_long} Science, {n_long} Commerce, {n_long} Humanities, 5 marks each).
   Include a realistic scenario or case passage, followed by sub-prompts testing depth, multi-angle reasoning, and synthesis.

OUTPUT FORMAT REQUIREMENTS:
Return ONLY valid JSON matching this schema:
{{
  "instructions": [
    "This diagnostic assessment evaluates your cognitive strengths across Science, Commerce, and Humanities.",
    "Attempt questions in all three sections to obtain an accurate stream aptitude profile.",
    "Calculators and external aids are not permitted unless specified.",
    "Write structured, legible responses for short and long answer questions."
  ],
  "questions": [
    {{
      "question_number": 1,
      "stream": "science", // must be "science", "commerce", or "humanities"
      "question_type": "mcq", // "mcq", "short", or "long"
      "section": "Section A: Objective & Aptitude MCQs",
      "competency": "Scientific Inquiry & Empirical Reasoning",
      "question_text": "A stone is thrown vertically upward with velocity v...",
      "options": ["(A) ...", "(B) ...", "(C) ...", "(D) ..."], // required for mcq
      "marks": 1,
      "answer": "(B) ...",
      "explanation": "Because kinetic energy transforms into gravitational potential..."
    }},
    {{
      "question_number": 13,
      "stream": "commerce",
      "question_type": "short",
      "section": "Section B: Short Analytical Questions",
      "competency": "Economic Intuition & Resource Allocation",
      "question_text": "Explain why a sudden spike in fuel prices leads to cost-push inflation...",
      "marks": 3,
      "answer": "Model answer: 1. Increased transportation costs... 2. Supply curve shifts left...",
      "explanation": "Tests comprehension of macro-economic shocks and price mechanics."
    }},
    {{
      "question_number": 19,
      "stream": "humanities",
      "question_type": "long",
      "section": "Section C: Long Scenario & Case-Based Questions",
      "competency": "Critical Ethics & Constitutional Perspective",
      "case_passage": "Context: Rapid development of facial recognition technology in public spaces...",
      "question_text": "Analyze the tension between individual privacy rights and public surveillance. In your answer, propose three policy guardrails.",
      "marks": 5,
      "answer": "Evaluation Rubric: 1. Identification of Article 21/Privacy landmark judgments (2 marks)... 2. Proportionality test analysis (2 marks)... 3. Concrete safeguards (1 mark).",
      "explanation": "Assesses argumentative nuance, constitutional awareness, and ethical balance."
    }}
  ],
  "counseling_matrix": {{
    "science_indicators": "Score >= 75% indicates high suitability for PCM/PCB, Engineering, Medicine, Pure Sciences, and AI/Robotics. Focus on mathematical rigor and experimental hypothesis testing.",
    "commerce_indicators": "Score >= 75% indicates exceptional acumen for Chartered Accountancy (CA), Economics (Hons), Corporate Finance, FinTech, and Business Analytics.",
    "humanities_indicators": "Score >= 75% indicates stellar aptitude for Law (CLAT), Civil Services (UPSC), Public Policy, International Relations, Journalism, and Behavioral Psychology.",
    "balanced_recommendation": "Students scoring balanced high marks across two or more streams are prime candidates for interdisciplinary programs such as Economics with Mathematics, Cognitive Science, or Legal Tech."
  }}
}}"""

        try:
            logger.info("Calling AI provider for Stream Assessment generation...")
            messages = [
                {
                    "role": "system",
                    "content": "You are DEVGYA's Master Stream Psychometric Assessor. Always output strict, valid JSON with curriculum-accurate CBSE questions."
                },
                {"role": "user", "content": prompt}
            ]
            raw_response = await ai_provider.chat_completion(
                messages=messages,
                temperature=0.35,
                max_tokens=4000,
                response_format_json=True
            )
            parsed = self._parse_json_response(raw_response)
            if parsed and parsed.get("questions"):
                return self._build_response(req, parsed, total_marks)
        except Exception as e:
            logger.error(f"AI Provider error during stream assessment generation: {e}")

        # Fallback generator to guarantee reliable response
        logger.warning("Using built-in high-quality CBSE stream assessment synthesis fallback.")
        fallback_data = self._generate_fallback_data(req, n_mcq, n_short, n_long)
        return self._build_response(req, fallback_data, total_marks)

    def _parse_json_response(self, raw: str) -> Optional[Dict[str, Any]]:
        cleaned = _clean_json_str(raw)
        try:
            return json.loads(cleaned)
        except Exception:
            # Try regex extraction
            match = re.search(r'\{.*\}', cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except Exception:
                    pass
        return None

    def _build_response(self, req: StreamAssessmentRequest, data: Dict[str, Any], calculated_total_marks: int) -> StreamAssessmentResponse:
        raw_questions = data.get("questions") or []
        clean_questions: List[QuestionItem] = []

        q_id = 1
        for q in raw_questions:
            stream = str(q.get("stream") or "science").lower()
            if stream not in ("science", "commerce", "humanities"):
                stream = "science"
            q_type = str(q.get("question_type") or "mcq").lower()
            if q_type not in ("mcq", "short", "long"):
                q_type = "mcq"

            marks = int(q.get("marks") or (1 if q_type == "mcq" else 3 if q_type == "short" else 5))
            section = str(q.get("section") or (
                "Section A: Objective & Aptitude MCQs" if q_type == "mcq" else
                "Section B: Short Analytical Questions" if q_type == "short" else
                "Section C: Long Scenario & Case-Based Questions"
            ))

            clean_questions.append(QuestionItem(
                id=q_id,
                question_number=q_id,
                question_type=q_type,
                question_text=str(q.get("question_text") or f"Assessment question #{q_id}"),
                marks=marks,
                options=q.get("options") if q_type == "mcq" else None,
                case_passage=q.get("case_passage"),
                answer=str(q.get("answer") or "Refer to evaluation scheme."),
                explanation=q.get("explanation"),
                stream=stream,
                competency=str(q.get("competency") or f"{stream.capitalize()} Aptitude"),
                section=section
            ))
            q_id += 1

        actual_total_marks = sum(q.marks for q in clean_questions) or calculated_total_marks

        # Stream breakdowns
        science_qs = [q for q in clean_questions if q.stream == "science"]
        commerce_qs = [q for q in clean_questions if q.stream == "commerce"]
        humanities_qs = [q for q in clean_questions if q.stream == "humanities"]

        stream_breakdown = [
            StreamBreakdown(
                stream="science",
                stream_name="Science (STEM)",
                mcq_count=sum(1 for q in science_qs if q.question_type == "mcq"),
                short_count=sum(1 for q in science_qs if q.question_type == "short"),
                long_count=sum(1 for q in science_qs if q.question_type == "long"),
                total_marks=sum(q.marks for q in science_qs),
                key_competencies=["Empirical Inquiry", "Mathematical Modeling", "Physics & Dynamics Logic", "Chemical Systems"]
            ),
            StreamBreakdown(
                stream="commerce",
                stream_name="Commerce & Finance",
                mcq_count=sum(1 for q in commerce_qs if q.question_type == "mcq"),
                short_count=sum(1 for q in commerce_qs if q.question_type == "short"),
                long_count=sum(1 for q in commerce_qs if q.question_type == "long"),
                total_marks=sum(q.marks for q in commerce_qs),
                key_competencies=["Financial Numeracy", "Market Dynamics", "Business Acumen", "Cost-Benefit Optimization"]
            ),
            StreamBreakdown(
                stream="humanities",
                stream_name="Humanities & Social Sciences",
                mcq_count=sum(1 for q in humanities_qs if q.question_type == "mcq"),
                short_count=sum(1 for q in humanities_qs if q.question_type == "short"),
                long_count=sum(1 for q in humanities_qs if q.question_type == "long"),
                total_marks=sum(q.marks for q in humanities_qs),
                key_competencies=["Critical Thinking", "Constitutional Reasoning", "Ethical Evaluation", "Socio-Historical Analysis"]
            ),
        ]

        instructions = data.get("instructions") or [
            "This diagnostic evaluation is engineered to map student cognitive affinity across Science, Commerce, and Humanities.",
            "All three sections carry equal importance. Candidates should attempt every question with full effort.",
            "Section A contains Objective MCQs (1 Mark each). Select the single most accurate option.",
            "Section B contains Short Analytical Questions (3 Marks each). Provide structured, logical explanations.",
            "Section C contains Long Scenario-Based Questions (5 Marks each). Demonstrate depth, cause-effect, and synthesis.",
            "Electronic gadgets and calculators are strictly prohibited unless authorized."
        ]

        diagnostic_matrix = data.get("counseling_matrix") or {
            "science_indicators": "Score >= 75%: Exceptional aptitude for PCM/PCB, Engineering, Medicine, Pure Mathematics, and AI. High capacity for abstract symbolic logic and empirical verification.",
            "commerce_indicators": "Score >= 75%: Strong aptitude for Chartered Accountancy (CA), Corporate Finance, Economics, CFA, and Entrepreneurship. High grasp of numerical trade-offs and market trends.",
            "humanities_indicators": "Score >= 75%: Outstanding suitability for Law (CLAT), Civil Services (UPSC), Public Administration, International Relations, Journalism, and Psychology. High expressive depth and ethical evaluation.",
            "balanced_recommendation": "Candidates showing high dual affinities should consider cross-stream combinations: Economics + Mathematics (Commerce/Science interface), or Law + Public Policy (Humanities/Commerce interface)."
        }

        return StreamAssessmentResponse(
            id=f"stream-assess-{int(datetime.now().timestamp())}",
            title=req.title or "Class 11-12 Stream Selection & Aptitude Diagnostic Assessment",
            class_name=req.class_name,
            subject="Stream Aptitude Evaluation (Science • Commerce • Humanities)",
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

    def _generate_fallback_data(self, req: StreamAssessmentRequest, n_mcq: int, n_short: int, n_long: int) -> Dict[str, Any]:
        """Provides an authoritative, curriculum-verified fallback test paper."""
        science_mcqs = [
            {
                "stream": "science",
                "question_type": "mcq",
                "section": "Section A: Objective & Aptitude MCQs",
                "competency": "Physics & Mechanistic Logic",
                "question_text": "An electric vehicle decelerates uniformly from 72 km/h to rest over a distance of 40 meters on a horizontal track. If the mass of the vehicle is 1000 kg, what is the magnitude of the net retarding force exerted on it?",
                "options": ["(A) 2,500 N", "(B) 5,000 N", "(C) 7,200 N", "(D) 10,000 N"],
                "marks": 1,
                "answer": "(B) 5,000 N",
                "explanation": "72 km/h = 20 m/s. Using v² = u² + 2as -> 0 = 400 + 2(a)(40) -> a = -5 m/s². Force = m*a = 1000 * 5 = 5,000 N."
            },
            {
                "stream": "science",
                "question_type": "mcq",
                "section": "Section A: Objective & Aptitude MCQs",
                "competency": "Chemical Reaction Kinetics",
                "question_text": "In a closed reaction vessel, nitrogen dioxide (NO2, brown gas) exists in dynamic equilibrium with dinitrogen tetroxide (N2O4, colorless gas): 2NO2(g) <=> N2O4(g) + Heat. If the vessel is compressed to half its volume at constant temperature, what immediate change occurs?",
                "options": [
                    "(A) The mixture permanently becomes darker brown.",
                    "(B) Equilibrium shifts toward N2O4, decreasing the total moles of gas.",
                    "(C) Equilibrium shifts toward NO2 because pressure decreases.",
                    "(D) No shift occurs as equilibrium constant K increases with pressure."
                ],
                "marks": 1,
                "answer": "(B) Equilibrium shifts toward N2O4, decreasing the total moles of gas.",
                "explanation": "According to Le Chatelier's principle, increasing pressure (by halving volume) shifts the equilibrium towards the side with fewer moles of gas (from 2 moles NO2 to 1 mole N2O4)."
            },
            {
                "stream": "science",
                "question_type": "mcq",
                "section": "Section A: Objective & Aptitude MCQs",
                "competency": "Biological Cellular Systems & Genetics",
                "question_text": "In a cross between two heterozygous tall pea plants (Tt), what is the probability of producing an offspring that is phenotypically tall AND genotypically heterozygous?",
                "options": ["(A) 1/4 (25%)", "(B) 1/2 (50%)", "(C) 3/4 (75%)", "(D) 2/3 (66.7%)"],
                "marks": 1,
                "answer": "(B) 1/2 (50%)",
                "explanation": "Punnett square for Tt x Tt produces: 1 TT, 2 Tt, 1 tt. The probability of heterozygous (Tt) is 2/4 = 1/2 (50%)."
            },
            {
                "stream": "science",
                "question_type": "mcq",
                "section": "Section A: Objective & Aptitude MCQs",
                "competency": "Mathematical Analysis & Deduction",
                "question_text": "A population of beneficial soil bacteria doubles every 4 hours under optimal lab conditions. If an initial culture contains 5,000 bacteria, what will the population be after 24 hours?",
                "options": ["(A) 160,000", "(B) 320,000", "(C) 640,000", "(D) 1,280,000"],
                "marks": 1,
                "answer": "(B) 320,000",
                "explanation": "Number of doubling periods n = 24 / 4 = 6. Final population = 5,000 * 2^6 = 5,000 * 64 = 320,000."
            }
        ]

        commerce_mcqs = [
            {
                "stream": "commerce",
                "question_type": "mcq",
                "section": "Section A: Objective & Aptitude MCQs",
                "competency": "Microeconomics & Price Elasticity",
                "question_text": "When the price of organic milk rises from Rs 60 to Rs 75 per liter, the quantity demanded falls from 1,000 liters to 700 liters per week. What is the price elasticity of demand for this good?",
                "options": ["(A) -0.8 (Inelastic)", "(B) -1.0 (Unitary)", "(C) -1.2 (Elastic)", "(D) -1.5 (Elastic)"],
                "marks": 1,
                "answer": "(C) -1.2 (Elastic)",
                "explanation": "% Change in Q = (700-1000)/1000 = -30%. % Change in P = (75-60)/60 = +25%. Elasticity = -30% / 25% = -1.2."
            },
            {
                "stream": "commerce",
                "question_type": "mcq",
                "section": "Section A: Objective & Aptitude MCQs",
                "competency": "Financial Accounting Principles",
                "question_text": "A retail business purchased delivery machinery worth Rs 4,00,000 on credit. How does this transaction affect the Fundamental Accounting Equation (Assets = Liabilities + Owner's Equity)?",
                "options": [
                    "(A) Assets increase by Rs 4,00,000 and Liabilities increase by Rs 4,00,000.",
                    "(B) Assets increase by Rs 4,00,000 and Owner's Equity decreases by Rs 4,00,000.",
                    "(C) Assets remain unchanged because machinery and cash balance out.",
                    "(D) Liabilities increase while Owner's Equity increases equally."
                ],
                "marks": 1,
                "answer": "(A) Assets increase by Rs 4,00,000 and Liabilities increase by Rs 4,00,000.",
                "explanation": "Machinery (Asset) increases by Rs 4,00,000, and Accounts Payable/Creditors (Liability) increases by Rs 4,00,000. Equation balances."
            },
            {
                "stream": "commerce",
                "question_type": "mcq",
                "section": "Section A: Objective & Aptitude MCQs",
                "competency": "Business Management & Operations",
                "question_text": "A startup manufacturing eco-friendly bags has fixed operating costs of Rs 1,20,000 per month. Each bag sells for Rs 250 with a variable production cost of Rs 150. What is the monthly break-even sales volume?",
                "options": ["(A) 800 units", "(B) 1,000 units", "(C) 1,200 units", "(D) 1,500 units"],
                "marks": 1,
                "answer": "(C) 1,200 units",
                "explanation": "Contribution margin per unit = Selling Price - Variable Cost = 250 - 150 = Rs 100. Break-even volume = Fixed Cost / Contribution = 1,20,000 / 100 = 1,200 units."
            },
            {
                "stream": "commerce",
                "question_type": "mcq",
                "section": "Section A: Objective & Aptitude MCQs",
                "competency": "Monetary Economics & Banking",
                "question_text": "If the Reserve Bank of India (RBI) raises the Cash Reserve Ratio (CRR) from 4.5% to 5.5%, what primary macroeconomic effect is intended?",
                "options": [
                    "(A) Commercial banks will have more liquidity to disburse cheaper home loans.",
                    "(B) Money supply in the banking system contracts, helping curtail inflationary pressures.",
                    "(C) Commercial banks will immediately lower interest rates on consumer deposits.",
                    "(D) Government fiscal deficit will decrease proportionately."
                ],
                "marks": 1,
                "answer": "(B) Money supply in the banking system contracts, helping curtail inflationary pressures.",
                "explanation": "Higher CRR requires banks to hold a larger percentage of deposits with the RBI, reducing lendable liquidity and contracting credit expansion."
            }
        ]

        humanities_mcqs = [
            {
                "stream": "humanities",
                "question_type": "mcq",
                "section": "Section A: Objective & Aptitude MCQs",
                "competency": "Constitutional Law & Governance",
                "question_text": "Under the Indian Constitution, the power of 'Judicial Review' primarily empowers the Supreme Court and High Courts to:",
                "options": [
                    "(A) Direct the legislature on what annual budget to approve.",
                    "(B) Examine the constitutional validity of legislative enactments and executive orders.",
                    "(C) Supervise the day-to-day administrative postings of civil service officers.",
                    "(D) Pardon criminal offenses without reference to the President of India."
                ],
                "marks": 1,
                "answer": "(B) Examine the constitutional validity of legislative enactments and executive orders.",
                "explanation": "Judicial Review ensures laws and executive actions conform to constitutional principles, upholding the rule of law and the Basic Structure Doctrine."
            },
            {
                "stream": "humanities",
                "question_type": "mcq",
                "section": "Section A: Objective & Aptitude MCQs",
                "competency": "Historical Inquiry & Social Movements",
                "question_text": "Why did Mahatma Gandhi choose 'Salt' as the central symbol and rallying point for the 1930 Civil Disobedience Movement?",
                "options": [
                    "(A) Salt was the only commodity manufactured by the British Crown monopoly.",
                    "(B) Salt was a universal necessity used by every household across all castes, religions, and classes.",
                    "(C) Salt production in India was banned under the Regulating Act of 1773.",
                    "(D) British merchants were exporting 100% of Indian salt to European ports."
                ],
                "marks": 1,
                "answer": "(B) Salt was a universal necessity used by every household across all castes, religions, and classes.",
                "explanation": "Salt affected the poorest peasant and the wealthiest citizen equally, transforming an everyday necessity into a potent unifier against unfair colonial tax monopolies."
            },
            {
                "stream": "humanities",
                "question_type": "mcq",
                "section": "Section A: Objective & Aptitude MCQs",
                "competency": "Ethical Reasoning & Philosophy",
                "question_text": "In moral philosophy, the 'Utilitarian' framework evaluates whether an action or policy is ethical based primarily on:",
                "options": [
                    "(A) Whether it strictly adheres to immutable duties regardless of consequences.",
                    "(B) Whether it produces the greatest overall well-being and happiness for the greatest number of people.",
                    "(C) The personal virtuous character and intentions of the individual actor.",
                    "(D) Its conformity to ancient cultural traditions and written statutory statutes."
                ],
                "marks": 1,
                "answer": "(B) Whether it produces the greatest overall well-being and happiness for the greatest number of people.",
                "explanation": "Utilitarianism (Bentham, Mill) is a consequentialist framework judging moral rightness by net positive utility generated for society."
            },
            {
                "stream": "humanities",
                "question_type": "mcq",
                "section": "Section A: Objective & Aptitude MCQs",
                "competency": "Sociological Analysis & Demographics",
                "question_text": "According to the Demographic Transition Theory, when a developing nation experiences a rapid decline in death rates while birth rates remain stubbornly high, it experiences:",
                "options": [
                    "(A) Immediate population contraction and aging.",
                    "(B) A population explosion with a wide youthful base in the population pyramid.",
                    "(C) Negative net migration to neighboring countries.",
                    "(D) Equalization of urbanization rates across rural provinces."
                ],
                "marks": 1,
                "answer": "(B) A population explosion with a wide youthful base in the population pyramid.",
                "explanation": "Stage 2 of Demographic Transition involves declining mortality (due to healthcare/sanitation) while fertility remains high, leading to rapid population growth."
            }
        ]

        science_shorts = [
            {
                "stream": "science",
                "question_type": "short",
                "section": "Section B: Short Analytical Questions",
                "competency": "Scientific Modeling & Problem Solving",
                "question_text": "A solar panel installation at a school generates 4.8 kWh of energy daily. If the school converts to 10W LED fixtures that operate for 8 hours every day, calculate the maximum number of LED fixtures the solar panel can sustain continuously. State one real-world energy transmission factor that would reduce this number.",
                "marks": 3,
                "answer": "1. Daily energy consumption per 10W LED = 10W * 8 hours = 80 Wh = 0.08 kWh.\n2. Total LEDs sustained = 4.8 kWh / 0.08 kWh = 60 fixtures.\n3. Real-world loss factor: Inverter efficiency losses, battery charging resistance, or dust accumulation on solar panel glass (typically 15-20% derating).",
                "explanation": "Evaluates unit conversion, energy arithmetic, and practical engineering constraints."
            },
            {
                "stream": "science",
                "question_type": "short",
                "section": "Section B: Short Analytical Questions",
                "competency": "Empirical Hypothesis Testing",
                "question_text": "A student claims that hot water freezes faster than cold water (the Mpemba effect) because dissolved gases escape during heating. Design a brief scientific experiment (with control variables, independent variable, and measurement criteria) to rigorously test this hypothesis.",
                "marks": 3,
                "answer": "1. Independent Variable: Initial water temperature (e.g., 20°C vs 80°C) with identical water sources (1 Mark).\n2. Control Variables: Equal water volume, identical container material/geometry, identical freezer temperature (-18°C) (1 Mark).\n3. Measurement & Verification: Record time until initial crystallization using digital thermistors; degas one sample to isolate the dissolved gas variable (1 Mark).",
                "explanation": "Assesses experimental methodology, control variable design, and scientific rigor."
            }
        ]

        commerce_shorts = [
            {
                "stream": "commerce",
                "question_type": "short",
                "section": "Section B: Short Analytical Questions",
                "competency": "Managerial Economics & Trade-off Analysis",
                "question_text": "An artisanal bakery has a choice: invest Rs 2,00,000 in an automated dough mixer to double output and reduce labor, or spend the same Rs 2,00,000 on digital marketing to attract corporate catering orders. Explain the concept of 'Opportunity Cost' in this scenario, and list two financial indicators the owner should evaluate before deciding.",
                "marks": 3,
                "answer": "1. Opportunity Cost Concept: Choosing the dough mixer means giving up the immediate catering revenue gains from digital marketing (and vice-versa) — the value of the next best alternative forgone (1 Mark).\n2. Two Key Financial Indicators: (a) Return on Investment (ROI) / Payback period for both alternatives; (b) Net Present Value (NPV) or capacity utilization constraint of the bakery (2 Marks).",
                "explanation": "Tests comprehension of fundamental economic decision-making and business finance metrics."
            },
            {
                "stream": "commerce",
                "question_type": "short",
                "section": "Section B: Short Analytical Questions",
                "competency": "Financial Ratio Analysis & Liquidity",
                "question_text": "Company A has a Current Ratio of 2.5:1, while Company B has a Current Ratio of 0.9:1. Explain which company is in a safer short-term financial position, and describe one danger of having an excessively high Current Ratio (e.g. 5:1).",
                "marks": 3,
                "answer": "1. Safer Position: Company A (2.5:1) has Rs 2.50 of liquid current assets for every Rs 1.00 of immediate debt, whereas Company B (0.9:1) faces liquidity distress (1.5 Marks).\n2. Danger of Excessively High Ratio: Indicates inefficient capital management — excess idle cash or slow-moving unsellable inventory earning zero return instead of being reinvested for growth (1.5 Marks).",
                "explanation": "Evaluates balance sheet interpretation, liquidity risk, and capital efficiency."
            }
        ]

        humanities_shorts = [
            {
                "stream": "humanities",
                "question_type": "short",
                "section": "Section B: Short Analytical Questions",
                "competency": "Policy Critique & Socio-Economic Analysis",
                "question_text": "Evaluate the difference between 'Economic Growth' (measured by GDP expansion) and 'Human Development' (measured by HDI). Why can a country achieve high GDP growth while showing poor rankings on the Human Development Index?",
                "marks": 3,
                "answer": "1. Distinction: GDP measures quantitative aggregate output of goods/services; HDI measures qualitative well-being including life expectancy, literacy, and standard of living (1 Mark).\n2. Divergence Explanation: GDP gains can concentrate among a narrow elite (wealth inequality), leaving healthcare, public schools, gender empowerment, and clean water underfunded (2 Marks).",
                "explanation": "Assesses conceptual depth regarding distributive justice, quality of life metrics, and public policy."
            },
            {
                "stream": "humanities",
                "question_type": "short",
                "section": "Section B: Short Analytical Questions",
                "competency": "Media Literacy & Critical Discourse",
                "question_text": "In contemporary media analysis, define what is meant by an 'Echo Chamber' and an 'Algorithmic Filter Bubble'. How do these phenomena affect democratic debate and civil political discourse?",
                "marks": 3,
                "answer": "1. Definition: Algorithms curate content matching user preferences, reinforcing prior beliefs and insulating individuals from differing perspectives (1.5 Marks).\n2. Impact on Democratic Debate: Increases political polarization, creates mutual distrust, erodes consensus-building, and fosters misinformation vulnerability (1.5 Marks).",
                "explanation": "Tests analytical understanding of digital communication, media ethics, and societal cohesion."
            }
        ]

        science_longs = [
            {
                "stream": "science",
                "question_type": "long",
                "section": "Section C: Long Scenario & Case-Based Questions",
                "competency": "Technological Synthesis & Systematic Engineering",
                "case_passage": "CASE SCENARIO: A coastal township experiences recurring drinking water contamination and erratic electrical supply. The municipal council plans to deploy a containerized solar-powered Reverse Osmosis (RO) desalination unit to treat brackish groundwater. The unit requires 3 kW continuous power for 10 hours daily. However, high membrane fouling due to calcium carbonate precipitation reduces flow rates by 30% after two weeks of operation.",
                "question_text": "Answer the following three multi-disciplinary engineering questions:\n(a) Propose two chemical or physical pre-treatment techniques to prevent calcium carbonate scale on the RO membrane.\n(b) If the groundwater has a Total Dissolved Solids (TDS) of 2,400 ppm and the RO unit has an 85% salt rejection rate, calculate the product water TDS. Is it potable per WHO standards (<500 ppm)?\n(c) Suggest a sustainable disposal method for the concentrated brine reject to avoid salinizing local agricultural fields.",
                "marks": 5,
                "answer": "Model Solution & Rubric:\n(a) Pre-treatment (1.5 Marks): Acid dosing (adding HCl/H2SO4 to lower pH and keep CaCO3 soluble) OR installing ion-exchange water softening / anti-scalant phosphonate poly-electrolytes.\n(b) TDS Calculation (2 Marks): Salt remaining = 100% - 85% = 15%. Product TDS = 2,400 ppm * 0.15 = 360 ppm. Yes, 360 ppm is well below the WHO threshold of 500 ppm, making it safe and palatable for drinking.\n(c) Brine Reject Disposal (1.5 Marks): Solar evaporation pans to harvest commercial industrial salt, deep-well injection below impermeable aquifers, or high-recovery mechanical vapor recompression.",
                "explanation": "Comprehensive test of stoichiometry, numerical proportion calculation, and environmental technological application."
            }
        ]

        commerce_longs = [
            {
                "stream": "commerce",
                "question_type": "long",
                "section": "Section C: Long Scenario & Case-Based Questions",
                "competency": "Strategic Business Planning & Market Entry",
                "case_passage": "CASE SCENARIO: 'NovaWheels', a homegrown Indian startup, has engineered an affordable electric bicycle targeting college students and urban commuters. Manufacturing cost per cycle is Rs 18,000. Competitor imports sell at Rs 32,000, while traditional gear bicycles sell at Rs 9,000. NovaWheels has a seed capital of Rs 50 Lakhs and must decide between an Online Direct-to-Consumer (D2C) model or partnering with established brick-and-mortar bicycle dealership chains across Tier-1 cities.",
                "question_text": "As a business strategy consultant, structure a comprehensive advisory report:\n(a) Recommend either 'Penetration Pricing' or 'Skimming Pricing' for NovaWheels, stating two clear commercial justifications.\n(b) Compare the D2C channel versus Dealership distribution across working capital requirement and customer brand trust.\n(c) Identify two regulatory incentives under India's EV / FAME policy framework that NovaWheels can leverage to lower consumer prices.",
                "marks": 5,
                "answer": "Evaluation Scheme & Rubric:\n(a) Pricing Strategy (1.5 Marks): Recommend Penetration Pricing (e.g. Rs 24,000). Justification: Lowers switching barrier from traditional bikes; creates rapid network adoption in price-sensitive student market; builds early market share before established brands respond.\n(b) Distribution Channel Comparison (2 Marks): D2C preserves 20-30% retail margin and provides direct customer telemetry, but requires heavy ad spend and upfront shipping logistics. Dealerships provide immediate consumer test rides and trust, but demand 15-25% dealer cuts and tie up inventory on credit.\n(c) Government Incentives (1.5 Marks): Demand subsidies under State EV policies (road tax exemption, registration waivers), GST reduced to 5% on EVs, and PLI scheme manufacturing credits.",
                "explanation": "Tests holistic business acumen, pricing models, supply chain logistics, and real-world commercial strategy."
            }
        ]

        humanities_longs = [
            {
                "stream": "humanities",
                "question_type": "long",
                "section": "Section C: Long Scenario & Case-Based Questions",
                "competency": "Constitutional Jurisprudence & Ethical Deliberation",
                "case_passage": "CASE SCENARIO: A metropolitan municipal corporation introduces an AI-powered automated surveillance network with real-time facial recognition across railway stations and public thoroughfares. Proponents highlight a 40% reduction in street theft and faster recovery of missing children. Civil liberty collectives file a Public Interest Litigation (PIL), citing algorithmic racial/gender bias, arbitrary detention of look-alikes, and lack of statutory legislative oversight.",
                "question_text": "Write a structured judicial deliberation addressing the following three questions:\n(a) How does the Supreme Court of India's landmark judgment in K.S. Puttaswamy v. Union of India (Right to Privacy) apply to automated public surveillance?\n(b) Apply the 'Doctrine of Proportionality' (Legitimate Goal, Suitability, Necessity, and Balancing) to evaluate whether full-scale facial surveillance is constitutionally justified.\n(c) Propose three mandatory statutory checks that the State legislature must enact before deploying predictive AI in policing.",
                "marks": 5,
                "answer": "Model Solution & Rubric:\n(a) Privacy Application (1.5 Marks): Puttaswamy declared privacy an intrinsic fundamental right under Article 21. Facial biometric data constitutes sensitive personal informational privacy; public presence does not waive privacy rights without lawful consent or statutory backing.\n(b) Proportionality Test (2 Marks): (1) Legitimate State Aim: Crime prevention and safety (Satisfied). (2) Rational Nexus: Technology aids surveillance (Satisfied). (3) Necessity: Are less intrusive measures available? (Contested). (4) Balancing: Does public safety gain outweigh chilling effect on freedom of assembly (Article 19) and biometric vulnerability? (Crucial friction).\n(c) Statutory Guardrails (1.5 Marks): (1) Clear legislative enactment with judicial warrant requirements; (2) Independent audit of algorithmic error rates; (3) Strict data retention limits (deletion of non-flagged feeds within 48 hours).",
                "explanation": "Demands mastery of constitutional law, structured judicial reasoning, and balanced ethical argumentation."
            }
        ]

        # Combine selected quantities
        all_qs = (
            science_mcqs[:n_mcq] +
            commerce_mcqs[:n_mcq] +
            humanities_mcqs[:n_mcq] +
            science_shorts[:n_short] +
            commerce_shorts[:n_short] +
            humanities_shorts[:n_short] +
            science_longs[:n_long] +
            commerce_longs[:n_long] +
            humanities_longs[:n_long]
        )

        return {
            "instructions": [
                "This diagnostic evaluation is engineered to map student cognitive affinity across Science, Commerce, and Humanities.",
                "All three sections carry equal importance. Candidates should attempt every question with full effort.",
                "Section A contains Objective MCQs (1 Mark each). Select the single most accurate option.",
                "Section B contains Short Analytical Questions (3 Marks each). Provide structured, logical explanations.",
                "Section C contains Long Scenario-Based Questions (5 Marks each). Demonstrate depth, cause-effect, and synthesis.",
                "Electronic gadgets and calculators are strictly prohibited unless authorized."
            ],
            "questions": all_qs,
            "counseling_matrix": {
                "science_indicators": "Score >= 75%: Exceptional aptitude for PCM/PCB, Engineering, Medicine, Pure Mathematics, and AI. High capacity for abstract symbolic logic and empirical verification.",
                "commerce_indicators": "Score >= 75%: Strong aptitude for Chartered Accountancy (CA), Corporate Finance, Economics, CFA, and Entrepreneurship. High grasp of numerical trade-offs and market trends.",
                "humanities_indicators": "Score >= 75%: Outstanding suitability for Law (CLAT), Civil Services (UPSC), Public Administration, International Relations, Journalism, and Psychology. High expressive depth and ethical evaluation.",
                "balanced_recommendation": "Candidates showing high dual affinities should consider cross-stream combinations: Economics + Mathematics (Commerce/Science interface), or Law + Public Policy (Humanities/Commerce interface)."
            }
        }

stream_assessment_service = StreamAssessmentService()
