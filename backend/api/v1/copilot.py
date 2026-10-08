import json
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Form, Body, Query, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.ai_provider import ai_provider
from services.chat_history_service import chat_history_service
from services.academic_guardrail import attach_academic_guardrail

logger = logging.getLogger("copilot_router")

router = APIRouter(prefix="/copilot", tags=["DEVGYA AI Copilot & Site Guide"])

# =====================================================================
# PRE-EXISTING QUESTIONS & FAQ REPOSITORY BY CONTEXT
# =====================================================================

PRE_EXISTING_QUESTIONS = {
    "teacher": {
        "title": "DEVGYA Teacher Copilot",
        "scope_badge": "Teacher Dashboard Only",
        "description": "Expert pedagogical partner for CBSE/NCERT Question Papers, 5E Lesson Plans, OCR Grading & Analytics.",
        "categories": [
            {
                "name": "📝 Assessment & Question Papers",
                "questions": [
                    {
                        "id": "t-qp-1",
                        "label": "Generate CBSE Board Paper with Blueprint",
                        "prompt": "How do I create a standard CBSE Class 10 Board exam paper with blueprint, section marks, and answer key in DEVGYA?",
                        "is_plan": False
                    },
                    {
                        "id": "t-qp-2",
                        "label": "Bloom's Taxonomy Distribution",
                        "prompt": "How does DEVGYA allocate Bloom's Taxonomy marks (Remembering, Understanding, Application, HOTS) in question papers?",
                        "is_plan": False
                    },
                    {
                        "id": "t-qp-3",
                        "label": "Add School Watermark & Export to PDF",
                        "prompt": "How do I add my school logo, watermark, and print or export question papers as PDF/Word?",
                        "is_plan": False
                    },
                    {
                        "id": "t-qp-4",
                        "label": "Assertion-Reason & Case Study Questions",
                        "prompt": "Can DEVGYA generate CBSE Assertion-Reason questions and Competency-Based Case Study passages with sub-questions?",
                        "is_plan": False
                    }
                ]
            },
            {
                "name": "📖 5E Lesson Planning & Classroom",
                "questions": [
                    {
                        "id": "t-lp-1",
                        "label": "Create 5E Lesson Plan for Science",
                        "prompt": "How do I create a 5E Lesson Plan (Engage, Explore, Explain, Elaborate, Evaluate) for Class 9 Science using DEVGYA?",
                        "is_plan": False
                    },
                    {
                        "id": "t-lp-2",
                        "label": "Differentiated Learning & Rubrics",
                        "prompt": "How can I generate assessment rubrics and differentiated activities for mixed-ability learners?",
                        "is_plan": False
                    },
                    {
                        "id": "t-lp-3",
                        "label": "Content Studio Worksheets",
                        "prompt": "How do I create custom printable student worksheets with answer keys in the Teaching Assistant & Content Studio?",
                        "is_plan": False
                    }
                ]
            },
            {
                "name": "📊 OCR Grading & Class Analytics",
                "questions": [
                    {
                        "id": "t-ocr-1",
                        "label": "Scan & Grade Handwritten Papers via OCR",
                        "prompt": "How do I use the OCR Exam Grading tool to automatically score handwritten student answer sheets?",
                        "is_plan": False
                    },
                    {
                        "id": "t-ocr-2",
                        "label": "Track Weak Topics on Marks Radar",
                        "prompt": "Where do I view student performance analytics, chapter-wise weak topics, and class average radar?",
                        "is_plan": False
                    }
                ]
            },
            {
                "name": "📅 Action Plans & Curriculum Timetables",
                "questions": [
                    {
                        "id": "t-plan-1",
                        "label": "15-Day Board Exam Preparation Plan",
                        "prompt": "Create a professional 15-day CBSE Board Exam preparation & mock assessment plan for Class 10 Math.",
                        "is_plan": True
                    },
                    {
                        "id": "t-plan-2",
                        "label": "4-Week Remedial Teaching Strategy",
                        "prompt": "Design a professional 4-week remedial teaching and practice plan for struggling students in Science.",
                        "is_plan": True
                    },
                    {
                        "id": "t-plan-3",
                        "label": "Unit Syllabus Completion Roadmap",
                        "prompt": "Help me build a structured 3-week unit syllabus completion and testing roadmap for CBSE Class 12.",
                        "is_plan": True
                    }
                ]
            }
        ],
        "quick_links": [
            {"label": "Question Paper Generator", "path": "/dashboard/generator", "badge": "Primary Tool"},
            {"label": "Paper Repository", "path": "/dashboard/papers", "badge": "Saved Tests"},
            {"label": "5E Lesson Planner", "path": "/dashboard/classroom", "badge": "Pedagogy"},
            {"label": "Content & Worksheet Studio", "path": "/dashboard/content", "badge": "Resources"},
            {"label": "Class Analytics Radar", "path": "/dashboard/analytics", "badge": "Insights"},
            {"label": "Teacher Skill Olympiad", "path": "/dashboard/olympiad", "badge": "Certification"}
        ]
    },
    "student": {
        "title": "DEVGYA Student Study Guide",
        "scope_badge": "Student Learning Mode",
        "description": "Your 24/7 Socratic AI Tutor, exam prep planner, and revision companion.",
        "categories": [
            {
                "name": "🧠 Socratic AI Tutor & Concepts",
                "questions": [
                    {
                        "id": "s-tutor-1",
                        "label": "How to Use Socratic AI Tutor",
                        "prompt": "How does the Socratic AI Tutor work and how does it guide me step-by-step without spoiling answers?",
                        "is_plan": False
                    },
                    {
                        "id": "s-tutor-2",
                        "label": "Ask Any NCERT Question",
                        "prompt": "Can I upload a photo of my textbook question or notes to get an explanation?",
                        "is_plan": False
                    }
                ]
            },
            {
                "name": "🏆 Practice Quizzes, Flashcards & XP",
                "questions": [
                    {
                        "id": "s-xp-1",
                        "label": "XP Points, Streaks & Leaderboard",
                        "prompt": "How do I earn XP points, maintain daily study streaks, and rank on the school leaderboard?",
                        "is_plan": False
                    },
                    {
                        "id": "s-quiz-1",
                        "label": "Chapter MCQ Practice & Flashcards",
                        "prompt": "Where can I take chapter-wise practice quizzes and review active-recall flashcards?",
                        "is_plan": False
                    }
                ]
            },
            {
                "name": "📅 Study Plans & Timetables",
                "questions": [
                    {
                        "id": "s-plan-1",
                        "label": "30-Day Board Exam Timetable",
                        "prompt": "Make a professional 30-day CBSE Board Exam revision timetable for Class 10 with 3-hour daily slots.",
                        "is_plan": True
                    },
                    {
                        "id": "s-plan-2",
                        "label": "7-Day Chapter Mastery Plan",
                        "prompt": "Create a 7-day deep mastery plan for NCERT Class 10 Science 'Life Processes'.",
                        "is_plan": True
                    }
                ]
            }
        ],
        "quick_links": [
            {"label": "Socratic AI Tutor", "path": "/dashboard/student/tutor", "badge": "AI Tutor"},
            {"label": "Practice Quizzes", "path": "/dashboard/student/practice", "badge": "MCQs"},
            {"label": "Flashcard Decks", "path": "/dashboard/student/flashcards", "badge": "Recall"},
            {"label": "Revision Studio", "path": "/dashboard/student/revision", "badge": "Summary"},
            {"label": "Exam Prep Studio", "path": "/dashboard/student/exam-prep", "badge": "Tests"}
        ]
    },
    "parent": {
        "title": "DEVGYA Parent Guidance Coach",
        "scope_badge": "Parent Advisory Mode",
        "description": "Monitor your child's learning journey, review progress radar, and get AI parenting advice.",
        "categories": [
            {
                "name": "👨‍👩‍👧 Monitoring & Performance",
                "questions": [
                    {
                        "id": "p-1",
                        "label": "View Study Hours & Weak Subjects",
                        "prompt": "How do I track my child's daily learning hours, test scores, and weak subject areas on DEVGYA?",
                        "is_plan": False
                    },
                    {
                        "id": "p-2",
                        "label": "Understand Academic Radar",
                        "prompt": "How do I read my child's academic radar chart and chapter completion metrics?",
                        "is_plan": False
                    }
                ]
            },
            {
                "name": "💡 Parenting Advice & Routine",
                "questions": [
                    {
                        "id": "p-3",
                        "label": "Reduce Exam Stress & Anxiety",
                        "prompt": "How can I help my child manage exam pressure and build a healthy study routine at home?",
                        "is_plan": False
                    },
                    {
                        "id": "p-plan-1",
                        "label": "Healthy Home Study Schedule",
                        "prompt": "Create a balanced home study and rest schedule for a CBSE board exam student.",
                        "is_plan": True
                    }
                ]
            }
        ],
        "quick_links": [
            {"label": "Parent Dashboard", "path": "/dashboard/parent", "badge": "Overview"},
            {"label": "Parenting AI Coach", "path": "/dashboard/agents?agent=parent_coach", "badge": "AI Coach"},
            {"label": "Child Progress Radar", "path": "/dashboard/parent", "badge": "Analytics"}
        ]
    },
    "landing": {
        "title": "DEVGYA AI Site Guide & Navigator",
        "scope_badge": "Platform Guide",
        "description": "Your intelligent guide to India's premier CBSE & NCERT AI Education Platform.",
        "categories": [
            {
                "name": "🌟 Platform Overview & AI Tools",
                "questions": [
                    {
                        "id": "l-1",
                        "label": "What is DEVGYA Edutech?",
                        "prompt": "What is DEVGYA GLOBAL EDUTECH and what solutions does it provide for schools, teachers, and students?",
                        "is_plan": False
                    },
                    {
                        "id": "l-2",
                        "label": "How Does Question Paper Generator Work?",
                        "prompt": "How does the AI Question Paper Generator create CBSE/NCERT papers with blueprints in 60 seconds?",
                        "is_plan": False
                    },
                    {
                        "id": "l-3",
                        "label": "What is the 5E Lesson Planner?",
                        "prompt": "Explain the 5E Lesson Planner tool and how it helps teachers save 10+ hours per week.",
                        "is_plan": False
                    }
                ]
            },
            {
                "name": "🏫 School Infrastructure & Labs",
                "questions": [
                    {
                        "id": "l-lab-1",
                        "label": "Certified Science Labs Setup",
                        "prompt": "How do schools partner with DEVGYA for certified Physics, Chemistry, Biology, and Composite labs?",
                        "is_plan": False
                    },
                    {
                        "id": "l-lab-2",
                        "label": "Book a School Demo & Consultation",
                        "prompt": "How can our school schedule a live demo or consultation with the DEVGYA academic team?",
                        "is_plan": False
                    }
                ]
            },
            {
                "name": "🚀 Getting Started & Onboarding Plans",
                "questions": [
                    {
                        "id": "l-reg-1",
                        "label": "How to Register (Teacher, Student, School)",
                        "prompt": "How do I register an account on DEVGYA as a Teacher, Student, or School Administrator?",
                        "is_plan": False
                    },
                    {
                        "id": "l-plan-1",
                        "label": "30-Day School AI Adoption Plan",
                        "prompt": "Create a professional 30-day school rollout plan to introduce DEVGYA AI tools to teachers and students.",
                        "is_plan": True
                    }
                ]
            }
        ],
        "quick_links": [
            {"label": "Explore Features", "path": "/why-choose-us", "badge": "Tour"},
            {"label": "Register Account", "path": "/register", "badge": "Get Started"},
            {"label": "Login to Portal", "path": "/login", "badge": "Portal"},
            {"label": "Book School Lab Demo", "path": "/contact", "badge": "Schools"},
            {"label": "FAQ & Knowledge Base", "path": "/faq", "badge": "Help"}
        ]
    }
}

