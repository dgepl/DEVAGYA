import io
import os
import re
import zipfile
import xml.etree.ElementTree as ET
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from schemas.question import GeneratedPaperResponse


def extract_pdf_content(file_bytes: bytes, max_pages: int = 30):
    """Extract text from a PDF file using PyMuPDF (pymupdf), falling back to rendering page images if scanned."""
    extracted_text = ""
    image_data_url = None
    
    try:
        import pymupdf
        from PIL import Image
        import base64
        
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        pages_text = []
        for idx, page in enumerate(doc[:max_pages]):
            text = page.get_text() or ""
            if text.strip():
                pages_text.append(f"--- Page {idx + 1} ---\n{text.strip()}")
        
        extracted_text = "\n\n".join(pages_text)
        
        # If PDF is scanned / has no readable digital text stream (< 50 chars), render page 1 as JPEG image for Vision AI
        if len(extracted_text.strip()) < 50 and len(doc) > 0:
            page = doc[0]
            pix = page.get_pixmap(dpi=150)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            if img.width > 1280:
                h = int(img.height * 1280 / img.width)
                img = img.resize((1280, h))
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=80)
            enc = base64.b64encode(buf.getvalue()).decode("ascii")
            image_data_url = f"data:image/jpeg;base64,{enc}"
        doc.close()
    except Exception:
        # Fallback to pypdf if pymupdf fails
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            pages_text = []
            for idx, page in enumerate(reader.pages[:max_pages]):
                text = page.extract_text() or ""
                if text.strip():
                    pages_text.append(f"--- Page {idx + 1} ---\n{text.strip()}")
            extracted_text = "\n\n".join(pages_text)
        except Exception as e:
            extracted_text = f"[Error parsing PDF document: {e}]"
            
    return extracted_text, image_data_url


def extract_text_from_pdf(file_bytes: bytes, max_pages: int = 30) -> str:
    """Extract text from a PDF file."""
    text, _ = extract_pdf_content(file_bytes, max_pages)
    return text


def extract_docx_text(file_bytes: bytes) -> str:
    """Extract text from a DOCX file using standard library zipfile."""
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
            xml_content = z.read("word/document.xml")
            tree = ET.fromstring(xml_content)
            texts = [node.text for node in tree.iter() if node.tag.endswith("t") and node.text]
            return "\n".join(texts)
    except Exception as e:
        return f"[Error parsing Word document: {e}]"


def extract_document_text(file_bytes: bytes, filename: str, content_type: str = "") -> str:
    """Extract readable text content from PDF, DOCX, TXT, or Worksheet files."""
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf" or "pdf" in (content_type or "").lower():
        text = extract_text_from_pdf(file_bytes)
    elif ext in (".docx", ".doc"):
        text = extract_docx_text(file_bytes)
    else:
        try:
            text = file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            text = f"[Attached Document: {filename}]"

    # Truncate if larger than 35k chars to keep LLM context clean
    if len(text) > 35000:
        text = text[:35000] + f"\n\n[...Truncated remaining text of {filename} for prompt context size limit...]"
    return text

