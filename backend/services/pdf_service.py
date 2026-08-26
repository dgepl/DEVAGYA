import io
import os
import re
import html
import zipfile
import xml.etree.ElementTree as ET
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, Flowable, Image as RLImage
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from schemas.question import GeneratedPaperResponse

# Register Unicode & Math fonts for multi-script and mathematical rendering
UNICODE_FONT_NAME = "Helvetica"
UNICODE_BOLD_FONT_NAME = "Helvetica-Bold"
MATH_FONT_NAME = "Helvetica"

try:
    # 1. Register Academic Math & Latin Font (with full calculus glyphs: ∫, ∑, ∏, √, θ, Ω, ±)
    math_font_candidates = [
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/tahoma.ttf",
        "C:/Windows/Fonts/calibri.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSerif.ttf"
    ]
    for mfp in math_font_candidates:
        if os.path.exists(mfp):
            pdfmetrics.registerFont(TTFont("AcademicMathFont", mfp))
            MATH_FONT_NAME = "AcademicMathFont"
            UNICODE_FONT_NAME = "AcademicMathFont"
            UNICODE_BOLD_FONT_NAME = "AcademicMathFont"
            break

    # 2. Register Devanagari Font (Hindi / Sanskrit)
    devanagari_candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "fonts", "NotoSansDevanagari.ttf")),
        "C:/Windows/Fonts/Nirmala.ttf",
        "C:/Windows/Fonts/mangal.ttf",
        "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf"
    ]
    for dfp in devanagari_candidates:
        if os.path.exists(dfp):
            pdfmetrics.registerFont(TTFont("DevanagariFont", dfp))
            break
except Exception as e:
    pass


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

def strip_emojis_for_pdf(raw: str) -> str:
    if not raw:
        return ""
    emoji_pattern = re.compile(
        "["
        "\U00010000-\U0010FFFF"
        "\u2600-\u27BF"
        "\u2300-\u23FF"
        "\u2B50\u2B55\u231A\u231B\u2328\u23CF"
        "\uFE00-\uFE0F"
        "\u200D"
        "]+",
        flags=re.UNICODE
    )
    return emoji_pattern.sub("", str(raw))