# =====================================================================
# SYSTEM PROMPTS & ARCHITECTURE
# =====================================================================

DEVGYA_PLATFORM_KNOWLEDGE = """
YOU ARE DEVGYA AI ASSISTANT, developed by DEVGYA GLOBAL EDUTECH PRIVATE LIMITED (devgya.in) — India's leading hybrid AI education ecosystem for CBSE & NCERT schools.

CORE DEVGYA FEATURES AND EXACT WEB PATHS:
1. Question Paper Generator (/dashboard/generator):
   - Classes 6 to 12 for CBSE & NCERT.
   - Question types: MCQs, Short Answer (2-3 marks), Long Answer (5 marks), Assertion-Reason, Fill in Blanks, Competency-based Case Studies with sub-questions.
   - Generates Blueprint aligned with Bloom's Taxonomy (Remembering, Understanding, Applying, Analyzing/Evaluating).
   - Instant complete answer keys and marking scheme.
   - Watermark with school name and printable PDF export.
2. Saved Papers Repository (/dashboard/papers):
   - View, search, re-edit, duplicate, and print saved examination papers.
3. 5E Lesson Planner (/dashboard/classroom):
   - Standards-based 5E Model (Engage, Explore, Explain, Elaborate, Evaluate).
   - Generates classroom activities, learning objectives, formative questions, and rubrics.
4. AI Teaching Assistant & Content Studio (/dashboard/content):
   - Generates printable worksheets, reading comprehension passages, homework sheets, and rubrics.
5. OCR Exam Grading & Homework Evaluator (/dashboard/assignment or /dashboard/ocr):
   - Scans handwritten student answer sheets and assignments via camera/upload and auto-grades against rubrics.
6. Class Analytics & Marks Radar (/dashboard/analytics):
   - Student performance analytics, weak topic radars, class averages, diagnostic reports.
7. Teacher Skill Olympiad (TSO) (/dashboard/olympiad):
   - National AI pedagogy certification for teachers with score reports and certificates.
8. Student Socratic AI Tutor (/dashboard/student/tutor):
   - Interactive Socratic mentor that asks probing questions and hints without giving away answers immediately.
9. Student Practice Quizzes (/dashboard/student/practice):
   - NCERT chapter MCQs, instant explanations, timer, score feedback.
10. Student Flashcard Deck (/dashboard/student/flashcards):
    - Active-recall digital flashcards for formulas, reactions, definitions.
11. Student Revision Studio (/dashboard/student/revision):
    - High-yield 2-minute revision summaries and mind-map points.
12. XP & Streak Rewards (/dashboard/student):
    - Gamified learning: daily study streaks, XP points, and class leaderboard.
13. Parent Dashboard (/dashboard/parent):
    - Real-time study hours, subject weakness breakdown, parenting tips.
14. School Certified Science Labs & Smart Infrastructure (/contact, /business):
    - Turnkey CBSE/ICSE Physics, Chemistry, Biology labs, digital smart podiums, robotics labs.
"""

