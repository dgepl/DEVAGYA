import os
import io
import re
import json
import logging
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from services.ai_provider import ai_provider
from services.groq_service import robust_json_parser
from services.error_service import format_ai_exception_detail
from fastapi import HTTPException

# ReportLab imports for Landscape PDF
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from services.pdf_service import (
    UNICODE_FONT_NAME, UNICODE_BOLD_FONT_NAME,
    clean_md_to_reportlab, strip_emojis_for_pdf
)

# PPTX imports
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

logger = logging.getLogger("ppt_service")

# --- Schemas ---

class SlideItem(BaseModel):
    slide_number: int
    layout: str = "title_bullets" # title_bullets, two_column, stat_highlight, process_timeline, quote_insight, split_image_text
    category: str = "Concept"
    title: str
    subtitle: Optional[str] = None
    bullets: List[str] = []
    left_column: Optional[Dict[str, Any]] = None
    right_column: Optional[Dict[str, Any]] = None
    metrics: Optional[List[Dict[str, str]]] = None
    timeline_steps: Optional[List[Dict[str, str]]] = None
    quote: Optional[Dict[str, str]] = None
    image_keyword: str = "education study concept"
    image_url: Optional[str] = None
    image_caption: Optional[str] = None
    speaker_notes: str = ""

class GeneratePPTRequest(BaseModel):
    topic: str = Field(..., example="Quantum Computing and Superposition")
    target_audience: str = Field(default="Class 10-12 / High School")
    num_slides: int = Field(default=8, ge=3, le=20)
    tone: str = Field(default="Engaging & Visual")
    language: str = Field(default="English")
    theme: str = Field(default="modern_navy") # modern_navy, emerald_sage, sunset_coral, dark_cyber, royal_purple, slate_academic
    teacher_guidance: Optional[str] = Field(default="")
    user_email: Optional[str] = None

class PresentationData(BaseModel):
    id: Optional[str] = None
    title: str
    subtitle: str
    topic: str
    target_audience: str
    num_slides: int
    theme: str = "modern_navy"
    language: str = "English"
    teacher_guidance: Optional[str] = None
    slides: List[SlideItem]
    created_at: Optional[str] = None

class RefineSlideRequest(BaseModel):
    slide: SlideItem
    instruction: str
    topic: str
    target_audience: str = "Class 10-12"

# Curated high-res educational photo fallback library
THEME_PRESETS: Dict[str, Dict[str, Any]] = {
    "modern_navy": {
        "primary": "#1E3A8A", # Blue 900
        "secondary": "#3B82F6", # Blue 500
        "accent": "#0D9488", # Teal 600
        "bg": "#F8FAFC",
        "card_bg": "#FFFFFF",
        "text_primary": "#0F172A",
        "text_secondary": "#475569",
        "rgb_primary": (30, 58, 138),
        "rgb_accent": (13, 148, 136),
        "rgb_card": (255, 255, 255),
        "rgb_bg": (248, 250, 252)
    },
    "emerald_sage": {
        "primary": "#065F46", # Emerald 800
        "secondary": "#10B981", # Emerald 500
        "accent": "#F59E0B", # Amber 500
        "bg": "#F0FDF4",
        "card_bg": "#FFFFFF",
        "text_primary": "#064E3B",
        "text_secondary": "#334155",
        "rgb_primary": (6, 95, 70),
        "rgb_accent": (245, 158, 11),
        "rgb_card": (255, 255, 255),
        "rgb_bg": (240, 253, 244)
    },
    "sunset_coral": {
        "primary": "#991B1B", # Red 800
        "secondary": "#EA580C", # Orange 600
        "accent": "#D97706", # Amber 600
        "bg": "#FFF7ED",
        "card_bg": "#FFFFFF",
        "text_primary": "#7C2D12",
        "text_secondary": "#431407",
        "rgb_primary": (153, 27, 27),
        "rgb_accent": (234, 88, 12),
        "rgb_card": (255, 255, 255),
        "rgb_bg": (255, 247, 237)
    },
    "dark_cyber": {
        "primary": "#0F172A", # Slate 900
        "secondary": "#6366F1", # Indigo 500
        "accent": "#06B6D4", # Cyan 500
        "bg": "#0B0F19",
        "card_bg": "#1E293B",
        "text_primary": "#F8FAFC",
        "text_secondary": "#94A3B8",
        "rgb_primary": (99, 102, 241),
        "rgb_accent": (6, 182, 212),
        "rgb_card": (30, 41, 59),
        "rgb_bg": (11, 15, 25)
    },
    "royal_purple": {
        "primary": "#581C87", # Purple 900
        "secondary": "#8B5CF6", # Purple 500
        "accent": "#EC4899", # Pink 500
        "bg": "#FAF5FF",
        "card_bg": "#FFFFFF",
        "text_primary": "#3B0764",
        "text_secondary": "#475569",
        "rgb_primary": (88, 28, 135),
        "rgb_accent": (236, 72, 153),
        "rgb_card": (255, 255, 255),
        "rgb_bg": (250, 245, 255)
    },
    "slate_academic": {
        "primary": "#1E293B", # Slate 800
        "secondary": "#475569", # Slate 600
        "accent": "#2563EB", # Blue 600
        "bg": "#F1F5F9",
        "card_bg": "#FFFFFF",
        "text_primary": "#0F172A",
        "text_secondary": "#334155",
        "rgb_primary": (30, 41, 59),
        "rgb_accent": (37, 99, 235),
        "rgb_card": (255, 255, 255),
        "rgb_bg": (241, 245, 249)
    }
}