class NumberedCanvas(canvas.Canvas):
    """Custom canvas for adding page numbers and subtle watermark."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_watermark_and_footer(num_pages)
            super().showPage()
        super().save()

    def draw_watermark_and_footer(self, page_count):
        self.saveState()
        # Clean Footer with Page Numbers only (No Watermark/Platform Branding)
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[0] - 40, 20, page_str)
        
        self.line(40, 32, A4[0] - 40, 32)
        self.restoreState()


class PDFGeneratorService:
    def generate_question_paper_pdf(self, paper: GeneratedPaperResponse, include_answers: bool = False) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=45
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'SchoolTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            alignment=1, # Center
            textColor=colors.HexColor("#1E1B4B") # Indigo 950
        )

        subtitle_style = ParagraphStyle(
            'SubTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            alignment=1,
            textColor=colors.HexColor("#3730A3") # Indigo 800
        )

        meta_style = ParagraphStyle(
            'MetaText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#1E293B")
        )

        instruction_style = ParagraphStyle(
            'Instruction',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#475569")
        )

        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            spaceBefore=10,
            spaceAfter=6,
            textColor=colors.HexColor("#1E1B4B"),
            backColor=colors.HexColor("#EEF2FF"),
            borderPadding=4
        )

        q_text_style = ParagraphStyle(
            'QuestionText',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#0F172A")
        )

        option_style = ParagraphStyle(
            'OptionText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            leftIndent=15,
            textColor=colors.HexColor("#334155")
        )

        answer_style = ParagraphStyle(
            'AnswerText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            leftIndent=15,
            textColor=colors.HexColor("#047857") # Emerald 700
        )

        worksheet_line_style = ParagraphStyle(
            'WorksheetLine',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=9,
            leading=14,
            leftIndent=15,
            textColor=colors.HexColor("#94A3B8")
        )

        story = []

        # Process School Logo if available
        logo_element = None
        raw_logo = getattr(paper, "school_logo", None)
        if raw_logo:
            try:
                import base64
                if str(raw_logo).startswith(("http://", "https://")):
                    import httpx
                    with httpx.Client(timeout=5.0) as client:
                        res = client.get(raw_logo)
                        if res.status_code == 200:
                            logo_io = io.BytesIO(res.content)
                            logo_element = RLImage(logo_io, width=48, height=48)
                elif "base64," in str(raw_logo):
                    base64_data = str(raw_logo).split("base64,")[1]
                    logo_bytes = base64.b64decode(base64_data)
                    logo_io = io.BytesIO(logo_bytes)
                    logo_element = RLImage(logo_io, width=48, height=48)
                elif os.path.exists(str(raw_logo)):
                    logo_element = RLImage(str(raw_logo), width=48, height=48)
            except Exception as e:
                pass

        # Fallback to DEVGYA official logo if available
        if not logo_element:
            default_logo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "logo.png"))
            if os.path.exists(default_logo_path):
                try:
                    logo_element = RLImage(default_logo_path, width=48, height=48)
                except Exception:
                    pass

        # Header Block
        header_title = f"{paper.title} (TEACHER ANSWER KEY)" if include_answers else paper.title

        if logo_element:
            header_table_data = [
                [
                    logo_element,
                    [
                        Paragraph(paper.school_name.upper(), title_style),
                        Spacer(1, 3),
                        Paragraph(f"{header_title} — {paper.subject.upper()}", subtitle_style)
                    ]
                ]
            ]
            header_table = Table(header_table_data, colWidths=[60, 460])
            header_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('ALIGN', (0,0), (0,0), 'CENTER'),
                ('ALIGN', (1,0), (1,0), 'CENTER'),
                ('PADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(header_table)
        else:
            story.append(Paragraph(paper.school_name.upper(), title_style))
            story.append(Spacer(1, 4))
            story.append(Paragraph(f"{header_title} — {paper.subject.upper()}", subtitle_style))
        story.append(Spacer(1, 8))

        # Metadata Table (Class, Time, Marks, Chapter)
        meta_data = [
            [
                Paragraph(f"<b>Class:</b> {paper.class_name}", meta_style),
                Paragraph(f"<b>Max Marks:</b> {paper.total_marks}", meta_style),
                Paragraph(f"<b>Time:</b> {paper.time_allowed_mins} Mins", meta_style)
            ],
            [
                Paragraph(f"<b>Chapter:</b> {paper.chapter}", meta_style),
                Paragraph(f"<b>Difficulty:</b> {paper.difficulty.capitalize()}", meta_style),
                Paragraph(f"<b>Date:</b> Academic Session 2025-26", meta_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[180, 170, 170])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 10))

        # Instructions
        story.append(Paragraph("<b>General Instructions:</b>", meta_style))
        for inst in paper.instructions:
            story.append(Paragraph(f"• {inst}", instruction_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#6366F1"), spaceBefore=5, spaceAfter=10))

        # Separate into Sections
        mcqs = [q for q in paper.questions if q.question_type == 'mcq']
        shorts = [q for q in paper.questions if q.question_type == 'short']
        longs = [q for q in paper.questions if q.question_type == 'long']
        import html
        def render_question_block(q):
            q_elements = []

            q_text_formatted = html.escape(q.question_text or "").replace("\n", "<br/>")
            q_elements.append(Paragraph(f"<b>Q{q.question_number}.</b> {q_text_formatted} <font color='#6366F1'><b>[{q.marks} Mark{'s' if q.marks > 1 else ''}]</b></font>", q_text_style))

            if q.options:
                escaped_opts = [html.escape(opt) for opt in q.options]
                opt_str = "&nbsp;&nbsp;&nbsp;&nbsp;".join(escaped_opts)
                q_elements.append(Spacer(1, 3))
                q_elements.append(Paragraph(opt_str, option_style))

            if include_answers:
                q_elements.append(Spacer(1, 2))
                ans_text = html.escape(str(q.answer or ""))
                q_elements.append(Paragraph(f"<b>Correct Answer:</b> {ans_text}", answer_style))
                if q.explanation:
                    exp_text = html.escape(str(q.explanation or ""))
                    q_elements.append(Paragraph(f"<b>Explanation:</b> {exp_text}", answer_style))

            q_elements.append(Spacer(1, 8))
            return q_elements

        if mcqs:
            story.append(Paragraph("SECTION A: MULTIPLE CHOICE QUESTIONS", section_style))
            for q in mcqs:
                story.extend(render_question_block(q))

        if shorts:
            story.append(Paragraph("SECTION B: SHORT ANSWER QUESTIONS", section_style))
            for q in shorts:
                story.extend(render_question_block(q))

        if longs:
            story.append(Paragraph("SECTION C: LONG ANSWER QUESTIONS", section_style))
            for q in longs:
                story.extend(render_question_block(q))

        doc.build(story, canvasmaker=NumberedCanvas)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

    def generate_worksheet_pdf(self, payload: Dict[str, Any]) -> bytes:
        """
        Generate a publication-grade A4 Worksheet / Study Guide PDF from AI text/markdown
        with custom theme palettes, school branding, student header, and student vs teacher key modes.
        """
        title = str(payload.get("title") or "Classroom Practice Worksheet")
        subject = str(payload.get("subject") or "General Studies")
        class_name = str(payload.get("class_name") or "Class 10")
        chapter = str(payload.get("chapter") or "Academic Session")
        school_name = str(payload.get("school_name") or "DEVGYA GLOBAL ACADEMY")
        school_logo = payload.get("school_logo")
        theme_name = str(payload.get("theme") or "cbse").lower()
        font_size_mode = str(payload.get("font_size") or "standard").lower()
        include_answers = bool(payload.get("include_answers", False))
        include_student_header = bool(payload.get("include_student_header", True))
        content = str(payload.get("content") or "")

        # Theme Color Palettes
        THEME_COLORS = {
            "cbse": {
                "primary": colors.HexColor("#1E3A8A"),      # Navy 900
                "secondary": colors.HexColor("#3B82F6"),    # Blue 500
                "border": colors.HexColor("#93C5FD"),       # Blue 200
                "bg_meta": colors.HexColor("#F0F9FF"),      # Light Sky
                "highlight": colors.HexColor("#1D4ED8")     # Blue 700
            },
            "modern": {
                "primary": colors.HexColor("#4338CA"),      # Indigo 700
                "secondary": colors.HexColor("#06B6D4"),    # Cyan 500
                "border": colors.HexColor("#C7D2FE"),       # Indigo 200
                "bg_meta": colors.HexColor("#EEF2FF"),      # Light Indigo
                "highlight": colors.HexColor("#6366F1")     # Indigo 500
            },
            "minimalist": {
                "primary": colors.HexColor("#0F172A"),      # Slate 900
                "secondary": colors.HexColor("#475569"),    # Slate 600
                "border": colors.HexColor("#CBD5E1"),       # Slate 300
                "bg_meta": colors.HexColor("#F8FAFC"),      # Slate 50
                "highlight": colors.HexColor("#334155")     # Slate 700
            },
            "emerald": {
                "primary": colors.HexColor("#065F46"),      # Emerald 800
                "secondary": colors.HexColor("#10B981"),    # Emerald 500
                "border": colors.HexColor("#A7F3D0"),       # Emerald 200
                "bg_meta": colors.HexColor("#ECFDF5"),      # Light Emerald
                "highlight": colors.HexColor("#047857")     # Emerald 700
            }
        }
        th = THEME_COLORS.get(theme_name, THEME_COLORS["cbse"])

        # Font & Spacing Configurations
        if font_size_mode == "compact":
            margins = 24
            base_font = 9
            base_leading = 12
            q_font = 9.5
            title_font = 13
        elif font_size_mode == "large":
            margins = 36
            base_font = 11
            base_leading = 16
            q_font = 11.5
            title_font = 16
        else:
            margins = 32
            base_font = 10
            base_leading = 14
            q_font = 10.5
            title_font = 14

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=margins,
            rightMargin=margins,
            topMargin=margins,
            bottomMargin=margins
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'WTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=title_font,
            leading=title_font + 4,
            alignment=1, # Centered
            textColor=th["primary"]
        )

        subtitle_style = ParagraphStyle(
            'WSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=base_font + 1,
            leading=base_leading + 2,
            alignment=1,
            textColor=th["secondary"]
        )

        meta_style = ParagraphStyle(
            'WMeta',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=base_font - 1,
            leading=base_leading - 2,
            textColor=colors.HexColor("#334155")
        )

        section_heading_style = ParagraphStyle(
            'WSection',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=base_font + 1,
            leading=base_leading + 3,
            textColor=th["primary"],
            spaceBefore=6,
            spaceAfter=4
        )

        body_style = ParagraphStyle(
            'WBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=base_font,
            leading=base_leading,
            textColor=colors.HexColor("#1E293B"),
            spaceBefore=2,
            spaceAfter=3
        )

        question_style = ParagraphStyle(
            'WQuestion',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=q_font,
            leading=base_leading + 1,
            textColor=colors.HexColor("#0F172A"),
            spaceBefore=4,
            spaceAfter=2
        )

        answer_box_style = ParagraphStyle(
            'WAnswer',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=base_font - 0.5,
            leading=base_leading,
            leftIndent=12,
            textColor=th["highlight"]
        )

        blank_line_style = ParagraphStyle(
            'WBlank',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=base_font - 1,
            leading=base_leading,
            leftIndent=12,
            textColor=colors.HexColor("#94A3B8")
        )

        story = []

        # Process School Logo
        logo_element = None
        if school_logo:
            try:
                import base64
                if str(school_logo).startswith(("http://", "https://")):
                    import httpx
                    with httpx.Client(timeout=5.0) as client:
                        res = client.get(school_logo)
                        if res.status_code == 200:
                            logo_io = io.BytesIO(res.content)
                            logo_element = RLImage(logo_io, width=44, height=44)
                elif "base64," in str(school_logo):
                    base64_data = str(school_logo).split("base64,")[1]
                    logo_bytes = base64.b64decode(base64_data)
                    logo_io = io.BytesIO(logo_bytes)
                    logo_element = RLImage(logo_io, width=44, height=44)
                elif os.path.exists(str(school_logo)):
                    logo_element = RLImage(str(school_logo), width=44, height=44)
            except Exception:
                pass

        if not logo_element:
            default_logo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "logo.png"))
            if os.path.exists(default_logo_path):
                try:
                    logo_element = RLImage(default_logo_path, width=44, height=44)
                except Exception:
                    pass

        header_title = f"{title} (TEACHER ANSWER KEY)" if include_answers else title

        if logo_element:
            header_table_data = [
                [
                    logo_element,
                    [
                        Paragraph(school_name.upper(), title_style),
                        Spacer(1, 2),
                        Paragraph(f"{header_title} — {subject.upper()} ({class_name.upper()})", subtitle_style)
                    ]
                ]
            ]
            header_table = Table(header_table_data, colWidths=[55, 475])
            header_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('ALIGN', (0,0), (0,0), 'CENTER'),
                ('ALIGN', (1,0), (1,0), 'CENTER'),
                ('PADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ]))
            story.append(header_table)
        else:
            story.append(Paragraph(school_name.upper(), title_style))
            story.append(Spacer(1, 3))
            story.append(Paragraph(f"{header_title} — {subject.upper()} ({class_name.upper()})", subtitle_style))
        story.append(Spacer(1, 6))

        # Student Details Info Box
        if include_student_header and not include_answers:
            student_box_data = [
                [
                    Paragraph("<b>Student Name:</b> ___________________________", meta_style),
                    Paragraph("<b>Roll No:</b> ________", meta_style),
                    Paragraph("<b>Class / Sec:</b> ____________", meta_style),
                    Paragraph("<b>Date:</b> ____________", meta_style)
                ]
            ]
            student_table = Table(student_box_data, colWidths=[200, 100, 115, 115])
            student_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), th["bg_meta"]),
                ('BOX', (0,0), (-1,-1), 1, th["border"]),
                ('INNERGRID', (0,0), (-1,-1), 0.5, th["border"]),
                ('PADDING', (0,0), (-1,-1), 5),
            ]))
            story.append(student_table)
            story.append(Spacer(1, 6))

        # Divider Rule
        story.append(HRFlowable(width="100%", thickness=1.5, color=th["primary"], spaceBefore=3, spaceAfter=8))

        # Parse AI Generated Content Lines
        import html
        raw_lines = content.split("\n")
        in_solution_block = False

        for raw_line in raw_lines:
            line = raw_line.strip()
            if not line:
                story.append(Spacer(1, 4))
                continue

            # Strip markdown formatting bold/italic artifacts safely
            clean_line = html.escape(line)
            clean_line = clean_line.replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>")

            # Check if line is a Heading (#, ##, ###, or SECTION)
            if line.startswith(("#", "SECTION", "Section", "PART", "Part", "**SECTION", "**Section")):
                heading_text = line.lstrip("#* \t")
                story.append(Spacer(1, 4))
                story.append(Paragraph(f"<b>{html.escape(heading_text)}</b>", section_heading_style))
                story.append(HRFlowable(width="100%", thickness=0.75, color=th["border"], spaceBefore=1, spaceAfter=5))
            
            # Check if line is a Question (e.g. "1.", "Q1.", "Question 1:", "2)")
            elif line.startswith(("1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10.", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Question", "**Q")):
                q_text = line.replace("**", "")
                story.append(Spacer(1, 3))
                story.append(Paragraph(f"<b>{html.escape(q_text)}</b>", question_style))
                # If student mode, add blank answer line
                if not include_answers and not any(opt in line for opt in ["(A)", "(B)", "(a)", "(b)"]):
                    story.append(Paragraph("Answer: ____________________________________________________________________________", blank_line_style))
                    story.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____________________________________________________________________________", blank_line_style))

            # Check if line is an MCQ Option (e.g. (A), (B), A), B))
            elif line.startswith(("(", "A.", "B.", "C.", "D.", "a)", "b)", "c)", "d)", "A)", "B)", "C)", "D)")):
                story.append(Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;{clean_line.replace('**', '')}", body_style))

            # Check if line is an Answer or Solution line
            elif line.lower().startswith(("answer:", "solution:", "correct answer:", "explanation:", "**answer:", "**solution:")):
                if include_answers:
                    ans_text = line.replace("**", "")
                    story.append(Paragraph(f"✓ <b>{html.escape(ans_text)}</b>", answer_box_style))
                else:
                    # In student mode, omit solutions
                    pass

            # Regular Paragraph Line
            else:
                formatted_body = clean_line.replace("**", "<b>").replace("__", "<i>")
                story.append(Paragraph(formatted_body, body_style))

        doc.build(story, canvasmaker=NumberedCanvas)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

pdf_generator_service = PDFGeneratorService()