def _build_system_prompt(context: str, current_path: str = "") -> str:
    base = DEVGYA_PLATFORM_KNOWLEDGE

    if context == "teacher":
        return attach_academic_guardrail(
            f"{base}\n\n"
            "🚨 CRITICAL OPERATIONAL MANDATE FOR TEACHER DASHBOARD:\n"
            "- You are currently acting strictly as the **DEVGYA Teacher Copilot & Pedagogical Partner**.\n"
            "- THE USER IS IN THE TEACHER DASHBOARD. Your questions, guidance, and assistance MUST BE EXCLUSIVELY FOCUSED ON THE TEACHER DASHBOARD, educator tools, and teaching workflows.\n"
            "- DO NOT provide student or parent advice unless explaining how a teacher assigns tests or communicates with parents.\n"
            "- Deeply assist with: CBSE/NCERT Question Paper Generation, Bloom's Taxonomy blueprints, 5E Lesson Plans, Rubrics, OCR Grading, Student Weak Topic Radar, and Teacher Skill Certification.\n"
            "- Tone: Highly professional, encouraging, pedagogically sound, and CBSE-compliant.\n"
            "- FORMATTING PLANS: When the teacher asks to make a plan (or clicks a plan prompt):\n"
            "  1. Provide a professional, executive-grade plan (with Target Objective, Phased Breakdown, Action Checklist, and Pro-Tips).\n"
            "  2. Include direct 'Make It Happen' links using markdown: e.g. [👉 Open Question Paper Generator](/dashboard/generator), [👉 Open 5E Lesson Planner](/dashboard/classroom), [👉 View Class Analytics](/dashboard/analytics).\n"
            "  3. Keep the layout clean, structured, and visually impressive with bold terms, markdown tables, and bullet points."
        )

    if context == "student":
        return attach_academic_guardrail(
            f"{base}\n\n"
            "STUDENT DASHBOARD CONTEXT:\n"
            "- You are the **DEVGYA Student Study Guide & Socratic Companion**.\n"
            "- Help the student understand NCERT concepts, practice MCQs, review flashcards, maintain streaks, and plan exam timetables.\n"
            "- When explaining solutions, use the Socratic method: encourage them to think, give hints, and break complex steps down.\n"
            "- When asked to make a study plan, create an energetic, realistic timetable with study slots, active-recall pauses, and direct links like [👉 Start Socratic Tutor](/dashboard/student/tutor) and [👉 Practice Quizzes](/dashboard/student/practice)."
        )

    if context == "parent":
        return attach_academic_guardrail(
            f"{base}\n\n"
            "PARENT DASHBOARD CONTEXT:\n"
            "- You are the **DEVGYA Parent Guidance Advisor**.\n"
            "- Help parents understand academic progress, diagnostic reports, and healthy study routines at home.\n"
            "- Direct them to [👉 Parent Dashboard](/dashboard/parent)."
        )

    # Default / Landing page
    return attach_academic_guardrail(
        f"{base}\n\n"
        "SITE VISITOR & LANDING PAGE CONTEXT:\n"
        "- You are the **DEVGYA Global Navigator & Platform Guide**.\n"
        "- Guide visitors on what DEVGYA offers: AI Question Paper Generator, 5E Lesson Planner, Socratic Student Tutor, Certified Science Labs, and School Infrastructure.\n"
        "- If they ask to make a plan, provide a professional onboarding or school rollout plan with links like [👉 Register Now](/register), [👉 Book School Demo](/contact), or [👉 Explore Features](/why-choose-us)."
    )

