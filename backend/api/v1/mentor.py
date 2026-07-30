from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_provider import ai_provider

router = APIRouter(prefix="/mentor", tags=["AI Teacher Mentor"])

class MentorRequest(BaseModel):
    query: str
    class_name: str = "Class 10"
    subject: str = "Science"

@router.post("/ask")
async def ask_teacher_mentor(req: MentorRequest):
    prompt = f"""
You are an expert Pedagogical Master Teacher.
Provide a highly structured response for the teacher query:
Subject: {req.subject} | Grade: {req.class_name}
Query: {req.query}

Format your output in clean Markdown with these exact sections:
### 1. Executive Summary & Core Objective
### 2. Recommended Classroom Activities (Step-by-Step)
### 3. Real-World Examples & Analogies
### 4. Differentiated Homework & Practice
### 5. Formative Assessment & Diagnostic Questions
### 6. Common Misconceptions & Pedagogical Tips
### 7. Supplementary NCERT Resources
"""
    response = await ai_provider.chat_completion(
        messages=[
            {"role": "system", "content": "You are a master teacher mentor."},
            {"role": "user", "content": prompt}
        ]
    )
    if not response:
        response = f"""### 1. Executive Summary & Core Objective
To help students intuitively master **{req.query}** in {req.subject} ({req.class_name}) through active inquiry and concept mapping.

### 2. Recommended Classroom Activities
- **Hook (5 Mins)**: Present a visual demonstration or thought experiment.
- **Guided Inquiry (15 Mins)**: Students analyze NCERT diagrams in pairs.
- **Group Problem Solving (15 Mins)**: Solve sample numericals on whiteboard.

### 3. Real-World Examples & Analogies
- Relate theoretical principles to everyday household items and natural phenomena.

### 4. Differentiated Homework & Practice
- **Standard**: Complete NCERT Exercises Q1 to Q5.
- **Advanced (HOTS)**: Formulate a hypothesis for real-world applications.

### 5. Formative Assessment & Diagnostic Questions
- Ask: "Why does the value change when temperature increases?"
- Conduct a 2-minute Exit Ticket poll.

### 6. Common Misconceptions & Pedagogical Tips
- Watch out for student confusion between vector vs scalar quantities.

### 7. Supplementary NCERT Resources
- Refer to NCERT Exemplar Chapter 12 and Laboratory Manual Activity 3.
"""
    return {"query": req.query, "response": response}
