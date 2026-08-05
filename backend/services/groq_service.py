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
4. Case Study / Passage Questions: EXACTLY {req.num_case_studies} questions (4 marks each). Include a short passage followed by sub-questions.

Custom Teacher Instructions:
{req.custom_instructions or "Ensure high NCERT curriculum alignment and HOTS (Higher Order Thinking Skills) questions."}

You MUST respond strictly with a valid JSON object matching this structure:
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
    "The question paper consists of 4 sections: Section A (MCQs), Section B (Short), Section C (Long), Section D (Case Study).",
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
      "question_text": "Question text specifically about {req.chapter} in {req.subject}...",
      "marks": 1,
      "options": ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"],
      "answer": "(A) Option 1",
      "explanation": "Detailed explanation based on {req.subject} textbook principles."
    }}
  ],
  "school_name": "{req.school_name}"
}}
"""
                response = self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": f"You are a specialized AI question paper synthesizer for {req.class_name} {req.subject}."},
                        {"role": "user", "content": prompt}
                    ],
                    model=settings.GROQ_MODEL,
                    response_format={"type": "json_object"},
                    temperature=0.5
                )
                
                raw_text = response.choices[0].message.content
                data = json.loads(raw_text)
                return GeneratedPaperResponse(**data)
            except Exception as e:
                logger.error(f"Groq API error, falling back to intelligent synthesizer: {e}")

        # Dynamic Fallback Synthesizer
        return self._generate_fallback_paper(req)

    def _generate_fallback_paper(self, req: GeneratePaperRequest) -> GeneratedPaperResponse:
        questions: List[QuestionItem] = []
        q_counter = 1

        # 1. MCQs
        for i in range(req.num_mcqs):
            questions.append(QuestionItem(
                id=q_counter,
                question_number=q_counter,
                question_type="mcq",
                question_text=f"Which of the following fundamental principles applies to {req.chapter} in {req.subject} for {req.class_name} (Part {i+1})?",
                marks=1,
                options=[
                    f"(A) Core Principle A of {req.chapter}",
                    f"(B) Secondary Effect B",
                    f"(C) Inverse Relationship C",
                    f"(D) None of the above"
                ],
                answer=f"(A) Core Principle A of {req.chapter}",
                explanation=f"Based on standard NCERT textbook guidelines for {req.subject} ({req.class_name})."
            ))
            q_counter += 1

        # 2. Short Questions
        for i in range(req.num_short):
            questions.append(QuestionItem(
                id=q_counter,
                question_number=q_counter,
                question_type="short",
                question_text=f"Q{q_counter}. Explain the core concepts of '{req.chapter}' in {req.subject}. Give two key examples relevant to {req.class_name}.",
                marks=3,
                answer=f"State definitions clearly, specify key equations/laws applicable to {req.chapter}, and provide examples.",
                explanation=f"Focus on key scoring terms from the {req.subject} syllabus."
            ))
            q_counter += 1

        # 3. Long Questions
        for i in range(req.num_long):
            questions.append(QuestionItem(
                id=q_counter,
                question_number=q_counter,
                question_type="long",
                question_text=f"Q{q_counter}. Describe a detailed analytical experiment or theoretical derivation regarding '{req.chapter}' ({req.subject}). Draw a neat labeled diagram where applicable.",
                marks=5,
                answer=f"Detailed step-by-step breakdown of {req.chapter} with diagrams, state symbols, and mathematical derivations.",
                explanation="Draw clear diagrams where applicable and show all calculation steps."
            ))
            q_counter += 1

        # 4. Case Studies
        for i in range(req.num_case_studies):
            questions.append(QuestionItem(
                id=q_counter,
                question_number=q_counter,
                question_type="case_study",
                passage=f"Case Study ({req.chapter} - {req.subject}): A group of students conducted a laboratory experiment on {req.chapter}. They recorded parameters and observed key phenomena under controlled conditions...",
                question_text=f"Q{q_counter}. (i) State the main hypothesis being tested.\n(ii) Write the governing mathematical expression or reaction equation.",
                marks=4,
                answer=f"(i) Hypothesis regarding {req.chapter}.\n(ii) Standard formula/equation for {req.subject}.",
                explanation=f"Passage analysis evaluating critical thinking in {req.subject}."
            ))
            q_counter += 1

        return GeneratedPaperResponse(
            title=req.title or f"{req.subject} Examination",
            class_name=req.class_name or "Class 10",
            subject=req.subject or "Science",
            chapter=req.chapter or "NCERT Syllabus",
            difficulty=req.difficulty or "medium",
            total_marks=req.total_marks or 40,
            time_allowed_mins=req.time_allowed_mins or 90,
            instructions=[
                "Read all questions carefully before attempting.",
                "Section A contains MCQs (1 mark each).",
                "Section B contains Short Answer questions (3 marks each).",
                "Section C contains Long Answer questions (5 marks each).",
                "Section D contains Case Study questions (4 marks each)."
            ],
            questions=questions,
            school_name=req.school_name or "DEVGYA GLOBAL ACADEMY"
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

        system_prompt = f"""You are DEVGYA's Master Socratic AI Tutor for {grade} {subject}.
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
            logger.error(f"Practice Quiz Generation Error: {e}")
            return fallback_questions[:num_questions]

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

        system_prompt = """You are DEVGYA's 24/7 AI Parenting Coach & Child Psychology Specialist.
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