LANGUAGE_INSTRUCTIONS = {
    "hindi": "CRITICAL INSTRUCTION: Reply ONLY in clear, natural Hindi (Devanagari script).",
    "hinglish": "CRITICAL INSTRUCTION: Reply in natural, conversational Hinglish (a mix of Hindi and English in Roman/Latin script, commonly spoken in India).",
    "english": "Reply in clear, professional English."
}

# =====================================================================
# API ENDPOINTS
# =====================================================================

class ChatPayload(BaseModel):
    message: str
    context: Optional[str] = "landing" # teacher | student | parent | landing
    current_path: Optional[str] = "/"
    language: Optional[str] = "english"
    conversation_id: Optional[str] = None
    user_id: Optional[str] = "usr-guest"
    user_role: Optional[str] = "guest"
    is_plan: Optional[bool] = False
    history: Optional[List[Dict[str, str]]] = []

@router.get("/context-info")
async def get_context_info(
    context: str = Query("landing", description="Current context: teacher | student | parent | landing"),
    path: str = Query("/", description="Current browser path")
):
    """
    Returns pre-existing questions, suggested prompts, and quick navigation links
    tailored to the active context (strictly teacher dashboard if teacher).
    """
    ctx_key = context.lower()
    if ctx_key not in PRE_EXISTING_QUESTIONS:
        ctx_key = "landing"

    data = PRE_EXISTING_QUESTIONS[ctx_key]
    return {
        "status": "success",
        "context": ctx_key,
        "path": path,
        "title": data["title"],
        "scope_badge": data["scope_badge"],
        "description": data["description"],
        "categories": data["categories"],
        "quick_links": data["quick_links"]
    }

