import json
import logging
from typing import List
from groq import Groq
from config import settings
from schemas.question import GeneratePaperRequest, GeneratedPaperResponse, QuestionItem

logger = logging.getLogger("groq_service")

class GroqAIService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = Groq(api_key=self.api_key) if self.api_key else None

    async def generate_question_paper(self, req: GeneratePaperRequest) -> GeneratedPaperResponse:
        if self.client:
            try:
                prompt = f"""
You are a Senior CBSE & NCERT Subject Matter Expert & Master Teacher.
Generate an official high-quality NCERT-aligned Question Paper based on these exact constraints:

School Name: {req.school_name}
Class: {req.class_name}
Subject: {req.subject}
Chapter: {req.chapter}
Difficulty: {req.difficulty}
Total Marks: {req.total_marks}
Time Allowed: {req.time_allowed_mins} minutes

Question Breakdown:
- Multiple Choice Questions (MCQs): {req.num_mcqs} (1 mark each)
- Short Answer Questions: {req.num_short} (3 marks each)
- Long Answer Questions: {req.num_long} (5 marks each)
- Case Study / Passage Based: {req.num_case_studies} (4 marks each)

Custom Instructions: {req.custom_instructions or "Focus on core NCERT concepts, high HOTS questions."}

You MUST respond strictly with a JSON object in the following format (no markdown surrounding, no preamble):
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
    "The question paper consists of 4 sections: Section A, B, C, and D.",
    "Section A contains MCQs of 1 mark each.",
    "Section B contains Short Answer questions of 3 marks each.",
    "Section C contains Long Answer questions of 5 marks each.",
    "Section D contains Case Study questions of 4 marks each."
  ],
  "questions": [
    {{
      "id": 1,
      "question_number": 1,
      "question_type": "mcq",
      "question_text": "Sample MCQ question text?",
      "marks": 1,
      "options": ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"],
      "answer": "(A) Option 1",
      "explanation": "Detailed explanation based on NCERT textbook."
    }}
  ],
  "school_name": "{req.school_name}"
}}
"""
                response = self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You are a specialized AI JSON question paper generator for Indian Schools."},
                        {"role": "user", "content": prompt}
                    ],
                    model=settings.GROQ_MODEL,
                    response_format={"type": "json_object"},
                    temperature=0.4
                )
                
                raw_text = response.choices[0].message.content
                data = json.loads(raw_text)
                return GeneratedPaperResponse(**data)
            except Exception as e:
                logger.error(f"Groq API error, falling back to intelligent synthesizer: {e}")

        # Intelligent Fallback Synthesizer for demo / offline mode
        return self._generate_fallback_paper(req)

    def _generate_fallback_paper(self, req: GeneratePaperRequest) -> GeneratedPaperResponse:
        questions: List[QuestionItem] = []
        q_counter = 1

        # 1. MCQs
        mcq_templates = [
            ("Which of the following processes represents a chemical change?", ["(A) Rusting of iron", "(B) Melting of ice", "(C) Boiling of water", "(D) Dissolving salt in water"], "(A) Rusting of iron", "Rusting creates a new chemical compound (Hydrated Iron Oxide)."),
            ("What is the IUPAC name or formula corresponding to the primary reaction in this topic?", ["(A) CaCO3", "(B) CaO", "(C) Ca(OH)2", "(D) CaCl2"], "(A) CaCO3", "Calcium Carbonate is formed during lime water precipitation."),
            ("Identify the oxidizing agent in a standard redox reaction.", ["(A) Oxygen donor", "(B) Electron donor", "(C) Hydrogen donor", "(D) Proton acceptor"], "(A) Oxygen donor", "Substances that add oxygen or remove hydrogen act as oxidizing agents."),
            ("Which law of conservation is strictly satisfied in a balanced chemical equation?", ["(A) Conservation of Mass", "(B) Conservation of Energy", "(C) Conservation of Volume", "(D) Conservation of Momentum"], "(A) Conservation of Mass", "Total mass of reactants equals total mass of products."),
            ("What type of reaction occurs when silver bromide is exposed to sunlight?", ["(A) Photolytic Decomposition", "(B) Thermal Decomposition", "(C) Combination", "(D) Double Displacement"], "(A) Photolytic Decomposition", "Sunlight breaks down AgBr into silver metal and bromine gas.")
        ]

        for i in range(req.num_mcqs):
            template = mcq_templates[i % len(mcq_templates)]
            questions.append(QuestionItem(
                id=q_counter,
                question_number=q_counter,
                question_type="mcq",
                question_text=f"{template[0]} (Re: {req.chapter})",
                marks=1,
                options=template[1],
                answer=template[2],
                explanation=template[3]
            ))
            q_counter += 1

        # 2. Short Questions
        short_templates = [
            ("Explain the concept of balanced chemical equations with one example from the NCERT chapter.", "Write down the molecular equation and ensure atom count on LHS equals RHS."),
            ("Differentiate between exothermic and endothermic reactions with suitable examples.", "Exothermic releases heat (e.g., respiration), while endothermic absorbs heat (e.g., photosynthesis)."),
            ("What is a double displacement reaction? Give a balanced reaction showing precipitate formation.", "Reaction where ions are exchanged between two compounds to form an insoluble salt.")
        ]
        for i in range(req.num_short):
            template = short_templates[i % len(short_templates)]
            questions.append(QuestionItem(
                id=q_counter,
                question_number=q_counter,
                question_type="short",
                question_text=f"Q{q_counter}. {template[0]}",
                marks=3,
                answer=template[1],
                explanation=f"Key scoring point: State definitions clearly and include balanced chemical equations."
            ))
            q_counter += 1

        # 3. Long Questions
        long_templates = [
            ("A shiny brown element 'X' on heating in air becomes black in color. Name the element 'X' and the black-colored compound formed. Write a balanced chemical equation for the reaction and describe how it can be converted back to 'X'.", "Element 'X' is Copper (Cu). The black compound is Copper(II) Oxide (CuO). Equation: 2Cu + O2 -> 2CuO. Passing hydrogen gas over heated CuO converts it back: CuO + H2 -> Cu + H2O."),
            ("Describe an activity to demonstrate the decomposition of ferrous sulphate crystals when heated in a dry boiling tube. State the chemical equation and observe changes in color and odor.", "Ferrous sulphate crystals (FeSO4.7H2O) are green. On heating, water of crystallization is lost. On further heating, it decomposes into ferric oxide (Fe2O3), SO2, and SO3 gases with suffocating sulphur odor.")
        ]
        for i in range(req.num_long):
            template = long_templates[i % len(long_templates)]
            questions.append(QuestionItem(
                id=q_counter,
                question_number=q_counter,
                question_type="long",
                question_text=f"Q{q_counter}. {template[0]}",
                marks=5,
                answer=template[1],
                explanation="Draw clear diagrams where applicable and mention state symbols (s, l, g, aq)."
            ))
            q_counter += 1

        # 4. Case Studies
        for i in range(req.num_case_studies):
            questions.append(QuestionItem(
                id=q_counter,
                question_number=q_counter,
                question_type="case_study",
                passage=f"Case Study ({req.chapter}): Students conducted an experiment in the chemistry lab by taking 2g of lead nitrate powder in a boiling tube and heating it over a burner flames...",
                question_text=f"Q{q_counter}. (i) What color fumes are evolved during heating?\n(ii) Name the brown fumes gas and write the balanced chemical equation.",
                marks=4,
                answer="(i) Brown fumes of Nitrogen Dioxide (NO2) are evolved.\n(ii) Equation: 2Pb(NO3)2 -> 2PbO + 4NO2 + O2.",
                explanation="Lead nitrate decomposes into lead oxide, nitrogen dioxide, and oxygen gas."
            ))
            q_counter += 1

        return GeneratedPaperResponse(
            title=req.title,
            class_name=req.class_name,
            subject=req.subject,
            chapter=req.chapter,
            difficulty=req.difficulty,
            total_marks=req.total_marks,
            time_allowed_mins=req.time_allowed_mins,
            instructions=[
                "Read all questions carefully before attempting.",
                "Section A contains MCQs (1 mark each).",
                "Section B contains Short Answer questions (3 marks each).",
                "Section C contains Long Answer questions (5 marks each).",
                "Section D contains Case Study questions (4 marks each)."
            ],
            questions=questions,
            school_name=req.school_name
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

        system_prompt = f"""You are DEVAGYA's Master Socratic AI Tutor for {grade} {subject}.
Your Goal: Guide the student to discover the answer themselves through encouraging questions, hints, and simple conceptual explanations.
Constraint: DO NOT output the complete final answer directly.
Action Mode: {action_instructions.get(action, action_instructions['normal'])}

Respond in valid JSON format:
{{
  "response": "Your encouraging explanation or guidance text...",
  "hints": ["Hint 1", "Hint 2"],
  "guiding_question": "A clear question for the student to answer next..."
}}"""

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
        if not self.client:
            return [
                {
                    "id": 1,
                    "question": f"Which of the following best describes {topic} in {subject}?",
                    "options": ["Option A: Primary Law", "Option B: Secondary Effect", "Option C: Inverse Relationship", "Option D: Equilibrium"],
                    "correct_option": 0,
                    "explanation": "Option A represents the standard NCERT definition."
                }
            ]

        prompt = f"""Generate a high-quality practice quiz for {subject} on topic '{topic}'.
Difficulty: {difficulty}
Number of Questions: {num_questions}

Respond strictly in JSON array format:
[
  {{
    "id": 1,
    "question": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_option": 0,
    "explanation": "Detailed explanation of why Option A is correct..."
  }}
]"""
        try:
            res = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are an expert NCERT Assessment Creator."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            parsed = json.loads(res.choices[0].message.content)
            return parsed.get("questions", parsed) if isinstance(parsed, dict) else parsed
        except Exception as e:
            logger.error(f"Practice Quiz Error: {e}")
            return []

    async def voice_tutor_response(self, transcript: str, subject: str = "General", grade: str = "Class 10") -> str:
        """Generate a concise, spoken-friendly AI voice response for student queries."""
        if not self.client:
            return f"That's a fantastic observation about {subject}! What do you think happens next?"

        try:
            res = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": f"You are DEVAGYA AI Voice Tutor for {grade} {subject}. Keep your response short, conversational, encouraging, and under 3 sentences for natural speech synthesis. Ask 1 follow-up question."},
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

        system_prompt = """You are DEVAGYA's 24/7 AI Parenting Coach & Child Psychology Specialist.
Your Goal: Provide empathetic, practical, evidence-based parenting guidance for supporting children's education and emotional well-being.
Important Safety Constraint: DO NOT provide clinical medical diagnoses. Indicate when consulting a professional guidance counselor or pediatrician is recommended.

Respond strictly in JSON format:
{
  "advice": "Core psychological understanding and encouraging advice...",
  "practical_steps": ["Actionable step 1", "Actionable step 2", "Actionable step 3"],
  "communication_script": "Exact words or script parents can say to their child...",
  "when_to_seek_help": "Clear indicators for when professional guidance is appropriate..."
}"""

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