def _get_image_for_keyword(keyword: str) -> str:
    """Provides a reliable, beautiful educational image URL based on keyword theme."""
    kw = (keyword or "").lower()
    if any(k in kw for k in ["space", "astronomy", "planet", "galaxy", "solar"]):
        return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80"
    if any(k in kw for k in ["bio", "dna", "cell", "organism", "nature", "plant", "photosynthesis"]):
        return "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop&q=80"
    if any(k in kw for k in ["chem", "molecule", "reaction", "lab", "experiment"]):
        return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80"
    if any(k in kw for k in ["phys", "quantum", "electric", "magnet", "energy", "wave"]):
        return "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80"
    if any(k in kw for k in ["math", "geometry", "calculus", "algebra", "number", "vedic"]):
        return "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80"
    if any(k in kw for k in ["history", "war", "revolut", "ancient", "monument", "civil"]):
        return "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80"
    if any(k in kw for k in ["ai", "robot", "comput", "tech", "program", "code", "cyber"]):
        return "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80"
    if any(k in kw for k in ["earth", "climate", "environment", "geography", "eco"]):
        return "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80"
    if any(k in kw for k in ["liter", "english", "poem", "book", "lang", "grammar"]):
        return "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80"
    if any(k in kw for k in ["econ", "market", "trade", "finance", "money"]):
        return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80"
    return "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80"