@router.post("/chat")
async def copilot_chat(payload: ChatPayload):
    """
    Direct non-streaming chat with the DEVGYA Assistant.
    Enforces strict context boundaries (e.g. Teacher Dashboard only).
    """
    user_msg = (payload.message or "").strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message is required.")

    ctx = (payload.context or "landing").lower()
    if ctx not in ["teacher", "student", "parent", "landing"]:
        ctx = "landing"

    system_prompt = _build_system_prompt(ctx, payload.current_path or "")
    lang_inst = LANGUAGE_INSTRUCTIONS.get(payload.language or "english", "")

    if payload.is_plan or any(w in user_msg.lower() for w in ["plan", "timetable", "roadmap", "schedule", "strategy"]):
        plan_addon = (
            "\n\nUSER HAS REQUESTED A PROFESSIONAL PLAN. Format your answer as a comprehensive, "
            "executive-grade plan with: Goal Overview, Phased Schedule, Action Checklist, Pro-Tips, "
            "and direct Markdown Links to DEVGYA tools so the user can immediately execute it."
        )
        system_prompt += plan_addon

    messages = [{"role": "system", "content": f"{system_prompt}\n\n{lang_inst}"}]

    # Append recent conversation history if provided
    if payload.history:
        for h in payload.history[-6:]:
            role = h.get("role")
            content = h.get("content")
            if role in ["user", "assistant"] and content:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_msg})

    try:
        reply = await ai_provider.chat_completion(messages, temperature=0.4, max_tokens=2500)
    except Exception as e:
        logger.error(f"Copilot completion error: {e}")
        reply = (
            "I apologize, I am temporarily having trouble contacting the AI core. "
            "Please check that your prompt is clear or try again in a moment."
        )

    if not reply.strip():
        if ctx == "teacher":
            reply = (
                "Hello Teacher! 👋 I am your **DEVGYA Teacher Copilot**.\n\n"
                "I can help you build custom CBSE question papers, generate 5E lesson plans, "
                "rubrics, and evaluate student work. What would you like to plan today?"
            )
        else:
            reply = "Hello! 👋 I am your **DEVGYA AI Guide**. How can I help you explore or use the platform today?"

    conv_id = payload.conversation_id or f"copilot-{ctx}-{payload.user_id or 'guest'}"

    return {
        "status": "success",
        "reply": reply,
        "conversation_id": conv_id,
        "context": ctx
    }