def clean_md_to_reportlab(text: str) -> str:
    """
    Transforms raw academic text, LaTeX equations, chemical formulas, and Markdown
    into crisp, modern ReportLab XML typography.
    """
    if not text:
        return ""
    t = str(text)
    
    # 1. Strip emojis (prevent black squares)
    t = strip_emojis_for_pdf(t)

    # 2. Normalize smart punctuation and dashes
    t = t.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
    t = t.replace("\u201c", '"').replace("\u201d", '"')
    t = t.replace("\u2018", "'").replace("\u2019", "'")
    t = t.replace("\u00a0", " ")

    # 3. Escape raw XML special characters (&, <, >) FIRST before inserting ReportLab tags
    import html
    t = html.escape(t)

    # 4. Strip math delimiters across multiple lines: $...$, $$...$$, \[...\], \(...\)
    t = re.sub(r'\\r\\n|\\n', '\n', t)
    t = re.sub(r'\$\$([\s\S]*?)\$\$', r'\1', t)
    t = re.sub(r'\$([^\$]+)\$', r'\1', t)
    t = re.sub(r'\\\[([\s\S]*?)\\\]', r'\1', t)
    t = re.sub(r'\\\(([\s\S]*?)\\\)', r'\1', t)
    t = re.sub(r'\\\[|\\\]|\\\(|\\\)', '', t)

    # 5. Greek symbols & Mathematical Constants (replace early)
    greek_symbols = [
        (r'\\alpha', 'α'), (r'\\beta', 'β'), (r'\\gamma', 'γ'), (r'\\Gamma', 'Γ'),
        (r'\\delta', 'δ'), (r'\\Delta', 'Δ'), (r'\\epsilon', 'ε'), (r'\\varepsilon', 'ε'),
        (r'\\zeta', 'ζ'), (r'\\eta', 'η'), (r'\\theta', 'θ'), (r'\\Theta', 'Θ'),
        (r'\\lambda', 'λ'), (r'\\Lambda', 'Λ'), (r'\\mu', 'μ'), (r'\\nu', 'ν'),
        (r'\\xi', 'ξ'), (r'\\pi', 'π'), (r'\\Pi', 'Π'), (r'\\rho', 'ρ'),
        (r'\\sigma', 'σ'), (r'\\Sigma', 'Σ'), (r'\\tau', 'τ'), (r'\\phi', 'φ'),
        (r'\\Phi', 'Φ'), (r'\\chi', 'χ'), (r'\\psi', 'ψ'), (r'\\Psi', 'Ψ'),
        (r'\\omega', 'ω'), (r'\\Omega', 'Ω'),
        (r'\\degree', '°'), (r'\^\\circ', '°'), (r'\\circ', '°')
    ]
    for pattern_str, repl in greek_symbols:
        t = re.sub(pattern_str, repl, t)

    # 6. Mathematical & Logical Operators
    math_ops = [
        (r'\\times', '×'), (r'\\div', '÷'), (r'\\pm', '±'), (r'\\mp', '∓'),
        (r'\\cdot', '·'), (r'\\bullet', '•'), (r'\\approx', '≈'), (r'\\neq', '≠'),
        (r'\\leq', '≤'), (r'\\le', '≤'), (r'\\geq', '≥'), (r'\\ge', '≥'),
        (r'\\equiv', '≡'), (r'\\propto', '∝'), (r'\\sim', '~'),
        (r'\\rightarrow', '→'), (r'\\to', '→'), (r'\\leftarrow', '←'),
        (r'\\leftrightarrow', '↔'), (r'\\Rightarrow', '⇒'), (r'\\Leftarrow', '⇐'),
        (r'\\Leftrightarrow', '⇔'), (r'\\iff', '⇔'),
        (r'\\infty', '∞'), (r'\\partial', '∂'), (r'\\nabla', '∇'), (r'\\angle', '∠'),
        (r'\\parallel', '∥'), (r'\\perp', '⊥'), (r'\\triangle', '△'),
        (r'\\in', '∈'), (r'\\notin', '∉'), (r'\\subset', '⊂'), (r'\\subseteq', '⊆'),
        (r'\\cap', '∩'), (r'\\cup', '∪'), (r'\\forall', '∀'), (r'\\exists', '∃')
    ]
    for pattern_str, repl in math_ops:
        t = re.sub(pattern_str, repl, t)

    # 7. Calculus Integrals & Summations
    t = re.sub(r'\\iint', '∬', t)
    t = re.sub(r'\\iiint', '∭', t)
    t = re.sub(r'\\oint', '∮', t)
    t = re.sub(r'\\int', '∫', t)
    t = re.sub(r'\\sum', '∑', t)
    t = re.sub(r'\\prod', '∏', t)

    # 8. Square Roots (iterative for nested braces): \sqrt{x} -> √(x), \sqrt[n]{x} -> ⁿ√(x)
    for _ in range(4):
        t = re.sub(r'\\sqrt\[([^{}]+)\]\{([^{}]+)\}', r'<sup>\1</sup>√(\2)', t)
        t = re.sub(r'\\sqrt\{([^{}]+)\}', r'√(\1)', t)

    # 9. Fractions: Format simple numerical/symbolic fractions cleanly (e.g. \frac{7}{2} -> 7/2)
    def _format_fraction_match(m):
        num = m.group(1).strip()
        den = m.group(2).strip()
        # If simple integer, signed number, or single variable term: 7/2, -5/2, x/y
        if re.match(r'^[+-]?[0-9a-zA-Z]+$', num) and re.match(r'^[+-]?[0-9a-zA-Z]+$', den):
            return f"{num}/{den}"
        return f"({num}) / ({den})"

    for _ in range(4):
        t = re.sub(r'\\frac\{([^{}]+)\}\{([^{}]+)\}', _format_fraction_match, t)

    # 10. Unicode Superscript mapping for common mathematical exponents (e.g. x^2 -> x²)
    SUPERSCRIPT_MAP = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
        'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ'
    }

    def _replace_super(m):
        content = m.group(1)
        if all(c in SUPERSCRIPT_MAP for c in content):
            return ''.join(SUPERSCRIPT_MAP[c] for c in content)
        return f"<sup>{content}</sup>"

    t = re.sub(r'\^\{([^{}]+)\}', _replace_super, t)
    t = re.sub(r'\^([0-9a-zA-Z+\-]+)', _replace_super, t)

    # 11. Subscripts / Indices / Chemical formulas: H_2O -> H₂O
    SUBSCRIPT_MAP = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
        '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
        '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
        'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ', 'h': 'ₕ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'p': 'ₚ', 's': 'ₛ', 't': 'ₜ'
    }

    def _replace_sub(m):
        content = m.group(1)
        if all(c in SUBSCRIPT_MAP for c in content):
            return ''.join(SUBSCRIPT_MAP[c] for c in content)
        return f"<sub>{content}</sub>"

    for _ in range(3):
        t = re.sub(r'_\{([^{}]+)\}', _replace_sub, t)
    t = re.sub(r'_([0-9]+)', _replace_sub, t)
    t = re.sub(r'_([a-zA-Z])', _replace_sub, t)

    # 10. LaTeX Text Formatting
    t = re.sub(r'\\mathbf\{([^{}]+)\}', r'<b>\1</b>', t)
    t = re.sub(r'\\textbf\{([^{}]+)\}', r'<b>\1</b>', t)
    t = re.sub(r'\\mathit\{([^{}]+)\}', r'<i>\1</i>', t)
    t = re.sub(r'\\textit\{([^{}]+)\}', r'<i>\1</i>', t)
    t = re.sub(r'\\underline\{([^{}]+)\}', r'<u>\1</u>', t)
    t = re.sub(r'\\text\{([^{}]+)\}', r'\1', t)
    t = re.sub(r'\\mathrm\{([^{}]+)\}', r'\1', t)
    t = re.sub(r'\\operatorname\{([^{}]+)\}', r'\1', t)

    # 11. Greek symbols & Mathematical Constants
    greek_symbols = [
        (r'\\alpha', 'α'), (r'\\beta', 'β'), (r'\\gamma', 'γ'), (r'\\Gamma', 'Γ'),
        (r'\\delta', 'δ'), (r'\\Delta', 'Δ'), (r'\\epsilon', 'ε'), (r'\\varepsilon', 'ε'),
        (r'\\zeta', 'ζ'), (r'\\eta', 'η'), (r'\\theta', 'θ'), (r'\\Theta', 'Θ'),
        (r'\\lambda', 'λ'), (r'\\Lambda', 'Λ'), (r'\\mu', 'μ'), (r'\\nu', 'ν'),
        (r'\\xi', 'ξ'), (r'\\pi', 'π'), (r'\\Pi', 'Π'), (r'\\rho', 'ρ'),
        (r'\\sigma', 'σ'), (r'\\Sigma', 'Σ'), (r'\\tau', 'τ'), (r'\\phi', 'φ'),
        (r'\\Phi', 'Φ'), (r'\\chi', 'χ'), (r'\\psi', 'ψ'), (r'\\Psi', 'Ψ'),
        (r'\\omega', 'ω'), (r'\\Omega', 'Ω'),
        (r'\\degree', '°'), (r'\^\\circ', '°'), (r'\\circ', '°')
    ]
    for pattern_str, repl in greek_symbols:
        t = re.sub(pattern_str, repl, t)

    # 12. Mathematical & Logical Operators
    math_ops = [
        (r'\\times', '×'), (r'\\div', '÷'), (r'\\pm', '±'), (r'\\mp', '∓'),
        (r'\\cdot', '·'), (r'\\bullet', '•'), (r'\\approx', '≈'), (r'\\neq', '≠'),
        (r'\\leq', '≤'), (r'\\le', '≤'), (r'\\geq', '≥'), (r'\\ge', '≥'),
        (r'\\equiv', '≡'), (r'\\propto', '∝'), (r'\\sim', '~'),
        (r'\\rightarrow', '→'), (r'\\to', '→'), (r'\\leftarrow', '←'),
        (r'\\leftrightarrow', '↔'), (r'\\Rightarrow', '⇒'), (r'\\Leftarrow', '⇐'),
        (r'\\Leftrightarrow', '⇔'), (r'\\iff', '⇔'),
        (r'\\infty', '∞'), (r'\\partial', '∂'), (r'\\nabla', '∇'), (r'\\angle', '∠'),
        (r'\\parallel', '∥'), (r'\\perp', '⊥'), (r'\\triangle', '△'),
        (r'\\in', '∈'), (r'\\notin', '∉'), (r'\\subset', '⊂'), (r'\\subseteq', '⊆'),
        (r'\\cap', '∩'), (r'\\cup', '∪'), (r'\\forall', '∀'), (r'\\exists', '∃')
    ]
    for pattern_str, repl in math_ops:
        t = re.sub(pattern_str, repl, t)

    # 13. Strip leftover LaTeX layout artifacts
    t = re.sub(r'\\displaystyle', '', t)
    t = re.sub(r'\\limits', '', t)
    t = re.sub(r'\\left\(', '(', t)
    t = re.sub(r'\\right\)', ')', t)
    t = re.sub(r'\\left\[', '[', t)
    t = re.sub(r'\\right\]', ']', t)
    t = re.sub(r'\\left\{', '{', t)
    t = re.sub(r'\\right\}', '}', t)
    t = re.sub(r'\\left\|', '|', t)
    t = re.sub(r'\\right\|', '|', t)
    t = re.sub(r'\\left', '', t)
    t = re.sub(r'\\right', '', t)
    t = re.sub(r'\\[,\;!]', ' ', t)
    t = re.sub(r'\\quad', '\u00A0\u00A0', t)
    t = re.sub(r'\\qquad', '\u00A0\u00A0\u00A0\u00A0', t)
    t = re.sub(r'\\\s+', ' ', t)
    t = t.replace('&nbsp;', '\u00A0')

    # 14. Convert Markdown bold **text** to <b>text</b>
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)

    # 15. Convert Markdown italic *text* or _text_ to <i>text</i>
    t = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'<i>\1</i>', t)

    # 16. Convert inline code `text` to Courier font
    t = re.sub(r'`([^`]+?)`', r'<font face="Courier">\1</font>', t)

    # 17. Convert newlines to HTML breaks
    t = re.sub(r'\n+', '<br/>', t.strip())

    # 18. Balance unclosed tags
    for tag in ["b", "i", "u", "sup", "sub"]:
        open_t = t.count(f"<{tag}>")
        close_t = t.count(f"</{tag}>")
        if open_t > close_t:
            t += f"</{tag}>" * (open_t - close_t)

    return t.strip()

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
def build_safe_paragraph(text: str, style, is_bold_prefix: Optional[str] = None) -> Paragraph:
    """Safely cleans academic Markdown, KaTeX math, and XML tags before wrapping in ReportLab Paragraph."""
    raw_str = str(text or "")
    if is_bold_prefix:
        raw_str = f"**{is_bold_prefix}** {raw_str}"
    cleaned = clean_md_to_reportlab(raw_str)
    return Paragraph(cleaned, style)


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
        
        # Custom styles with Unicode Multi-Script Font Support
        title_style = ParagraphStyle(
            'SchoolTitle',
            parent=styles['Heading1'],
            fontName=UNICODE_BOLD_FONT_NAME,
            fontSize=18,
            leading=22,
            alignment=1, # Center
            textColor=colors.HexColor("#1E1B4B") # Indigo 950
        )

        subtitle_style = ParagraphStyle(
            'SubTitle',
            parent=styles['Normal'],
            fontName=UNICODE_BOLD_FONT_NAME,
            fontSize=12,
            leading=16,
            alignment=1,
            textColor=colors.HexColor("#3730A3") # Indigo 800
        )

        meta_style = ParagraphStyle(
            'MetaText',
            parent=styles['Normal'],
            fontName=UNICODE_FONT_NAME,
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#1E293B")
        )

        instruction_style = ParagraphStyle(
            'Instruction',
            parent=styles['Normal'],
            fontName=UNICODE_FONT_NAME,
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#475569")
        )

        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontName=UNICODE_BOLD_FONT_NAME,
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
            fontName=UNICODE_BOLD_FONT_NAME,
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#0F172A")
        )

        option_style = ParagraphStyle(
            'OptionText',
            parent=styles['Normal'],
            fontName=UNICODE_FONT_NAME,
            fontSize=9.5,
            leading=13,
            leftIndent=15,
            textColor=colors.HexColor("#334155")
        )

        answer_style = ParagraphStyle(
            'AnswerText',
            parent=styles['Normal'],
            fontName=UNICODE_FONT_NAME,
            fontSize=9.5,
            leading=13,
            leftIndent=15,
            textColor=colors.HexColor("#047857") # Emerald 700
        )

        worksheet_line_style = ParagraphStyle(
            'WorksheetLine',
            parent=styles['Normal'],
            fontName=UNICODE_FONT_NAME,
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

            raw_q = strip_emojis_for_pdf(q.question_text or "")
            q_text_formatted = clean_md_to_reportlab(raw_q)
            q_elements.append(Paragraph(f"<b>Q{q.question_number}.</b> {q_text_formatted} <font color='#6366F1'><b>[{q.marks} Mark{'s' if q.marks > 1 else ''}]</b></font>", q_text_style))

            if q.options:
                q_elements.append(Spacer(1, 2))
                for opt in q.options:
                    formatted_opt = clean_md_to_reportlab(strip_emojis_for_pdf(opt))
                    q_elements.append(Paragraph(formatted_opt, option_style))
                    q_elements.append(Spacer(1, 1.5))

            if include_answers:
                q_elements.append(Spacer(1, 2))
                ans_text = clean_md_to_reportlab(strip_emojis_for_pdf(str(q.answer or "")))
                q_elements.append(Paragraph(f"<b>Correct Answer:</b> {ans_text}", answer_style))
                if q.explanation:
                    exp_text = clean_md_to_reportlab(strip_emojis_for_pdf(str(q.explanation or "")))
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
        Generate a publication-grade A4 PDF Document from AI text/markdown for ANY academic content
        (Notes, Lesson Plans, Worksheets, Study Guides, Overviews, Question Sets, Curriculum).
        """
        def build_safe_paragraph(raw_text: str, style, is_bold_prefix: str = "") -> Paragraph:
            clean_raw = strip_emojis_for_pdf(raw_text)
            formatted = clean_md_to_reportlab(clean_raw)
            if is_bold_prefix:
                formatted = f"<b>{html.escape(is_bold_prefix)}</b> {formatted}"
            try:
                return Paragraph(formatted, style)
            except Exception:
                # Guaranteed fallback without any formatting tags
                plain = html.escape(clean_raw).replace("\u2011", "-").replace("\u201c", '"').replace("\u201d", '"')
                return Paragraph(plain, style)

        title = str(payload.get("title") or "Academic Document")
        subject = str(payload.get("subject") or "General Studies")
        class_name = str(payload.get("class_name") or "Class 10")
        chapter = str(payload.get("chapter") or "Curriculum")
        school_name = str(payload.get("school_name") or "DEVGYA GLOBAL ACADEMY")
        school_logo = payload.get("school_logo")
        theme_name = str(payload.get("theme") or "cbse").lower()
        font_size_mode = str(payload.get("font_size") or "standard").lower()
        include_header_bar = bool(payload.get("include_student_header", True))
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
            h1_font = 13
            h2_font = 11
        elif font_size_mode == "large":
            margins = 36
            base_font = 11
            base_leading = 16
            h1_font = 16
            h2_font = 13.5
        else:
            margins = 32
            base_font = 10
            base_leading = 14
            h1_font = 14
            h2_font = 12

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
            'WDocTitle',
            parent=styles['Normal'],
            fontName=UNICODE_BOLD_FONT_NAME,
            fontSize=h1_font,
            leading=h1_font + 4,
            alignment=1, # Centered
            textColor=th["primary"]
        )

        subtitle_style = ParagraphStyle(
            'WDocSubtitle',
            parent=styles['Normal'],
            fontName=UNICODE_BOLD_FONT_NAME,
            fontSize=base_font + 1,
            leading=base_leading + 2,
            alignment=1,
            textColor=th["secondary"]
        )

        meta_style = ParagraphStyle(
            'WDocMeta',
            parent=styles['Normal'],
            fontName=UNICODE_FONT_NAME,
            fontSize=base_font - 1,
            leading=base_leading - 2,
            textColor=colors.HexColor("#334155")
        )

        h1_style = ParagraphStyle(
            'WDocH1',
            parent=styles['Normal'],
            fontName=UNICODE_BOLD_FONT_NAME,
            fontSize=h2_font + 1,
            leading=base_leading + 4,
            textColor=th["primary"],
            spaceBefore=8,
            spaceAfter=4
        )

        h2_style = ParagraphStyle(
            'WDocH2',
            parent=styles['Normal'],
            fontName=UNICODE_BOLD_FONT_NAME,
            fontSize=h2_font,
            leading=base_leading + 2,
            textColor=th["highlight"],
            spaceBefore=6,
            spaceAfter=3
        )

        body_style = ParagraphStyle(
            'WDocBody',
            parent=styles['Normal'],
            fontName=UNICODE_FONT_NAME,
            fontSize=base_font,
            leading=base_leading,
            textColor=colors.HexColor("#1E293B"),
            spaceBefore=2,
            spaceAfter=3
        )

        bullet_style = ParagraphStyle(
            'WDocBullet',
            parent=styles['Normal'],
            fontName=UNICODE_FONT_NAME,
            fontSize=base_font,
            leading=base_leading,
            leftIndent=14,
            textColor=colors.HexColor("#1E293B"),
            spaceBefore=1,
            spaceAfter=2
        )

        callout_style = ParagraphStyle(
            'WDocCallout',
            parent=styles['Normal'],
            fontName=UNICODE_FONT_NAME,
            fontSize=base_font,
            leading=base_leading,
            leftIndent=14,
            textColor=th["primary"],
            spaceBefore=3,
            spaceAfter=3
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

        # Top Header
        if logo_element:
            header_table_data = [
                [
                    logo_element,
                    [
                        build_safe_paragraph(school_name.upper(), title_style),
                        Spacer(1, 2),
                        build_safe_paragraph(f"{title} — {subject.upper()} ({class_name.upper()})", subtitle_style)
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
            story.append(build_safe_paragraph(school_name.upper(), title_style))
            story.append(Spacer(1, 3))
            story.append(build_safe_paragraph(f"{title} — {subject.upper()} ({class_name.upper()})", subtitle_style))
        story.append(Spacer(1, 6))

        # Academic Metadata Bar
        if include_header_bar:
            meta_box_data = [
                [
                    build_safe_paragraph(subject, meta_style, is_bold_prefix="Subject:"),
                    build_safe_paragraph(class_name, meta_style, is_bold_prefix="Class:"),
                    build_safe_paragraph(chapter, meta_style, is_bold_prefix="Topic:"),
                    build_safe_paragraph("2025-26", meta_style, is_bold_prefix="Session:")
                ]
            ]
            meta_table = Table(meta_box_data, colWidths=[140, 110, 160, 120])
            meta_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), th["bg_meta"]),
                ('BOX', (0,0), (-1,-1), 1, th["border"]),
                ('INNERGRID', (0,0), (-1,-1), 0.5, th["border"]),
                ('PADDING', (0,0), (-1,-1), 4),
            ]))
            story.append(meta_table)
            story.append(Spacer(1, 4))

        # Divider Rule
        story.append(HRFlowable(width="100%", thickness=1.5, color=th["primary"], spaceBefore=2, spaceAfter=6))

        # Parse AI Generated Markdown Content Lines
        raw_lines = content.split("\n")
        in_table_block = False
        table_rows = []

        for raw_line in raw_lines:
            line = raw_line.strip()
            if not line:
                if in_table_block and table_rows:
                    # Flush table
                    try:
                        t_flow = Table(table_rows)
                        t_flow.setStyle(TableStyle([
                            ('BACKGROUND', (0,0), (-1,0), th["bg_meta"]),
                            ('BOX', (0,0), (-1,-1), 1, th["border"]),
                            ('INNERGRID', (0,0), (-1,-1), 0.5, th["border"]),
                            ('PADDING', (0,0), (-1,-1), 4),
                        ]))
                        story.append(t_flow)
                        story.append(Spacer(1, 4))
                    except Exception:
                        pass
                    in_table_block = False
                    table_rows = []
                story.append(Spacer(1, 3))
                continue

            # Markdown Table Row Detection
            if line.startswith("|") and line.endswith("|"):
                cells = [c.strip() for c in line.strip("|").split("|")]
                if all(set(c).issubset({"-", ":", " "}) for c in cells):
                    # Separator line like |---|---|
                    continue
                in_table_block = True
                p_cells = [build_safe_paragraph(c, body_style) for c in cells]
                table_rows.append(p_cells)
                continue
            elif in_table_block and table_rows:
                try:
                    t_flow = Table(table_rows)
                    t_flow.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,0), th["bg_meta"]),
                        ('BOX', (0,0), (-1,-1), 1, th["border"]),
                        ('INNERGRID', (0,0), (-1,-1), 0.5, th["border"]),
                        ('PADDING', (0,0), (-1,-1), 4),
                    ]))
                    story.append(t_flow)
                    story.append(Spacer(1, 4))
                except Exception:
                    pass
                in_table_block = False
                table_rows = []

            # Headings (#, ##, ###, or SECTION / Chapter)
            if line.startswith(("# ", "## ", "### ", "#### ")):
                level = line.count("#")
                h_text = line.lstrip("#* \t")
                chosen_style = h1_style if level <= 2 else h2_style
                story.append(build_safe_paragraph(h_text, chosen_style))
                story.append(HRFlowable(width="100%", thickness=0.75, color=th["border"], spaceBefore=1, spaceAfter=4))

            elif line.startswith(("SECTION", "Section", "PART", "Part", "CHAPTER", "Chapter", "UNIT", "Unit", "**SECTION", "**Section")):
                h_text = line.strip("* \t")
                story.append(build_safe_paragraph(h_text, h1_style))
                story.append(HRFlowable(width="100%", thickness=0.75, color=th["border"], spaceBefore=1, spaceAfter=4))

            # Blockquote (> text)
            elif line.startswith(">"):
                quote_text = line.lstrip("> \t")
                story.append(build_safe_paragraph(quote_text, callout_style, is_bold_prefix="💡"))

            # Bullet points (- , * , • )
            elif line.startswith(("- ", "* ", "• ", "+ ")):
                bullet_text = line[2:].strip()
                story.append(build_safe_paragraph(f"• {bullet_text}", bullet_style))

            # Numbered items (1. , 2. , Q1. , Question 1:)
            elif re.match(r'^(Q\d+[\.\:]|\d+[\.\)]|Question\s+\d+[\.\:])\s*', line):
                story.append(build_safe_paragraph(line, body_style))

            # Regular Paragraph Line
            else:
                story.append(build_safe_paragraph(line, body_style))

        # Flush any trailing table
        if in_table_block and table_rows:
            try:
                t_flow = Table(table_rows)
                t_flow.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), th["bg_meta"]),
                    ('BOX', (0,0), (-1,-1), 1, th["border"]),
                    ('INNERGRID', (0,0), (-1,-1), 0.5, th["border"]),
                    ('PADDING', (0,0), (-1,-1), 4),
                ]))
                story.append(t_flow)
            except Exception:
                pass

class RuledLinesFlowable(Flowable):
    """Draws crisp, high-precision ruled writing lines for student handwritten answers."""
    def __init__(self, num_lines=4, line_spacing=18, style="solid", stroke_color=colors.HexColor("#CBD5E1")):
        super().__init__()
        self.num_lines = max(1, num_lines)
        self.line_spacing = line_spacing
        self.style = style
        self.stroke_color = stroke_color
        self.width = 0
        self.height = self.num_lines * line_spacing + 4

    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        return self.width, self.height

    def draw(self):
        self.canv.saveState()
        self.canv.setStrokeColor(self.stroke_color)
        self.canv.setLineWidth(0.55)
        if self.style == "dotted":
            self.canv.setDash([2, 3])
        for i in range(self.num_lines):
            y = self.height - ((i + 1) * self.line_spacing)
            self.canv.line(0, y, self.width, y)
        self.canv.restoreState()

class ResponseBoxFlowable(Flowable):
    """Draws a styled response box for student written solutions, calculations, or diagrams."""
    def __init__(self, height_pt=75, stroke_color=colors.HexColor("#94A3B8"), bg_color=colors.HexColor("#F8FAFC")):
        super().__init__()
        self.height_pt = max(30, height_pt)
        self.stroke_color = stroke_color
        self.bg_color = bg_color
        self.width = 0

    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        return self.width, self.height_pt

    def draw(self):
        self.canv.saveState()
        self.canv.setFillColor(self.bg_color)
        self.canv.setStrokeColor(self.stroke_color)
        self.canv.setLineWidth(0.7)
        self.canv.roundRect(0, 0, self.width, self.height_pt, radius=3, stroke=1, fill=1)
        self.canv.setFont("Helvetica-Oblique", 7.5)
        self.canv.setFillColor(colors.HexColor("#94A3B8"))
        self.canv.drawString(6, self.height_pt - 10, "Student Response / Working Space:")
        self.canv.restoreState()

# Append to PDFGeneratorService
def _generate_assignment_worksheet_pdf(self, assignment: Dict[str, Any], config: Dict[str, Any], is_teacher_key: bool = False) -> bytes:
    """
    Renders fully tailored Assignment / Worksheet PDF with custom student response spaces
    (ruled lines, response boxes, or clean question sheet) configured dynamically by the teacher.
    """
    answer_space_mode = config.get("answer_space_mode", "ruled_lines") # ruled_lines, response_box, none
    line_style = config.get("line_style", "solid") # solid, dotted
    default_short_lines = int(config.get("default_short_lines", 4))
    default_long_lines = int(config.get("default_long_lines", 8))
    box_height_mm = int(config.get("box_height_mm", 35))
    box_height_pt = int(box_height_mm * 2.83465) # mm to pt
    include_student_header = config.get("include_student_header", True)
    font_size_mode = config.get("font_size_mode", "standard")
    theme_name = config.get("theme_name", "cbse")
    school_name = assignment.get("school_name", "DEVGYA GLOBAL ACADEMY")
    school_logo = config.get("school_logo")

    THEME_COLORS = {
        "cbse": {
            "primary": colors.HexColor("#1E3A8A"),      # Navy 900
            "secondary": colors.HexColor("#2563EB"),    # Blue 600
            "border": colors.HexColor("#BFDBFE"),       # Blue 200
            "line_color": colors.HexColor("#93C5FD"),   # Blue 300
            "bg_meta": colors.HexColor("#EFF6FF"),      # Light Sky
            "box_bg": colors.HexColor("#F8FAFC")
        },
        "modern": {
            "primary": colors.HexColor("#4338CA"),      # Indigo 700
            "secondary": colors.HexColor("#6366F1"),    # Indigo 500
            "border": colors.HexColor("#C7D2FE"),       # Indigo 200
            "line_color": colors.HexColor("#A5B4FC"),
            "bg_meta": colors.HexColor("#EEF2FF"),
            "box_bg": colors.HexColor("#FAFAFA")
        },
        "minimalist": {
            "primary": colors.HexColor("#0F172A"),      # Slate 900
            "secondary": colors.HexColor("#475569"),    # Slate 600
            "border": colors.HexColor("#CBD5E1"),       # Slate 300
            "line_color": colors.HexColor("#94A3B8"),
            "bg_meta": colors.HexColor("#F8FAFC"),
            "box_bg": colors.HexColor("#FFFFFF")
        },
        "emerald": {
            "primary": colors.HexColor("#065F46"),      # Emerald 800
            "secondary": colors.HexColor("#059669"),    # Emerald 600
            "border": colors.HexColor("#A7F3D0"),       # Emerald 200
            "line_color": colors.HexColor("#6EE7B7"),
            "bg_meta": colors.HexColor("#ECFDF5"),
            "box_bg": colors.HexColor("#F0FDF4")
        }
    }
    th = THEME_COLORS.get(theme_name, THEME_COLORS["cbse"])

    # Font sizing
    if font_size_mode == "compact":
        margins = 26
        base_font = 9
        base_leading = 12
        h1_font = 13
        h2_font = 10.5
        line_spacing = 15
    elif font_size_mode == "large":
        margins = 34
        base_font = 11
        base_leading = 16
        h1_font = 16
        h2_font = 13
        line_spacing = 21
    else:
        margins = 30
        base_font = 10
        base_leading = 14
        h1_font = 14
        h2_font = 11.5
        line_spacing = 18

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
        'AsgSchoolTitle',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=h1_font + 2,
        leading=h1_font + 6,
        alignment=1, # Centered
        textColor=th["primary"]
    )

    subtitle_style = ParagraphStyle(
        'AsgSubtitle',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=base_font + 1,
        leading=base_leading + 3,
        alignment=1,
        textColor=th["secondary"]
    )

    meta_style = ParagraphStyle(
        'AsgMeta',
        parent=styles['Normal'],
        fontName=UNICODE_FONT_NAME,
        fontSize=base_font - 1,
        leading=base_leading - 1,
        textColor=colors.HexColor("#1E293B")
    )

    student_header_style = ParagraphStyle(
        'AsgStudentHeader',
        parent=styles['Normal'],
        fontName=UNICODE_FONT_NAME,
        fontSize=base_font - 0.5,
        leading=base_leading + 2,
        textColor=colors.HexColor("#0F172A")
    )

    sec_heading_style = ParagraphStyle(
        'AsgSectionHeading',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=h2_font,
        leading=h2_font + 4,
        textColor=th["primary"],
        spaceBefore=6,
        spaceAfter=3
    )

    q_stem_style = ParagraphStyle(
        'AsgQuestionStem',
        parent=styles['Normal'],
        fontName=UNICODE_FONT_NAME,
        fontSize=base_font,
        leading=base_leading,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=4,
        spaceAfter=3
    )

    opt_style = ParagraphStyle(
        'AsgOption',
        parent=styles['Normal'],
        fontName=UNICODE_FONT_NAME,
        fontSize=base_font - 0.5,
        leading=base_leading - 1,
        leftIndent=14,
        textColor=colors.HexColor("#334155"),
        spaceBefore=1,
        spaceAfter=1
    )

    ans_style = ParagraphStyle(
        'AsgAnswer',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=base_font - 0.5,
        leading=base_leading,
        textColor=colors.HexColor("#047857"),
        spaceBefore=2,
        spaceAfter=2
    )

    expl_style = ParagraphStyle(
        'AsgExplanation',
        parent=styles['Normal'],
        fontName=UNICODE_FONT_NAME,
        fontSize=base_font - 1,
        leading=base_leading - 1,
        leftIndent=8,
        textColor=colors.HexColor("#475569"),
        spaceBefore=1,
        spaceAfter=4
    )

    story = []

    # 1. Top School Branding Header
    page_width = A4[0] - (2 * margins)
    doc_title = assignment.get("title") or f"{assignment.get('subject')} Assignment"
    if is_teacher_key:
        doc_title = f"{doc_title} (TEACHER ANSWER KEY & RUBRIC)"

    story.append(build_safe_paragraph(school_name.upper(), title_style))
    story.append(Spacer(1, 2))
    story.append(build_safe_paragraph(doc_title.upper(), subtitle_style))
    story.append(Spacer(1, 5))

    # 2. Academic Metadata Bar
    meta_data = [
        [
            build_safe_paragraph(assignment.get("class_name", "Class 10"), meta_style, is_bold_prefix="Class:"),
            build_safe_paragraph(assignment.get("subject", "Mathematics"), meta_style, is_bold_prefix="Subject:"),
            build_safe_paragraph(assignment.get("chapter_topic", "General"), meta_style, is_bold_prefix="Topic:"),
            build_safe_paragraph(f"{assignment.get('total_marks', 25)} Marks", meta_style, is_bold_prefix="Max Marks:")
        ]
    ]
    meta_col_w = page_width / 4.0
    meta_table = Table(meta_data, colWidths=[meta_col_w] * 4)
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), th["bg_meta"]),
        ('BOX', (0,0), (-1,-1), 1, th["border"]),
        ('INNERGRID', (0,0), (-1,-1), 0.5, th["border"]),
        ('PADDING', (0,0), (-1,-1), 4),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 4))

    # 3. Student Details Blank Header (if not teacher key and enabled)
    if include_student_header and not is_teacher_key:
        due_str = assignment.get("due_date") or time.strftime("%d-%m-%Y")
        student_bar_data = [
            [
                build_safe_paragraph("**Student Name:** ____________________________________", student_header_style),
                build_safe_paragraph("**Roll No:** ____________", student_header_style)
            ],
            [
                build_safe_paragraph(f"**Section / Group:** ___________      **Due Date:** {due_str}", student_header_style),
                build_safe_paragraph(f"**Marks Obtained:** _______ / {assignment.get('total_marks', 25)}", student_header_style)
            ]
        ]
        student_table = Table(student_bar_data, colWidths=[page_width * 0.65, page_width * 0.35])
        student_table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor("#94A3B8")),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('PADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(student_table)
        story.append(Spacer(1, 6))

    # 4. Instructions Divider
    instructions = assignment.get("instructions") or ["Write your answers clearly in the designated spaces."]
    inst_text = " • ".join(instructions)
    inst_style = ParagraphStyle('AsgInst', parent=styles['Normal'], fontName=UNICODE_FONT_NAME, fontSize=8.5, leading=11, textColor=colors.HexColor("#64748B"))
    story.append(build_safe_paragraph(f"**General Instructions:** {inst_text}", inst_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=th["primary"], spaceBefore=3, spaceAfter=8))

    # 5. Group Questions by Section
    questions = assignment.get("questions") or []
    current_section = None

    for q in questions:
        q_sec = q.get("section") or "Section A: Questions"
        if q_sec != current_section:
            current_section = q_sec
            story.append(Spacer(1, 4))
            # Section Header Bar
            sec_table = Table([[build_safe_paragraph(f"**{current_section.upper()}**", sec_heading_style)]], colWidths=[page_width])
            sec_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), th["bg_meta"]),
                ('BOTTOMPADDING', (0,0), (-1,-1), 3),
                ('TOPPADDING', (0,0), (-1,-1), 3),
                ('LEFTPADDING', (0,0), (-1,-1), 6),
                ('LINEBELOW', (0,0), (-1,-1), 1.2, th["primary"])
            ]))
            story.append(sec_table)
            story.append(Spacer(1, 4))

        # Question Stem
        q_num = q.get("question_number", 1)
        q_marks = q.get("marks", 1)
        q_text = str(q.get("question_text", "")).strip()
        marks_badge = f"**[{q_marks} {'Mark' if q_marks == 1 else 'Marks'}]**"
        full_q_str = f"**Q{q_num}.** {q_text}   {marks_badge}"
        story.append(build_safe_paragraph(full_q_str, q_stem_style))

        q_type = str(q.get("question_type", "short")).lower()

        # MCQ Options
        opts = q.get("options")
        if q_type == "mcq" and opts and isinstance(opts, list):
            for opt in opts:
                story.append(build_safe_paragraph(str(opt).strip(), opt_style))
            story.append(Spacer(1, 3))

        # Teacher Answer Key Mode: Print Answer and Explanation
        if is_teacher_key:
            ans = q.get("answer")
            if ans:
                story.append(build_safe_paragraph(f"**Correct Answer / Model Solution:** {ans}", ans_style))
            expl = q.get("explanation")
            if expl:
                story.append(build_safe_paragraph(f"**Marking Scheme & Explanation:** {expl}", expl_style))
            story.append(Spacer(1, 4))

        # Student Worksheet Mode: Render Answer Space
        # Student Worksheet Mode: Render Answer Space
        else:
            if answer_space_mode == "ruled_lines":
                # Determine number of lines
                lines_to_draw = q.get("lines_allocated")
                if not lines_to_draw:
                    if q_type == "mcq":
                        lines_to_draw = 0
                    elif q_type in ["long", "case_study"]:
                        lines_to_draw = default_long_lines
                    else:
                        lines_to_draw = default_short_lines

                if lines_to_draw > 0 and q_type != "mcq":
                    story.append(Spacer(1, 2))
                    story.append(RuledLinesFlowable(num_lines=lines_to_draw, line_spacing=line_spacing, style=line_style, stroke_color=th["line_color"]))
                    story.append(Spacer(1, 6))
                else:
                    story.append(Spacer(1, 3))

            elif answer_space_mode == "response_box":
                if q_type != "mcq":
                    # Determine box height based on question type
                    if q_type in ["long", "case_study"]:
                        box_h = int(box_height_pt * 1.5)
                    else:
                        box_h = box_height_pt
                    story.append(Spacer(1, 3))
                    story.append(ResponseBoxFlowable(height_pt=box_h, stroke_color=th["border"], bg_color=th["box_bg"]))
                    story.append(Spacer(1, 6))
                else:
                    story.append(Spacer(1, 3))

            else:
                # None / Question Sheet only
                story.append(Spacer(1, 3))

    doc.build(story, canvasmaker=NumberedCanvas)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

PDFGeneratorService.generate_assignment_worksheet_pdf = _generate_assignment_worksheet_pdf
pdf_generator_service = PDFGeneratorService()