class PPTGeneratorService:

    async def generate_presentation(self, req: GeneratePPTRequest) -> PresentationData:
        """Generates a complete, high-quality presentation structure on any topic with teacher AI guidance."""
        prompt = f"""You are DEVGYA's Master Educational Presentation Architect.
Synthesize a comprehensive, beautifully structured slide deck for teachers.

TOPIC: {req.topic}
TARGET AUDIENCE: {req.target_audience}
NUMBER OF SLIDES: {req.num_slides}
PRESENTATION TONE: {req.tone}
LANGUAGE: {req.language}
COLOR THEME: {req.theme}
{f"TEACHER SPECIFIC GUIDANCE & PEDAGOGY MANDATES: {req.teacher_guidance}" if req.teacher_guidance else ""}

CRITICAL DESIGN MANDATES:
1. Topic Flexibility: Any study topic is allowed (academic, technical, historical, practical, philosophical, exam revision, etc.).
2. Slide Layout Diversity: Vary slide layouts across the deck to maintain visual engagement:
   - 'title_bullets': Impactful title + 3-4 structured bullet points with bold lead-in keywords.
   - 'two_column': Comparison, pros vs cons, before vs after, or concept vs application.
   - 'stat_highlight': 2-3 key metrics or quantitative insights with values and descriptions.
   - 'process_timeline': 3-4 sequential steps, phases, or historical milestones.
   - 'quote_insight': Deep philosophical/expert quote or core conceptual axiom.
   - 'split_image_text': Visually rich summary with focal explanation.
3. High Pedagogical Quality:
   - Slide 1 should always be a captivating Title / Hook slide.
   - Middle slides develop the core mechanisms, examples, and analysis step-by-step.
   - Penultimate / Last slide should include Key Takeaways, Interactive Classroom Discussion Question, or Quick Concept Quiz.
4. Speaker Notes: Provide practical teacher guidance notes for presenting each slide effectively to students.
5. Image Keywords: Provide 2-3 descriptive visual keywords for educational illustration search.

RETURN VALID JSON ONLY matching this exact schema:
{{
  "title": "Main Presentation Title",
  "subtitle": "Clear, engaging subtitle summarizing audience goal",
  "slides": [
    {{
      "slide_number": 1,
      "layout": "title_bullets",
      "category": "Introduction & Overview",
      "title": "...",
      "subtitle": "...",
      "bullets": [
        "**Key Concept 1**: Clear explanation...",
        "**Key Concept 2**: Clear explanation..."
      ],
      "left_column": null,
      "right_column": null,
      "metrics": null,
      "timeline_steps": null,
      "quote": null,
      "image_keyword": "astronomy universe",
      "image_caption": "Visual representation of...",
      "speaker_notes": "Introduce the session by asking students..."
    }},
    {{
      "slide_number": 2,
      "layout": "two_column",
      "category": "Core Mechanism Comparison",
      "title": "...",
      "subtitle": "...",
      "bullets": [],
      "left_column": {{
        "title": "Classical View",
        "bullets": ["Point A", "Point B"]
      }},
      "right_column": {{
        "title": "Modern View",
        "bullets": ["Point X", "Point Y"]
      }},
      "metrics": null,
      "timeline_steps": null,
      "quote": null,
      "image_keyword": "physics laboratory",
      "image_caption": "Comparative analysis",
      "speaker_notes": "Highlight how the transition occurred..."
    }}
  ]
}}

Generate ALL {req.num_slides} slides completely!"""

        try:
            raw = await ai_provider.chat_completion(
                messages=[
                    {"role": "system", "content": "You are DEVGYA's premier AI Slide Deck Architect. Output strictly valid JSON without markdown formatting."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.35,
                max_tokens=4000,
                response_format_json=True
            )

            parsed = robust_json_parser(raw)
            slides_raw = parsed.get("slides") or []

            # If empty or malformed fallback
            if not slides_raw or not isinstance(slides_raw, list):
                raise ValueError("No valid slides parsed from AI response.")

            slides_list: List[SlideItem] = []
            for idx, s in enumerate(slides_raw):
                if not isinstance(s, dict):
                    continue
                num = idx + 1
                kw = str(s.get("image_keyword") or req.topic)
                img_url = s.get("image_url") or _get_image_for_keyword(kw)

                bullets = s.get("bullets") if isinstance(s.get("bullets"), list) else []
                if not bullets and s.get("content"):
                    bullets = [str(s.get("content"))]

                item = SlideItem(
                    slide_number=num,
                    layout=str(s.get("layout") or "title_bullets"),
                    category=str(s.get("category") or f"Module {num}"),
                    title=str(s.get("title") or f"Key Concept {num}"),
                    subtitle=str(s.get("subtitle") or "") if s.get("subtitle") else None,
                    bullets=bullets,
                    left_column=s.get("left_column") if isinstance(s.get("left_column"), dict) else None,
                    right_column=s.get("right_column") if isinstance(s.get("right_column"), dict) else None,
                    metrics=s.get("metrics") if isinstance(s.get("metrics"), list) else None,
                    timeline_steps=s.get("timeline_steps") if isinstance(s.get("timeline_steps"), list) else None,
                    quote=s.get("quote") if isinstance(s.get("quote"), dict) else None,
                    image_keyword=kw,
                    image_url=img_url,
                    image_caption=s.get("image_caption") or f"Visual guide for {req.topic}",
                    speaker_notes=str(s.get("speaker_notes") or f"Guide students through key ideas of this slide.")
                )
                slides_list.append(item)

            if not slides_list:
                raise ValueError("Could not assemble valid slides from LLM output.")

            return PresentationData(
                id=f"ppt-{int(os.times()[4] * 1000)}",
                title=str(parsed.get("title") or req.topic),
                subtitle=str(parsed.get("subtitle") or f"A comprehensive study presentation for {req.target_audience}"),
                topic=req.topic,
                target_audience=req.target_audience,
                num_slides=len(slides_list),
                theme=req.theme,
                language=req.language,
                teacher_guidance=req.teacher_guidance,
                slides=slides_list
            )

        except Exception as e:
            status_code, detail = format_ai_exception_detail(e, "Presentation Deck Synthesis")
            raise HTTPException(status_code=status_code, detail=detail)

    async def refine_slide(self, req: RefineSlideRequest) -> SlideItem:
        """Refines or rephrases an individual slide based on teacher's specific instruction."""
        prompt = f"""You are DEVGYA's AI Slide Polisher.
Refine this educational slide based on the teacher's instruction.

TOPIC: {req.topic}
TARGET AUDIENCE: {req.target_audience}
TEACHER INSTRUCTION: {req.instruction}

CURRENT SLIDE DATA:
{json.dumps(req.slide.dict(), indent=2)}

RETURN UPDATED SLIDE JSON ONLY with the same keys (slide_number, layout, category, title, subtitle, bullets, left_column, right_column, metrics, timeline_steps, quote, image_keyword, image_url, image_caption, speaker_notes)."""

        try:
            raw = await ai_provider.chat_completion(
                messages=[
                    {"role": "system", "content": "You are DEVGYA's Slide Refiner. Return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000,
                response_format_json=True
            )
            parsed = robust_json_parser(raw)
            kw = str(parsed.get("image_keyword") or req.slide.image_keyword)
            return SlideItem(
                slide_number=req.slide.slide_number,
                layout=str(parsed.get("layout") or req.slide.layout),
                category=str(parsed.get("category") or req.slide.category),
                title=str(parsed.get("title") or req.slide.title),
                subtitle=str(parsed.get("subtitle") or req.slide.subtitle or ""),
                bullets=parsed.get("bullets") or req.slide.bullets,
                left_column=parsed.get("left_column") or req.slide.left_column,
                right_column=parsed.get("right_column") or req.slide.right_column,
                metrics=parsed.get("metrics") or req.slide.metrics,
                timeline_steps=parsed.get("timeline_steps") or req.slide.timeline_steps,
                quote=parsed.get("quote") or req.slide.quote,
                image_keyword=kw,
                image_url=parsed.get("image_url") or req.slide.image_url or _get_image_for_keyword(kw),
                image_caption=parsed.get("image_caption") or req.slide.image_caption,
                speaker_notes=str(parsed.get("speaker_notes") or req.slide.speaker_notes)
            )
        except Exception as e:
            status_code, detail = format_ai_exception_detail(e, "Slide Polish")
            raise HTTPException(status_code=status_code, detail=detail)

    def generate_pptx(self, pres_data: PresentationData) -> bytes:
        """Builds a real 16:9 Microsoft PowerPoint (.pptx) file."""
        prs = Presentation()
        # Set 16:9 Widescreen aspect ratio
        prs.slide_width = Inches(13.333)
        prs.slide_height = Inches(7.5)

        blank_layout = prs.slide_layouts[6] # Blank slide
        theme = THEME_PRESETS.get(pres_data.theme, THEME_PRESETS["modern_navy"])
        c_primary = RGBColor(*theme["rgb_primary"])
        c_accent = RGBColor(*theme["rgb_accent"])
        c_card = RGBColor(*theme["rgb_card"])
        c_bg = RGBColor(*theme["rgb_bg"])

        for s in pres_data.slides:
            slide = prs.slides.add_slide(blank_layout)

            # Slide background card shape
            bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
            bg_shape.fill.solid()
            bg_shape.fill.fore_color.rgb = c_bg
            bg_shape.line.fill.background()

            # Top Accent Header Bar
            header_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.5), Inches(11.733), Inches(0.12))
            header_bar.fill.solid()
            header_bar.fill.fore_color.rgb = c_accent
            header_bar.line.fill.background()

            # Category Pill & Slide Number
            cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(9.0), Inches(0.4))
            tf_cat = cat_box.text_frame
            tf_cat.word_wrap = True
            p_cat = tf_cat.paragraphs[0]
            p_cat.text = f"{s.category.upper()}  •  DEVGYA AI STUDY SUITE"
            p_cat.font.size = Pt(10)
            p_cat.font.bold = True
            p_cat.font.color.rgb = c_accent

            num_box = slide.shapes.add_textbox(Inches(10.5), Inches(0.7), Inches(2.0), Inches(0.4))
            p_num = num_box.text_frame.paragraphs[0]
            p_num.alignment = PP_ALIGN.RIGHT
            p_num.text = f"Slide {s.slide_number} of {len(pres_data.slides)}"
            p_num.font.size = Pt(10)
            p_num.font.bold = True
            p_num.font.color.rgb = RGBColor(148, 163, 184)

            # Main Slide Title & Subtitle
            title_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.1), Inches(11.733), Inches(1.1))
            tf_title = title_box.text_frame
            tf_title.word_wrap = True
            p_t = tf_title.paragraphs[0]
            p_t.text = s.title
            p_t.font.size = Pt(24)
            p_t.font.bold = True
            p_t.font.color.rgb = c_primary

            if s.subtitle:
                p_sub = tf_title.add_paragraph()
                p_sub.text = s.subtitle
                p_sub.font.size = Pt(13)
                p_sub.font.color.rgb = RGBColor(71, 85, 105)

            # Layout specific body rendering
            content_top = Inches(2.3)
            content_height = Inches(4.3)

            if s.layout == "two_column" and (s.left_column or s.right_column):
                # Left Column Box
                col_w = Inches(5.6)
                card_l = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), content_top, col_w, content_height)
                card_l.fill.solid()
                card_l.fill.fore_color.rgb = c_card
                card_l.line.color.rgb = RGBColor(226, 232, 240)

                tf_l = card_l.text_frame
                tf_l.word_wrap = True
                tf_l.margin_left = Inches(0.3)
                tf_l.margin_right = Inches(0.3)
                tf_l.margin_top = Inches(0.3)

                col_l_title = (s.left_column or {}).get("title", "Part 1")
                p_lt = tf_l.paragraphs[0]
                p_lt.text = col_l_title
                p_lt.font.size = Pt(16)
                p_lt.font.bold = True
                p_lt.font.color.rgb = c_primary

                for b in (s.left_column or {}).get("bullets", []):
                    p_b = tf_l.add_paragraph()
                    p_b.text = f"• {b}"
                    p_b.font.size = Pt(12)
                    p_b.font.color.rgb = RGBColor(51, 65, 85)

                # Right Column Box
                card_r = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), content_top, col_w, content_height)
                card_r.fill.solid()
                card_r.fill.fore_color.rgb = c_card
                card_r.line.color.rgb = RGBColor(226, 232, 240)

                tf_r = card_r.text_frame
                tf_r.word_wrap = True
                tf_r.margin_left = Inches(0.3)
                tf_r.margin_right = Inches(0.3)
                tf_r.margin_top = Inches(0.3)

                col_r_title = (s.right_column or {}).get("title", "Part 2")
                p_rt = tf_r.paragraphs[0]
                p_rt.text = col_r_title
                p_rt.font.size = Pt(16)
                p_rt.font.bold = True
                p_rt.font.color.rgb = c_primary

                for b in (s.right_column or {}).get("bullets", []):
                    p_b = tf_r.add_paragraph()
                    p_b.text = f"• {b}"
                    p_b.font.size = Pt(12)
                    p_b.font.color.rgb = RGBColor(51, 65, 85)

            elif s.layout == "stat_highlight" and s.metrics:
                # Stat boxes
                num_stats = min(len(s.metrics), 4)
                box_w = Inches(11.733 / num_stats - 0.2)
                for i, m in enumerate(s.metrics[:num_stats]):
                    left_pos = Inches(0.8 + i * (11.733 / num_stats))
                    stat_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_pos, content_top, box_w, content_height)
                    stat_card.fill.solid()
                    stat_card.fill.fore_color.rgb = c_card
                    stat_card.line.color.rgb = c_accent

                    tf_s = stat_card.text_frame
                    tf_s.word_wrap = True
                    tf_s.vertical_anchor = MSO_ANCHOR.MIDDLE

                    p_val = tf_s.paragraphs[0]
                    p_val.text = str(m.get("value", ""))
                    p_val.font.size = Pt(32)
                    p_val.font.bold = True
                    p_val.font.color.rgb = c_accent
                    p_val.alignment = PP_ALIGN.CENTER

                    p_lbl = tf_s.add_paragraph()
                    p_lbl.text = str(m.get("label", ""))
                    p_lbl.font.size = Pt(13)
                    p_lbl.font.bold = True
                    p_lbl.font.color.rgb = c_primary
                    p_lbl.alignment = PP_ALIGN.CENTER

            elif s.layout == "quote_insight" and s.quote:
                # Quote box
                q_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), content_top, Inches(10.333), content_height)
                q_card.fill.solid()
                q_card.fill.fore_color.rgb = c_card
                q_card.line.color.rgb = c_accent

                tf_q = q_card.text_frame
                tf_q.word_wrap = True
                tf_q.margin_left = Inches(0.6)
                tf_q.margin_right = Inches(0.6)
                tf_q.vertical_anchor = MSO_ANCHOR.MIDDLE

                p_q = tf_q.paragraphs[0]
                p_q.text = f"“{s.quote.get('text', '')}”"
                p_q.font.size = Pt(20)
                p_q.font.italic = True
                p_q.font.color.rgb = c_primary
                p_q.alignment = PP_ALIGN.CENTER

                p_qa = tf_q.add_paragraph()
                p_qa.text = f"— {s.quote.get('author', 'Core Pedagogical Principle')}"
                p_qa.font.size = Pt(13)
                p_qa.font.bold = True
                p_qa.font.color.rgb = c_accent
                p_qa.alignment = PP_ALIGN.CENTER

            else:
                # Standard Bullet Cards + Image Preview side-by-side
                card_bullets = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), content_top, Inches(7.5), content_height)
                card_bullets.fill.solid()
                card_bullets.fill.fore_color.rgb = c_card
                card_bullets.line.color.rgb = RGBColor(226, 232, 240)

                tf_b = card_bullets.text_frame
                tf_b.word_wrap = True
                tf_b.margin_left = Inches(0.4)
                tf_b.margin_right = Inches(0.4)
                tf_b.margin_top = Inches(0.4)

                first_p = True
                for b in s.bullets:
                    clean_b = b.replace("**", "").replace("*", "")
                    if first_p:
                        p_line = tf_b.paragraphs[0]
                        first_p = False
                    else:
                        p_line = tf_b.add_paragraph()
                    p_line.text = f"• {clean_b}"
                    p_line.font.size = Pt(13)
                    p_line.font.color.rgb = RGBColor(30, 41, 59)
                    p_line.space_after = Pt(10)

                # Right Image Box / Caption Info Card
                card_img = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.7), content_top, Inches(3.8), content_height)
                card_img.fill.solid()
                card_img.fill.fore_color.rgb = c_primary
                card_img.line.fill.background()

                tf_img = card_img.text_frame
                tf_img.word_wrap = True
                tf_img.margin_left = Inches(0.3)
                tf_img.margin_right = Inches(0.3)
                tf_img.vertical_anchor = MSO_ANCHOR.MIDDLE

                p_ik = tf_img.paragraphs[0]
                p_ik.text = f"VISUAL FOCUS"
                p_ik.font.size = Pt(11)
                p_ik.font.bold = True
                p_ik.font.color.rgb = c_accent

                p_cap = tf_img.add_paragraph()
                p_cap.text = s.image_caption or s.image_keyword
                p_cap.font.size = Pt(14)
                p_cap.font.bold = True
                p_cap.font.color.rgb = RGBColor(255, 255, 255)

                p_link = tf_img.add_paragraph()
                p_link.text = f"Topic: {pres_data.topic}\nAudience: {pres_data.target_audience}"
                p_link.font.size = Pt(10)
                p_link.font.color.rgb = RGBColor(203, 213, 225)

            # Speaker Notes in PPTX
            if s.speaker_notes:
                notes_slide = slide.notes_slide
                text_frame = notes_slide.notes_text_frame
                text_frame.text = f"TEACHER SPEAKER NOTES:\n{s.speaker_notes}"

        out_buffer = io.BytesIO()
        prs.save(out_buffer)
        out_bytes = out_buffer.getvalue()
        out_buffer.close()
        return out_bytes

    def generate_pdf(self, pres_data: PresentationData) -> bytes:
        """Builds a high-impact landscape slide deck PDF using ReportLab."""
        buffer = io.BytesIO()

        # Landscape A4 size: 841.89 x 595.27 points
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            leftMargin=36,
            rightMargin=36,
            topMargin=32,
            bottomMargin=32
        )

        theme = THEME_PRESETS.get(pres_data.theme, THEME_PRESETS["modern_navy"])
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'SlideTitle',
            parent=styles['Heading1'],
            fontName=UNICODE_BOLD_FONT_NAME,
            fontSize=18,
            leading=22,
            textColor=colors.HexColor(theme["primary"])
        )

        subtitle_style = ParagraphStyle(
            'SlideSubtitle',
            parent=styles['Normal'],
            fontName=UNICODE_FONT_NAME,
            fontSize=11,
            leading=15,
            textColor=colors.HexColor(theme["text_secondary"])
        )

        cat_badge_style = ParagraphStyle(
            'CatBadge',
            parent=styles['Normal'],
            fontName=UNICODE_BOLD_FONT_NAME,
            fontSize=9,
            leading=12,
            textColor=colors.HexColor(theme["accent"])
        )

        bullet_style = ParagraphStyle(
            'BulletText',
            parent=styles['Normal'],
            fontName=UNICODE_FONT_NAME,
            fontSize=10.5,
            leading=16,
            textColor=colors.HexColor(theme["text_primary"])
        )

        notes_style = ParagraphStyle(
            'NotesText',
            parent=styles['Normal'],
            fontName=UNICODE_FONT_NAME,
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#475569")
        )

        story = []

        total_slides = len(pres_data.slides)
        for idx, s in enumerate(pres_data.slides):
            slide_elements = []

            # 1. Slide Top Bar Table
            top_bar_data = [
                [
                    Paragraph(f"<b>DEVGYA GLOBAL EDUTECH</b> • {strip_emojis_for_pdf(pres_data.topic).upper()}", cat_badge_style),
                    Paragraph(f"<b>Slide {s.slide_number} of {total_slides}</b>", cat_badge_style)
                ]
            ]
            top_table = Table(top_bar_data, colWidths=[550, 220])
            top_table.setStyle(TableStyle([
                ('ALIGN', (0,0), (0,0), 'LEFT'),
                ('ALIGN', (1,0), (1,0), 'RIGHT'),
                ('PADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ]))
            slide_elements.append(top_table)
            slide_elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor(theme["accent"]), spaceBefore=2, spaceAfter=8))

            # 2. Category & Slide Title
            slide_elements.append(Paragraph(strip_emojis_for_pdf(s.category).upper(), cat_badge_style))
            slide_elements.append(Spacer(1, 2))
            clean_title = clean_md_to_reportlab(strip_emojis_for_pdf(s.title))
            slide_elements.append(Paragraph(clean_title, title_style))
            if s.subtitle:
                clean_sub = clean_md_to_reportlab(strip_emojis_for_pdf(s.subtitle))
                slide_elements.append(Paragraph(clean_sub, subtitle_style))
            slide_elements.append(Spacer(1, 10))

            # 3. Slide Content Card
            content_rows = []
            if s.layout == "two_column" and (s.left_column or s.right_column):
                l_title = (s.left_column or {}).get("title", "Aspect A")
                r_title = (s.right_column or {}).get("title", "Aspect B")
                l_bullets = "<br/>• ".join([clean_md_to_reportlab(strip_emojis_for_pdf(b)) for b in (s.left_column or {}).get("bullets", [])])
                r_bullets = "<br/>• ".join([clean_md_to_reportlab(strip_emojis_for_pdf(b)) for b in (s.right_column or {}).get("bullets", [])])

                cell_l = Paragraph(f"<b>{clean_md_to_reportlab(l_title)}</b><br/><br/>• {l_bullets}", bullet_style)
                cell_r = Paragraph(f"<b>{clean_md_to_reportlab(r_title)}</b><br/><br/>• {r_bullets}", bullet_style)
                content_rows.append([cell_l, cell_r])
                card_table = Table(content_rows, colWidths=[380, 380])
                card_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(theme["card_bg"])),
                    ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
                    ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
                    ('PADDING', (0,0), (-1,-1), 10),
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ]))
                slide_elements.append(card_table)

            elif s.layout == "stat_highlight" and s.metrics:
                metric_cells = []
                for m in s.metrics[:3]:
                    val = clean_md_to_reportlab(strip_emojis_for_pdf(str(m.get("value", ""))))
                    lbl = clean_md_to_reportlab(strip_emojis_for_pdf(str(m.get("label", ""))))
                    metric_cells.append(Paragraph(f"<font size=22 color='{theme['accent']}'><b>{val}</b></font><br/><br/><b>{lbl}</b>", bullet_style))
                while len(metric_cells) < 3:
                    metric_cells.append(Paragraph("", bullet_style))

                card_table = Table([metric_cells], colWidths=[250, 250, 260])
                card_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(theme["card_bg"])),
                    ('BOX', (0,0), (-1,-1), 1, colors.HexColor(theme["accent"])),
                    ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
                    ('PADDING', (0,0), (-1,-1), 16),
                    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ]))
                slide_elements.append(card_table)

            else:
                # Main Bullet Card + Visual Callout
                bullets_p = []
                for b in s.bullets:
                    bullets_p.append(Paragraph(f"• {clean_md_to_reportlab(strip_emojis_for_pdf(b))}", bullet_style))
                    bullets_p.append(Spacer(1, 4))

                callout_p = [
                    Paragraph(f"<b>VISUAL CONCEPT FOCUS:</b>", cat_badge_style),
                    Spacer(1, 4),
                    Paragraph(clean_md_to_reportlab(strip_emojis_for_pdf(s.image_caption or s.image_keyword)), bullet_style),
                    Spacer(1, 8),
                    Paragraph(f"<i>Keywords: {strip_emojis_for_pdf(s.image_keyword)}</i>", notes_style)
                ]

                card_table = Table([[bullets_p, callout_p]], colWidths=[520, 240])
                card_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (0,0), colors.HexColor(theme["card_bg"])),
                    ('BACKGROUND', (1,0), (1,0), colors.HexColor("#F8FAFC")),
                    ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
                    ('INNERGRID', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
                    ('PADDING', (0,0), (-1,-1), 10),
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ]))
                slide_elements.append(card_table)

            # 4. Teacher Speaker Notes Box at bottom
            if s.speaker_notes:
                slide_elements.append(Spacer(1, 8))
                notes_clean = clean_md_to_reportlab(strip_emojis_for_pdf(s.speaker_notes))
                notes_table = Table(
                    [[Paragraph(f"<b>TEACHER PEDAGOGY GUIDANCE / SPEAKER NOTES:</b> {notes_clean}", notes_style)]],
                    colWidths=[760]
                )
                notes_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
                    ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#94A3B8")),
                    ('PADDING', (0,0), (-1,-1), 6),
                ]))
                slide_elements.append(notes_table)

            story.append(KeepTogether(slide_elements))

            # Pagebreak between slides (except last)
            if idx < total_slides - 1:
                from reportlab.platypus import PageBreak
                story.append(PageBreak())

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

ppt_service = PPTGeneratorService()