@router.post("/chat/stream")
async def copilot_chat_stream(
    message: str = Form(""),
    context: str = Form("landing"),
    current_path: str = Form("/"),
    language: str = Form("english"),
    conversation_id: Optional[str] = Form(None),
    user_id: str = Form("usr-guest"),
    is_plan: bool = Form(False)
):
    """
    Streaming response for real-time word-by-word streaming in the Copilot UI.
    """
    user_msg = (message or "").strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message is required.")

    ctx = (context or "landing").lower()
    if ctx not in ["teacher", "student", "parent", "landing"]:
        ctx = "landing"

    system_prompt = _build_system_prompt(ctx, current_path or "")
    lang_inst = LANGUAGE_INSTRUCTIONS.get(language or "english", "")

    if is_plan or any(w in user_msg.lower() for w in ["plan", "timetable", "roadmap", "schedule", "strategy"]):
        system_prompt += (
            "\n\nUSER HAS REQUESTED A PROFESSIONAL PLAN. Format your answer as a comprehensive, "
            "executive-grade plan with: Goal Overview, Phased Schedule, Action Checklist, Pro-Tips, "
            "and direct Markdown Links to DEVGYA tools so the user can immediately execute it."
        )

    messages = [
        {"role": "system", "content": f"{system_prompt}\n\n{lang_inst}"},
        {"role": "user", "content": user_msg}
    ]

    conv_id = conversation_id or f"copilot-{ctx}-{user_id}"

    async def event_generator():
        full = ""
        try:
            async for chunk in ai_provider.stream_chat_completion(messages, temperature=0.4, max_tokens=2500):
                full += chunk
                yield chunk
        except Exception as e:
            logger.error(f"Copilot streaming error: {e}")
            fallback = "*(Connection issue. Please retry your request.)*"
            yield fallback
        finally:
            if not full.strip():
                yield "Hello! I am your DEVGYA AI Copilot. How can I assist your teaching or learning workflow today?"

    response = StreamingResponse(event_generator(), media_type="text/plain; charset=utf-8")
    response.headers["X-Conversation-Id"] = conv_id
    response.headers["X-Copilot-Context"] = ctx
    return response
