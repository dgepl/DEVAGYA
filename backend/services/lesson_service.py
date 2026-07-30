import io
import json
import logging
from typing import List
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from schemas.phase2 import LessonPlanRequest, LessonPlanItem
from services.ai_provider import ai_provider

logger = logging.getLogger("lesson_service")

class LessonPlannerService:
    async def generate_lesson_plan(self, req: LessonPlanRequest) -> LessonPlanItem:
        prompt = f"""
You are a Master CBSE & NCERT Pedagogical Specialist.
Generate a structured, highly effective Lesson Plan based on:
Class: {req.class_name}
Subject: {req.subject}
Chapter: {req.chapter}
Duration: {req.duration_mins} Minutes
Learning Goals: {", ".join(req.learning_goals)}

Return strictly JSON (no markdown wrapping) in this format:
{{
  "title": "Interactive Lesson Plan: {req.chapter}",
  "class_name": "{req.class_name}",
  "subject": "{req.subject}",
  "chapter": "{req.chapter}",
  "duration_mins": {req.duration_mins},
  "learning_objectives": [
    "Students will master the fundamental equations of {req.chapter}.",
    "Students will apply concepts to real-world NCERT scenarios."
  ],
  "teaching_strategy": "Inquiry-based learning combined with visual experiments and peer discussion.",
  "class_activities": [
    {{"time": "0-10 Mins", "activity": "Hook & Concept Warm-up: Quick diagnostic poll on pre-requisite knowledge."}},
    {{"time": "10-25 Mins", "activity": "Core Explanation: Interactive blackboard demonstration of key reactions."}},
    {{"time": "25-35 Mins", "activity": "Guided Group Worksheet: Students solve 3 numerical problems in pairs."}},
    {{"time": "35-45 Mins", "activity": "Exit Ticket & Summary Quiz: Quick 3-question evaluation."}}
  ],
  "group_work": "Collaborative problem solving in teams of 3 to analyze NCERT exemplar questions.",
  "assessment_questions": [
    "What is the primary law governing this process?",
    "Calculate the resulting value given sample parameters."
  ],
  "homework": "Solve NCERT Exercise Questions 1 to 5 and complete the reflection journal.",
  "revision_summary": "Core takeaways: Key formulas, definitions, and common exam pitfalls."
}}
"""
        try:
            raw_text = await ai_provider.chat_completion(
                messages=[
                    {"role": "system", "content": "You are a master lesson plan synthesizer."},
                    {"role": "user", "content": prompt}
                ],
                response_format_json=True
            )
            if raw_text:
                data = json.loads(raw_text)
                return LessonPlanItem(**data)
        except Exception as e:
            logger.error(f"AI Lesson plan error, using fallback: {e}")

        # Intelligent Fallback
        return LessonPlanItem(
            title=f"NCERT Master Lesson Plan: {req.chapter}",
            class_name=req.class_name,
            subject=req.subject,
            chapter=req.chapter,
            duration_mins=req.duration_mins,
            learning_objectives=[
                f"Master core concepts of {req.chapter} aligned with NCERT syllabus.",
                "Apply Bloom's Taxonomy higher-order thinking skills to exam scenarios."
            ],
            teaching_strategy="5E Instructional Model (Engage, Explore, Explain, Elaborate, Evaluate).",
            class_activities=[
                {"time": "0-10 Mins", "activity": "Engage: 5-minute video demonstration / physical model visual hook."},
                {"time": "10-25 Mins", "activity": "Explore & Explain: Teacher-guided walkthrough of NCERT textbook diagrams."},
                {"time": "25-35 Mins", "activity": "Elaborate: Small group collaborative problem-solving activity."},
                {"time": "35-45 Mins", "activity": "Evaluate: Exit Ticket 2-question quick check."}
            ],
            group_work="Pairs construct mind maps of key concepts and present 1-minute summaries.",
            assessment_questions=[
                "Define the primary principles of this topic.",
                "State two practical real-life applications."
            ],
            homework="Complete textbook exercise questions 1-6 in notebook.",
            revision_summary="Summary bullet points covering key formulas, state symbols, and definitions."
        )

    def generate_lesson_plan_pdf(self, plan: LessonPlanItem) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=40)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=colors.HexColor("#1E1B4B"))
        subtitle_style = ParagraphStyle('SubTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=colors.HexColor("#4F46E5"))
        body_style = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor("#1E293B"))

        story = []
        story.append(Paragraph(plan.title.upper(), title_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph(f"Class: {plan.class_name} | Subject: {plan.subject} | Duration: {plan.duration_mins} Mins", subtitle_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#6366F1"), spaceBefore=5, spaceAfter=10))

        story.append(Paragraph("<b>1. Learning Objectives:</b>", subtitle_style))
        for obj in plan.learning_objectives:
            story.append(Paragraph(f"• {obj}", body_style))
        story.append(Spacer(1, 10))

        story.append(Paragraph("<b>2. Teaching Strategy:</b>", subtitle_style))
        story.append(Paragraph(plan.teaching_strategy, body_style))
        story.append(Spacer(1, 10))

        story.append(Paragraph("<b>3. Classroom Activities Timeline:</b>", subtitle_style))
        table_data = [["Time", "Activity Description"]]
        for act in plan.class_activities:
            table_data.append([act.get("time", ""), Paragraph(act.get("activity", ""), body_style)])

        t = Table(table_data, colWidths=[100, 420])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EEF2FF")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#1E1B4B")),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 12))

        story.append(Paragraph("<b>4. Homework & Assessment:</b>", subtitle_style))
        story.append(Paragraph(f"<b>Homework:</b> {plan.homework}", body_style))
        story.append(Paragraph(f"<b>Revision Summary:</b> {plan.revision_summary}", body_style))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

lesson_service = LessonPlannerService()
