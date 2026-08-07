import io
import os
import re
import zipfile
import xml.etree.ElementTree as ET
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from schemas.question import GeneratedPaperResponse


def extract_text_from_pdf(file_bytes: bytes, max_pages: int = 30) -> str:
    """Extract text from a PDF file using pypdf."""
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        pages_text = []
        for idx, page in enumerate(reader.pages[:max_pages]):
            text = page.extract_text() or ""
            if text.strip():
                pages_text.append(f"--- Page {idx + 1} ---\n{text.strip()}")
        if not pages_text:
            return "[Attached PDF Document: Contains scanned images or visual worksheet pages]"
        return "\n\n".join(pages_text)
    except Exception as e:
        return f"[Error parsing PDF document: {e}]"


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

        # Header Block
        header_title = f"{paper.title} (TEACHER ANSWER KEY)" if include_answers else paper.title

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

pdf_generator_service = PDFGeneratorService()
