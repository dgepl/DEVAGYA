import io
import os
import re
import html
import json
import zipfile
import base64
import shutil
import tempfile
import subprocess
import logging
from typing import Optional, List, Dict, Any
import xml.etree.ElementTree as ET
import httpx
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, Flowable, Image as RLImage
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from schemas.question import GeneratedPaperResponse

logger = logging.getLogger("pdf_service")

# Register Unicode & Math fonts for multi-script and mathematical rendering
UNICODE_FONT_NAME = "Helvetica"
UNICODE_BOLD_FONT_NAME = "Helvetica-Bold"
from reportlab.pdfbase.pdfmetrics import registerFontFamily

MATH_FONT_NAME = "Helvetica"
UNICODE_FONT_NAME = "Helvetica"
UNICODE_BOLD_FONT_NAME = "Helvetica-Bold"

try:
    # 1. Register Academic Math & Latin Font with full Bold/Italic Family Support
    if os.path.exists("C:/Windows/Fonts/arial.ttf"):
        pdfmetrics.registerFont(TTFont("AcademicMathFont", "C:/Windows/Fonts/arial.ttf"))
        bold_path = "C:/Windows/Fonts/arialbd.ttf" if os.path.exists("C:/Windows/Fonts/arialbd.ttf") else "C:/Windows/Fonts/arial.ttf"
        italic_path = "C:/Windows/Fonts/ariali.ttf" if os.path.exists("C:/Windows/Fonts/ariali.ttf") else "C:/Windows/Fonts/arial.ttf"
        bolditalic_path = "C:/Windows/Fonts/arialbi.ttf" if os.path.exists("C:/Windows/Fonts/arialbi.ttf") else "C:/Windows/Fonts/arial.ttf"
        pdfmetrics.registerFont(TTFont("AcademicMathFont-Bold", bold_path))
        pdfmetrics.registerFont(TTFont("AcademicMathFont-Italic", italic_path))
        pdfmetrics.registerFont(TTFont("AcademicMathFont-BoldItalic", bolditalic_path))
        registerFontFamily("AcademicMathFont", normal="AcademicMathFont", bold="AcademicMathFont-Bold", italic="AcademicMathFont-Italic", boldItalic="AcademicMathFont-BoldItalic")
        MATH_FONT_NAME = "AcademicMathFont"
        UNICODE_FONT_NAME = "AcademicMathFont"
        UNICODE_BOLD_FONT_NAME = "AcademicMathFont-Bold"
    elif os.path.exists("C:/Windows/Fonts/segoeui.ttf"):
        pdfmetrics.registerFont(TTFont("AcademicMathFont", "C:/Windows/Fonts/segoeui.ttf"))
        pdfmetrics.registerFont(TTFont("AcademicMathFont-Bold", "C:/Windows/Fonts/segoeuib.ttf" if os.path.exists("C:/Windows/Fonts/segoeuib.ttf") else "C:/Windows/Fonts/segoeui.ttf"))
        registerFontFamily("AcademicMathFont", normal="AcademicMathFont", bold="AcademicMathFont-Bold")
        MATH_FONT_NAME = "AcademicMathFont"
        UNICODE_FONT_NAME = "AcademicMathFont"
        UNICODE_BOLD_FONT_NAME = "AcademicMathFont-Bold"

    # 2. Register Devanagari Font (Hindi / Sanskrit)
    devanagari_candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "fonts", "NotoSansDevanagari.ttf")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "assets", "fonts", "NotoSansDevanagari.ttf")),
        "C:/Windows/Fonts/Nirmala.ttf",
        "C:/Windows/Fonts/mangal.ttf",
        "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf"
    ]
    for dfp in devanagari_candidates:
        if os.path.exists(dfp):
            try:
                pdfmetrics.registerFont(TTFont("DevanagariFont", dfp))
                break
            except Exception:
                pass
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

import tempfile
import subprocess
from PIL import Image as PILImage

def strip_emojis_for_pdf(raw: str) -> str:
    if not raw:
        return ""
    t = str(raw)
    
    # 1. Normalize bullet/box/checkbox glyphs that turn into tofu boxes
    t = re.sub(r'[\u25A0-\u25FF\u274F-\u2752\u2B1A-\u2B1F\u25CB\u25CF\u25E6\u2022\u2023\u2043\u25AA\u25AB\u25FB-\u25FE]', '&bull;', t)
    t = re.sub(r'[\u2713\u2714\u2705\u2611]', '✔', t)
    t = re.sub(r'[\u2794\u27A4\u279C\u279E\u2192\u2799\u279B\u279F]', '→', t)
    t = re.sub(r'[\u2728\u2B50\u2605\u2730\u2736\u2740]', '★', t)
    t = re.sub(r'[\U0001F539\U0001F538\U0001F537\U0001F536\U0001F4CD\U0001F4CC\U0001F449\U0001F44D]', '&bull;', t)

    # 2. Strip remaining unsupported high-plane emojis
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
    return emoji_pattern.sub("", t)

def _render_mermaid_fallback_table(mermaid_code: str, available_width: float = 480):
    lines = [l.strip() for l in str(mermaid_code).strip().split("\n") if l.strip()]
    if not lines:
        return None
    
    connections = []
    node_labels = {}
    
    for line in lines:
        if line.startswith(("```", "graph", "flowchart", "subgraph", "end", "%%", "classDef", "style")):
            continue
        
        parts = re.split(r'\s*-->\s*|\s*->\s*|\s*--\s*|\s*==>\s*', line)
        if len(parts) >= 2:
            step_nodes = []
            for p in parts:
                p = p.strip()
                # Strip leading |edge_label| if present
                p = re.sub(r'^\|[^|\n]+\|\s*', '', p)
                m = re.match(r'^([a-zA-Z0-9_-]+)\s*[\[\(\{](?:\"|\')?([^\]\)\}]+?)(?:\"|\')?[\]\)\}]$', p)
                if m:
                    n_id, label = m.group(1), m.group(2).strip(' "\'')
                    node_labels[n_id] = label
                    step_nodes.append(label)
                else:
                    clean_p = node_labels.get(p, p).strip(' "\'')
                    step_nodes.append(clean_p)
            connections.append(step_nodes)
        else:
            p = re.sub(r'^\|[^|\n]+\|\s*', '', line)
            m = re.match(r'^([a-zA-Z0-9_-]+)\s*[\[\(\{](?:\"|\')?([^\]\)\}]+?)(?:\"|\')?[\]\)\}]$', p)
            if m:
                node_labels[m.group(1)] = m.group(2).strip(' "\'')

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DiagTitle',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#1E1B4B")
    )
    node_style = ParagraphStyle(
        'DiagNode',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=8.5,
        leading=11,
        alignment=1,
        textColor=colors.HexColor("#312E81")
    )
    arrow_style = ParagraphStyle(
        'DiagArrow',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=12,
        leading=14,
        alignment=1,
        textColor=colors.HexColor("#4F46E5")
    )

    flow_table_rows = []
    flow_table_rows.append([Paragraph("<b>VISUAL CONCEPT & CIRCUIT FLOW DIAGRAM</b>", title_style)])

    if connections:
        for idx, conn in enumerate(connections):
            row_cells = []
            col_widths = []
            for i, node_text in enumerate(conn):
                clean_node = clean_md_to_reportlab(strip_emojis_for_pdf(node_text))
                card_data = [[Paragraph(clean_node, node_style)]]
                card_table = Table(card_data, colWidths=[max(80, min(140, available_width / (len(conn) * 1.5)))])
                card_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EEF2FF")),
                    ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#818CF8")),
                    ('PADDING', (0,0), (-1,-1), 4),
                    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ]))
                row_cells.append(card_table)
                col_widths.append(max(85, min(145, available_width / (len(conn) * 1.5))))

                if i < len(conn) - 1:
                    row_cells.append(Paragraph("→", arrow_style))
                    col_widths.append(25)

            conn_table = Table([row_cells], colWidths=col_widths)
            conn_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('PADDING', (0,0), (-1,-1), 2),
            ]))
            flow_table_rows.append([conn_table])

    if len(flow_table_rows) <= 1:
        return None

    diag_table = Table(flow_table_rows, colWidths=[available_width])
    diag_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor("#C7D2FE")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    return diag_table

def _sanitize_mermaid_code(code: str) -> str:
    if not code:
        return ""
    clean = str(code).replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-").replace("\u00a0", " ").strip()
    
    # Auto-quote unquoted bracket labels ONLY if not already inside quotes
    def _quote_bracket_label(m):
        node_id, label = m.group(1), m.group(2).strip()
        if label.startswith('"') and label.endswith('"'):
            return m.group(0)
        if any(c in label for c in '()"`:,;/'):
            clean_l = label.replace('"', "'")
            return f'{node_id}["{clean_l}"]'
        return m.group(0)

    clean = re.sub(r'(?:^|[\s\n>|;])([a-zA-Z0-9_-]+)\s*\[([^"\n\]]+)\]', _quote_bracket_label, clean)
    return clean

def parse_mermaid_to_flowable(mermaid_code: str, available_width: float = 480):
    """
    Renders Mermaid diagrams into a crystal-clear vector/high-DPI PNG image matching the web UI
    using @mermaid-js/mermaid-cli with Puppeteer sandbox flags, then embeds it in a styled ReportLab Flowable card.
    """
    code_clean = _sanitize_mermaid_code(str(mermaid_code).strip())
    if not code_clean:
        return None
    
    mmd_path = None
    out_png = None
    cfg_path = None
    try:
        with tempfile.NamedTemporaryFile('w', suffix='.mmd', delete=False, encoding='utf-8') as f:
            f.write(code_clean)
            mmd_path = f.name
        
        with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f_cfg:
            json.dump({
                "args": [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--font-render-hinting=none"
                ]
            }, f_cfg)
            cfg_path = f_cfg.name
        
        out_png = mmd_path.replace('.mmd', '.png')
        npx_bin = shutil.which("npx") or "npx"
        cmd = f'"{npx_bin}" @mermaid-js/mermaid-cli -i "{mmd_path}" -o "{out_png}" -p "{cfg_path}" -b white -s 2 -q'
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=25)
        
        if os.path.exists(out_png) and os.path.getsize(out_png) > 0:
            with PILImage.open(out_png) as pimg:
                orig_w, orig_h = pimg.size
            
            target_w = min(available_width - 20, max(280.0, orig_w / 2.0))
            target_h = (target_w / (orig_w / 2.0)) * (orig_h / 2.0)
            
            # Guard against overly tall diagrams exceeding a single page
            max_allowed_h = 360.0
            if target_h > max_allowed_h:
                target_w = target_w * (max_allowed_h / target_h)
                target_h = max_allowed_h

            rl_img = RLImage(out_png, width=target_w, height=target_h)
            
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'DiagTitle',
                parent=styles['Normal'],
                fontName=UNICODE_BOLD_FONT_NAME,
                fontSize=9,
                leading=12,
                textColor=colors.HexColor('#1E1B4B')
            )
            card_data = [
                [Paragraph('<font color="#10B981">&bull;</font> <b>VISUAL DIAGRAM & FLOW</b>', title_style)],
                [rl_img]
            ]
            diag_tbl = Table(card_data, colWidths=[available_width])
            diag_tbl.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F8FAFC')),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#C7D2FE')),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
                ('ALIGN', (0,1), (-1,1), 'CENTER'),
                ('VALIGN', (0,1), (-1,1), 'MIDDLE'),
                ('PADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,1), (-1,1), 8),
            ]))
            return diag_tbl
    except Exception as e:
        logger.warning(f"Mermaid CLI execution notice: {e}")
    finally:
        if mmd_path and os.path.exists(mmd_path):
            try:
                os.remove(mmd_path)
            except Exception:
                pass
        if cfg_path and os.path.exists(cfg_path):
            try:
                os.remove(cfg_path)
            except Exception:
                pass

    return _render_mermaid_fallback_table(code_clean, available_width)

def clean_md_to_reportlab(text: str) -> str:
    """
    Transforms raw academic text, LaTeX equations, Physics vectors, chemical formulas,
    and Markdown into crisp, publication-grade ReportLab XML typography.
    """
    if not text:
        return ""
    t = str(text)
    
    # 1. Strip emojis & normalize box bullets (prevent black squares)
    t = strip_emojis_for_pdf(t)

    # 2. Normalize smart punctuation and dashes
    t = t.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
    t = t.replace("\u201c", '"').replace("\u201d", '"')
    t = t.replace("\u2018", "'").replace("\u2019", "'")
    t = t.replace("\u00a0", " ")

    # 3. Strip math delimiters across multiple lines: $...$, $$...$$, \[...\], \(...\)
    t = re.sub(r'\$\$([\s\S]*?)\$\$', r'\1', t)
    t = re.sub(r'\$([^\$]+)\$', r'\1', t)
    t = re.sub(r'\\\[([\s\S]*?)\\\]', r'\1', t)
    t = re.sub(r'\\\(([\s\S]*?)\\\)', r'\1', t)
    t = re.sub(r'\\\[|\\\]|\\\(|\\\)', '', t)

    # 4. Physics Vector Notation & Accents (e.g. \vec{A} -> A⃗, \hat{i} -> î, \bar{x} -> x̄)
    t = re.sub(r'\\hat\{\s*i\s*\}|\\hat\s+i(?![a-zA-Z])', 'î', t)
    t = re.sub(r'\\hat\{\s*j\s*\}|\\hat\s+j(?![a-zA-Z])', 'ĵ', t)
    t = re.sub(r'\\hat\{\s*k\s*\}|\\hat\s+k(?![a-zA-Z])', 'k̂', t)
    t = re.sub(r'\\hat\{\s*n\s*\}|\\hat\s+n(?![a-zA-Z])', 'n̂', t)
    t = re.sub(r'\\hat\{\s*r\s*\}|\\hat\s+r(?![a-zA-Z])', 'r̂', t)
    t = re.sub(r'\\hat\{\s*([a-zA-Z0-9]+)\s*\}', r'\1̂', t)
    t = re.sub(r'\\overrightarrow\{\s*([^{}]+)\s*\}', r'\1⃗', t)
    t = re.sub(r'\\vec\{\s*([^{}]+)\s*\}', r'\1⃗', t)
    t = re.sub(r'\\vec\s+([a-zA-Z])(?![a-zA-Z])', r'\1⃗', t)
    t = re.sub(r'\\overline\{\s*([^{}]+)\s*\}', r'\1̄', t)
    t = re.sub(r'\\bar\{\s*([^{}]+)\s*\}', r'\1̄', t)
    t = re.sub(r'\\bar\s+([a-zA-Z])(?![a-zA-Z])', r'\1̄', t)
    t = re.sub(r'\\ddot\{\s*([^{}]+)\s*\}', r'\1̈', t)
    t = re.sub(r'\\dot\{\s*([^{}]+)\s*\}', r'\1̇', t)
    t = re.sub(r'\\tilde\{\s*([^{}]+)\s*\}', r'\1̃', t)

    # 5. Greek symbols & Physical Constants
    greek_symbols = [
        (r'\\alpha(?![a-zA-Z])', 'α'), (r'\\beta(?![a-zA-Z])', 'β'), (r'\\gamma(?![a-zA-Z])', 'γ'), (r'\\Gamma(?![a-zA-Z])', 'Γ'),
        (r'\\delta(?![a-zA-Z])', 'δ'), (r'\\Delta(?![a-zA-Z])', 'Δ'), (r'\\varepsilon(?![a-zA-Z])', 'ε'), (r'\\epsilon(?![a-zA-Z])', 'ε'),
        (r'\\zeta(?![a-zA-Z])', 'ζ'), (r'\\eta(?![a-zA-Z])', 'η'), (r'\\vartheta(?![a-zA-Z])', 'θ'), (r'\\theta(?![a-zA-Z])', 'θ'), (r'\\Theta(?![a-zA-Z])', 'Θ'),
        (r'\\iota(?![a-zA-Z])', 'ι'), (r'\\kappa(?![a-zA-Z])', 'κ'), (r'\\lambda(?![a-zA-Z])', 'λ'), (r'\\Lambda(?![a-zA-Z])', 'Λ'),
        (r'\\mu(?![a-zA-Z])', 'μ'), (r'\\nu(?![a-zA-Z])', 'ν'), (r'\\xi(?![a-zA-Z])', 'ξ'), (r'\\Xi(?![a-zA-Z])', 'Ξ'),
        (r'\\pi(?![a-zA-Z])', 'π'), (r'\\Pi(?![a-zA-Z])', 'Π'), (r'\\varrho(?![a-zA-Z])', 'ρ'), (r'\\rho(?![a-zA-Z])', 'ρ'),
        (r'\\sigma(?![a-zA-Z])', 'σ'), (r'\\Sigma(?![a-zA-Z])', 'Σ'), (r'\\tau(?![a-zA-Z])', 'τ'), (r'\\upsilon(?![a-zA-Z])', 'υ'),
        (r'\\varphi(?![a-zA-Z])', 'φ'), (r'\\phi(?![a-zA-Z])', 'φ'), (r'\\Phi(?![a-zA-Z])', 'Φ'), (r'\\chi(?![a-zA-Z])', 'χ'),
        (r'\\psi(?![a-zA-Z])', 'ψ'), (r'\\Psi(?![a-zA-Z])', 'Ψ'), (r'\\omega(?![a-zA-Z])', 'ω'), (r'\\Omega(?![a-zA-Z])', 'Ω'),
        (r'\\hbar(?![a-zA-Z])', 'ℏ'), (r'\\ell(?![a-zA-Z])', 'ℓ'), (r'\\nabla(?![a-zA-Z])', '∇'), (r'\\partial(?![a-zA-Z])', '∂'),
        (r'\\degree(?![a-zA-Z])', '°'), (r'\^\\circ(?![a-zA-Z])', '°'), (r'\\circ(?![a-zA-Z])', '°'), (r'\\AA(?![a-zA-Z])', 'Å')
    ]
    for pattern_str, repl in greek_symbols:
        t = re.sub(pattern_str, repl, t)

    # 6. Trigonometry, Logarithms & Mathematical Functions
    math_functions = [
        r'\\sin(?![a-zA-Z])', r'\\cos(?![a-zA-Z])', r'\\tan(?![a-zA-Z])', r'\\cot(?![a-zA-Z])', r'\\sec(?![a-zA-Z])', r'\\csc(?![a-zA-Z])',
        r'\\arcsin(?![a-zA-Z])', r'\\arccos(?![a-zA-Z])', r'\\arctan(?![a-zA-Z])', r'\\sinh(?![a-zA-Z])', r'\\cosh(?![a-zA-Z])', r'\\tanh(?![a-zA-Z])',
        r'\\ln(?![a-zA-Z])', r'\\log(?![a-zA-Z])', r'\\exp(?![a-zA-Z])', r'\\det(?![a-zA-Z])', r'\\dim(?![a-zA-Z])', r'\\ker(?![a-zA-Z])', r'\\deg(?![a-zA-Z])',
        r'\\max(?![a-zA-Z])', r'\\min(?![a-zA-Z])', r'\\sup(?![a-zA-Z])', r'\\inf(?![a-zA-Z])'
    ]
    for fn in math_functions:
        t = re.sub(fn, lambda m: m.group(0)[1:], t)

    t = re.sub(r'\\lim_\{([^}]+)\}', r'lim(\1)', t)
    t = re.sub(r'\\lim(?![a-zA-Z])', 'lim', t)

    # 7. Mathematical & Logical Operators
    math_ops = [
        (r'\\times(?![a-zA-Z])', '×'), (r'\\div(?![a-zA-Z])', '÷'), (r'\\pm(?![a-zA-Z])', '±'), (r'\\mp(?![a-zA-Z])', '∓'),
        (r'\\cdot(?![a-zA-Z])', '·'), (r'\\bullet(?![a-zA-Z])', '&bull;'), (r'\\approx(?![a-zA-Z])', '≈'), (r'\\neq(?![a-zA-Z])', '≠'), (r'\\ne(?![a-zA-Z])', '≠'),
        (r'\\leq(?![a-zA-Z])', '≤'), (r'\\le(?![a-zA-Z])', '≤'), (r'\\geq(?![a-zA-Z])', '≥'), (r'\\ge(?![a-zA-Z])', '≥'),
        (r'\\ll(?![a-zA-Z])', '≪'), (r'\\gg(?![a-zA-Z])', '≫'), (r'\\equiv(?![a-zA-Z])', '≡'), (r'\\cong(?![a-zA-Z])', '≅'),
        (r'\\propto(?![a-zA-Z])', '∝'), (r'\\sim(?![a-zA-Z])', '~'),
        (r'\\rightarrow(?![a-zA-Z])', '→'), (r'\\to(?![a-zA-Z])', '→'), (r'\\leftarrow(?![a-zA-Z])', '←'),
        (r'\\leftrightarrow(?![a-zA-Z])', '↔'), (r'\\Rightarrow(?![a-zA-Z])', '⇒'), (r'\\implies(?![a-zA-Z])', '⇒'),
        (r'\\Leftarrow(?![a-zA-Z])', '⇐'), (r'\\Leftrightarrow(?![a-zA-Z])', '⇔'), (r'\\iff(?![a-zA-Z])', '⇔'),
        (r'\\rightleftharpoons(?![a-zA-Z])', '⇌'),
        (r'\\infty(?![a-zA-Z])', '∞'), (r'\\angle(?![a-zA-Z])', '∠'), (r'\\parallel(?![a-zA-Z])', '∥'), (r'\\perp(?![a-zA-Z])', '⊥'), (r'\\triangle(?![a-zA-Z])', '△'),
        (r'\\in(?![a-zA-Z])', '∈'), (r'\\notin(?![a-zA-Z])', '∉'), (r'\\subset(?![a-zA-Z])', '⊂'), (r'\\subseteq(?![a-zA-Z])', '⊆'),
        (r'\\supset(?![a-zA-Z])', '⊃'), (r'\\supseteq(?![a-zA-Z])', '⊇'),
        (r'\\cap(?![a-zA-Z])', '∩'), (r'\\cup(?![a-zA-Z])', '∪'), (r'\\forall(?![a-zA-Z])', '∀'), (r'\\exists(?![a-zA-Z])', '∃'),
        (r'\\emptyset(?![a-zA-Z])', '∅'), (r'\\otimes(?![a-zA-Z])', '⊗'), (r'\\oplus(?![a-zA-Z])', '⊕'), (r'\\odot(?![a-zA-Z])', '⊙')
    ]
    for pattern_str, repl in math_ops:
        t = re.sub(pattern_str, repl, t)

    # 8. Calculus Integrals & Summations
    t = re.sub(r'\\iint(?![a-zA-Z])', '∬', t)
    t = re.sub(r'\\iiint(?![a-zA-Z])', '∭', t)
    t = re.sub(r'\\oint(?![a-zA-Z])', '∮', t)
    t = re.sub(r'\\int(?![a-zA-Z])', '∫', t)
    t = re.sub(r'\\sum(?![a-zA-Z])', '∑', t)
    t = re.sub(r'\\prod(?![a-zA-Z])', '∏', t)

    # 9. LaTeX Text & Font Formatting
    t = re.sub(r'\\mathbf\{([^{}]+)\}', r'<b>\1</b>', t)
    t = re.sub(r'\\textbf\{([^{}]+)\}', r'<b>\1</b>', t)
    t = re.sub(r'\\boldsymbol\{([^{}]+)\}', r'<b>\1</b>', t)
    t = re.sub(r'\\bm\{([^{}]+)\}', r'<b>\1</b>', t)
    t = re.sub(r'\\mathit\{([^{}]+)\}', r'<i>\1</i>', t)
    t = re.sub(r'\\textit\{([^{}]+)\}', r'<i>\1</i>', t)
    t = re.sub(r'\\underline\{([^{}]+)\}', r'<u>\1</u>', t)
    t = re.sub(r'\\text\{([^{}]+)\}', r'\1', t)
    t = re.sub(r'\\mathrm\{([^{}]+)\}', r'\1', t)
    t = re.sub(r'\\operatorname\{([^{}]+)\}', r'\1', t)
    t = re.sub(r'\\mathbb\{([^{}]+)\}', r'\1', t)
    t = re.sub(r'\\mathcal\{([^{}]+)\}', r'\1', t)

    # 10. Fractions and Roots
    def _format_fraction(m):
        num = m.group(1).strip()
        den = m.group(2).strip()
        if re.match(r'^[+-]?[0-9a-zA-Zα-ωΑ-Ω\.\u20D7\u0302\u0304]+$', num) and re.match(r'^[+-]?[0-9a-zA-Zα-ωΑ-Ω\.\u20D7\u0302\u0304]+$', den):
            return f"{num}/{den}"
        return f"({num})/({den})"

    for _ in range(5):
        t = re.sub(r'\\frac\{([^{}]+)\}\{([^{}]+)\}', _format_fraction, t)
        t = re.sub(r'\\sqrt\[([^{}]+)\]\{([^{}]+)\}', r'<sup>\1</sup>√(\2)', t)
        t = re.sub(r'\\sqrt\{([^{}]+)\}', r'√(\1)', t)

    # 11. Exponents & Superscripts
    UNICODE_TO_SUB = {
        '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
        '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
        '₊': '+', '₋': '-', '₌': '=', '₍': '(', '₎': ')',
        'ₐ': 'a', 'ₑ': 'e', 'ₒ': 'o', 'ₓ': 'x', 'ₕ': 'h', 'ₖ': 'k', 'ₗ': 'l', 'ₘ': 'm', 'ₙ': 'n', 'ₚ': 'p', 'ₛ': 's', 'ₜ': 't', 'ᵢ': 'i', 'ⱼ': 'j', 'ᵣ': 'r', 'ᵤ': 'u', 'ᵥ': 'v'
    }

    UNICODE_TO_SUPER = {
        '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
        '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
        '⁺': '+', '⁻': '-', '⁼': '=', '⁽': '(', '⁾': ')',
        'ⁿ': 'n', 'ⁱ': 'i', 'ˣ': 'x', 'ʸ': 'y', 'ᵃ': 'a', 'ᵇ': 'b', 'ᶜ': 'c', 'ᵈ': 'd', 'ᵉ': 'e', 'ᵐ': 'm', 'ᵖ': 'p', 'ᵗ': 't'
    }

    # Convert any raw Unicode subscripts (e.g. CO₂, H₂O, O₂) to <sub>...</sub> in ReportLab XML
    t = re.sub(r'[₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₒₓₕₖₗₘₙₚₛₜᵢⱼᵣᵤᵥ]+', lambda m: f"<sub>{''.join(UNICODE_TO_SUB.get(c, c) for c in m.group(0))}</sub>", t)

    # Convert any raw Unicode superscripts (e.g. x², 10⁻³) to <sup>...</sup> in ReportLab XML
    t = re.sub(r'[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱˣʸᵃᵇᶜᵈᵉᵐᵖᵗ]+', lambda m: f"<sup>{''.join(UNICODE_TO_SUPER.get(c, c) for c in m.group(0))}</sup>", t)

    def _replace_super(m):
        return f"<sup>{m.group(1)}</sup>"

    t = re.sub(r'\^\{([^{}]+)\}', _replace_super, t)
    t = re.sub(r'\^([0-9a-zA-Z+\-]+)', _replace_super, t)

    # 12. Subscripts / Indices
    def _replace_sub(m):
        return f"<sub>{m.group(1)}</sub>"

    for _ in range(4):
        t = re.sub(r'_\{([^{}]+)\}', _replace_sub, t)
    t = re.sub(r'_([0-9]+)', _replace_sub, t)
    t = re.sub(r'_([a-zA-Z])(?![a-zA-Z])', _replace_sub, t)

    # 13. Strip leftover LaTeX layout artifacts & stray backslashes
    t = re.sub(r'\\displaystyle(?![a-zA-Z])', '', t)
    t = re.sub(r'\\textstyle(?![a-zA-Z])', '', t)
    t = re.sub(r'\\limits(?![a-zA-Z])', '', t)
    t = re.sub(r'\\nolimits(?![a-zA-Z])', '', t)
    t = re.sub(r'\\left\(', '(', t)
    t = re.sub(r'\\right\)', ')', t)
    t = re.sub(r'\\left\[', '[', t)
    t = re.sub(r'\\right\]', ']', t)
    t = re.sub(r'\\left\{', '{', t)
    t = re.sub(r'\\right\}', '}', t)
    t = re.sub(r'\\left\|', '|', t)
    t = re.sub(r'\\right\|', '|', t)
    t = re.sub(r'\\left\.', '', t)
    t = re.sub(r'\\right\.', '', t)
    t = re.sub(r'\\left(?![a-zA-Z])', '', t)
    t = re.sub(r'\\right(?![a-zA-Z])', '', t)
    t = re.sub(r'\\[,\;!]', ' ', t)
    t = re.sub(r'\\quad(?![a-zA-Z])', '  ', t)
    t = re.sub(r'\\qquad(?![a-zA-Z])', '    ', t)
    
    t = re.sub(r'\\([%$\&_#{}])', r'\1', t)
    t = re.sub(r'\\\s+', ' ', t)

    # Normalize bullet points and dots
    t = re.sub(r'^\s*[-*•+]\s+', '&bull;&nbsp; ', t, flags=re.MULTILINE)
    t = re.sub(r'(?:<br\s*/?>|&lt;br\s*/?&gt;)\s*[-*•+]\s+', '<br/>&bull;&nbsp; ', t, flags=re.IGNORECASE)
    t = re.sub(r'[\u2022\u25CF\u25E6\u2219\u2023\u2043]', '&bull;', t)

    # Clean stray unmatched bold asterisks like "Q4 - Title**" -> "<b>Q4 - Title</b>"
    if t.count('**') % 2 != 0:
        if t.startswith('**'):
            t = t[2:]
        elif t.endswith('**'):
            t = t[:-2]
        else:
            t = t.replace('**', '')

    # 14. Convert Markdown bold **text** to <b>text</b>
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)

    # 15. Convert Markdown italic *text* or _text_ to <i>text</i>
    t = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'<i>\1</i>', t)

    # 16. Convert inline code `text` to Courier font
    t = re.sub(r'`([^`]+?)`', r'<font face="Courier">\1</font>', t)

    # 17. Normalize HTML breaks (<br>, <br/>, <br />, &lt;br&gt;) and newlines
    t = re.sub(r'(?:<br\s*/?>|&lt;br\s*/?&gt;|\n)+', '<br/>', t.strip(), flags=re.IGNORECASE)

    # 18. Wrap Devanagari Hindi text sequences in Devanagari font
    def _wrap_devanagari(m):
        content = m.group(0)
        return f'<font face="DevanagariFont">{content}</font>'
    
    t = re.sub(r'[\u0900-\u097F\uA8E0-\uA8FF\u200C\u200D]+(?:\s+[\u0900-\u097F\uA8E0-\uA8FF\u200C\u200D]+)*', _wrap_devanagari, t)

    # 19. Balance unclosed tags safely using word boundaries
    for tag in ["b", "i", "u", "sup", "sub", "font"]:
        open_t = len(re.findall(rf'<{tag}(?:\s[^>]*)?>', t, re.IGNORECASE))
        close_t = len(re.findall(rf'</{tag}>', t, re.IGNORECASE))
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
    try:
        return Paragraph(cleaned, style)
    except Exception:
        try:
            # Fallback to plain XML escaped text
            safe_text = html.escape(raw_str).replace("\n", "<br/>")
            return Paragraph(safe_text, style)
        except Exception:
            # Ultimate fallback to plain ASCII
            ascii_text = raw_str.encode("ascii", "ignore").decode("ascii").replace("\n", " ")
            return Paragraph(html.escape(ascii_text), style)


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
        fills = [q for q in paper.questions if q.question_type in ('fill_in_the_blanks', 'fill_blanks', 'fill')]
        ars = [q for q in paper.questions if q.question_type in ('assertion_reason', 'ar')]
        shorts = [q for q in paper.questions if q.question_type == 'short']
        longs = [q for q in paper.questions if q.question_type == 'long']
        cases = [q for q in paper.questions if q.question_type in ('case_study', 'case')]
        others = [q for q in paper.questions if q not in mcqs and q not in fills and q not in ars and q not in shorts and q not in longs and q not in cases]

        import html
        def render_question_block(q):
            q_elements = []

            raw_q = strip_emojis_for_pdf(q.question_text or "")
            
            # Check if case study has passage
            if q.question_type in ('case_study', 'case') and getattr(q, "case_passage", None):
                passage_text = clean_md_to_reportlab(strip_emojis_for_pdf(str(q.case_passage)))
                passage_table = Table(
                    [[Paragraph(f"<b>CASE STUDY SCENARIO / CONTEXT:</b><br/>{passage_text}", instruction_style)]],
                    colWidths=[520]
                )
                passage_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
                    ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
                    ('PADDING', (0,0), (-1,-1), 8),
                ]))
                q_elements.append(passage_table)
                q_elements.append(Spacer(1, 4))

            # Check if question text contains a Mermaid diagram
            mermaid_match = re.search(r'```(?:mermaid|graph|flowchart)?\s*([\s\S]*?)```', raw_q, re.IGNORECASE)
            if mermaid_match:
                mermaid_code = mermaid_match.group(1).strip()
                text_before = raw_q[:mermaid_match.start()].strip()
                text_after = raw_q[mermaid_match.end():].strip()

                if text_before:
                    q_formatted = clean_md_to_reportlab(text_before)
                    q_elements.append(Paragraph(f"<b>Q{q.question_number}.</b> {q_formatted} <font color='#6366F1'><b>[{q.marks} Mark{'s' if q.marks > 1 else ''}]</b></font>", q_text_style))
                else:
                    q_elements.append(Paragraph(f"<b>Q{q.question_number}.</b> <font color='#6366F1'><b>[{q.marks} Mark{'s' if q.marks > 1 else ''}]</b></font>", q_text_style))

                diag_flow = parse_mermaid_to_flowable(mermaid_code, available_width=510)
                if diag_flow:
                    q_elements.append(Spacer(1, 4))
                    q_elements.append(diag_flow)
                    q_elements.append(Spacer(1, 4))

                if text_after:
                    q_elements.append(Paragraph(clean_md_to_reportlab(text_after), q_text_style))
            else:
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

        sec_char = ord('A')
        if mcqs:
            story.append(Paragraph(f"SECTION {chr(sec_char)}: MULTIPLE CHOICE QUESTIONS", section_style))
            sec_char += 1
            for q in mcqs:
                story.extend(render_question_block(q))

        if fills:
            story.append(Paragraph(f"SECTION {chr(sec_char)}: FILL IN THE BLANKS", section_style))
            sec_char += 1
            for q in fills:
                story.extend(render_question_block(q))

        if ars:
            story.append(Paragraph(f"SECTION {chr(sec_char)}: ASSERTION-REASON QUESTIONS", section_style))
            sec_char += 1
            for q in ars:
                story.extend(render_question_block(q))

        if shorts:
            story.append(Paragraph(f"SECTION {chr(sec_char)}: SHORT ANSWER QUESTIONS", section_style))
            sec_char += 1
            for q in shorts:
                story.extend(render_question_block(q))

        if longs:
            story.append(Paragraph(f"SECTION {chr(sec_char)}: LONG ANSWER / HOTS QUESTIONS", section_style))
            sec_char += 1
            for q in longs:
                story.extend(render_question_block(q))

        if cases:
            story.append(Paragraph(f"SECTION {chr(sec_char)}: CASE STUDY / COMPETENCY-BASED QUESTIONS", section_style))
            sec_char += 1
            for q in cases:
                story.extend(render_question_block(q))

        if others:
            story.append(Paragraph(f"SECTION {chr(sec_char)}: ADDITIONAL QUESTIONS", section_style))
            sec_char += 1
            for q in others:
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
        in_code_fence = False
        fence_lang = ""
        fence_lines = []
        page_width = A4[0] - (2 * margins)

        for raw_line in raw_lines:
            line = raw_line.strip()

            # Handle Code Blocks & Mermaid Diagrams
            if in_code_fence:
                if line.startswith("```"):
                    in_code_fence = False
                    code_str = "\n".join(fence_lines)
                    if fence_lang in ["mermaid", "graph", "flowchart"] or "-->" in code_str or "->" in code_str:
                        diag_flow = parse_mermaid_to_flowable(code_str, available_width=page_width)
                        if diag_flow:
                            story.append(Spacer(1, 3))
                            story.append(diag_flow)
                            story.append(Spacer(1, 4))
                    else:
                        # Render code block in monospaced box
                        code_cells = [[Paragraph(clean_md_to_reportlab(code_str), body_style)]]
                        code_tbl = Table(code_cells, colWidths=[page_width])
                        code_tbl.setStyle(TableStyle([
                            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
                            ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor("#CBD5E1")),
                            ('PADDING', (0,0), (-1,-1), 6),
                        ]))
                        story.append(code_tbl)
                        story.append(Spacer(1, 4))
                    fence_lines = []
                    fence_lang = ""
                else:
                    fence_lines.append(raw_line)
                continue

            if line.startswith("```"):
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
                        story.append(Spacer(1, 4))
                    except Exception:
                        pass
                    in_table_block = False
                    table_rows = []
                in_code_fence = True
                fence_lang = line.replace("```", "").strip().lower()
                fence_lines = []
                continue

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

        # Flush any trailing table or code block
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

        if in_code_fence and fence_lines:
            code_str = "\n".join(fence_lines)
            if fence_lang in ["mermaid", "graph", "flowchart"] or "-->" in code_str or "->" in code_str:
                diag_flow = parse_mermaid_to_flowable(code_str, available_width=page_width)
                if diag_flow:
                    story.append(diag_flow)

        doc.build(story, canvasmaker=NumberedCanvas)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

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
        raw_q_text = str(q.get("question_text", "")).strip()
        marks_badge = f"**[{q_marks} {'Mark' if q_marks == 1 else 'Marks'}]**"

        # Check if question contains a Mermaid diagram
        mermaid_match = re.search(r'```(?:mermaid|graph|flowchart)?\s*([\s\S]*?)```', raw_q_text, re.IGNORECASE)
        if mermaid_match:
            mermaid_code = mermaid_match.group(1).strip()
            text_before = raw_q_text[:mermaid_match.start()].strip()
            text_after = raw_q_text[mermaid_match.end():].strip()

            if text_before:
                story.append(build_safe_paragraph(f"**Q{q_num}.** {text_before}   {marks_badge}", q_stem_style))
            else:
                story.append(build_safe_paragraph(f"**Q{q_num}.**   {marks_badge}", q_stem_style))

            diag_flow = parse_mermaid_to_flowable(mermaid_code, available_width=page_width)
            if diag_flow:
                story.append(Spacer(1, 3))
                story.append(diag_flow)
                story.append(Spacer(1, 4))

            if text_after:
                story.append(build_safe_paragraph(text_after, q_stem_style))
        else:
            full_q_str = f"**Q{q_num}.** {raw_q_text}   {marks_badge}"
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

def _decode_school_logo(logo_data: Optional[str], max_w: float = 60, max_h: float = 40):
    if not logo_data:
        return None
    s = str(logo_data).strip()
    if not s:
        return None
    try:
        if s.startswith("data:image"):
            header, b64_data = s.split(",", 1)
            raw = base64.b64decode(b64_data)
            img_io = io.BytesIO(raw)
            with PILImage.open(img_io) as pil_img:
                w, h = pil_img.size
            scale = min(max_w / max(1, w), max_h / max(1, h), 1.0)
            return RLImage(io.BytesIO(raw), width=max(10, w * scale), height=max(10, h * scale))
        elif s.startswith("http://") or s.startswith("https://"):
            with httpx.Client(timeout=4.0) as client:
                resp = client.get(s)
                if resp.status_code == 200:
                    raw = resp.content
                    img_io = io.BytesIO(raw)
                    with PILImage.open(img_io) as pil_img:
                        w, h = pil_img.size
                    scale = min(max_w / max(1, w), max_h / max(1, h), 1.0)
                    return RLImage(io.BytesIO(raw), width=max(10, w * scale), height=max(10, h * scale))
        elif os.path.exists(s):
            with PILImage.open(s) as pil_img:
                w, h = pil_img.size
            scale = min(max_w / max(1, w), max_h / max(1, h), 1.0)
            return RLImage(s, width=max(10, w * scale), height=max(10, h * scale))
        elif len(s) > 100:
            raw = base64.b64decode(s)
            img_io = io.BytesIO(raw)
            with PILImage.open(img_io) as pil_img:
                w, h = pil_img.size
            scale = min(max_w / max(1, w), max_h / max(1, h), 1.0)
            return RLImage(io.BytesIO(raw), width=max(10, w * scale), height=max(10, h * scale))
    except Exception as e:
        logger.warning(f"Logo decode notice: {e}")
    return None

def _generate_worksheet_pdf(self, payload: Dict[str, Any]) -> bytes:
    title = str(payload.get("title") or "Classroom Practice Worksheet").strip()
    subject = str(payload.get("subject") or "General").strip()
    class_name = str(payload.get("class_name") or "Class 10").strip()
    chapter = str(payload.get("chapter") or "").strip()
    content = str(payload.get("content") or "").strip()
    theme_name = str(payload.get("theme") or "cbse").lower()
    font_size_mode = str(payload.get("font_size") or "standard").lower()
    include_student_header = payload.get("include_student_header", True)
    school_name = str(payload.get("school_name") or "DEVGYA GLOBAL EDUTECH").strip()
    school_logo = payload.get("school_logo")

    THEME_COLORS = {
        "cbse": {
            "primary": colors.HexColor("#1E3A8A"),      # Navy 900
            "secondary": colors.HexColor("#2563EB"),    # Blue 600
            "border": colors.HexColor("#BFDBFE"),       # Blue 200
            "bg_meta": colors.HexColor("#EFF6FF"),      # Light Sky
            "box_bg": colors.HexColor("#F8FAFC"),
            "table_header": colors.HexColor("#1E3A8A"),
            "table_header_text": colors.white,
            "table_row_even": colors.HexColor("#F8FAFC"),
            "table_row_odd": colors.HexColor("#FFFFFF")
        },
        "modern": {
            "primary": colors.HexColor("#4338CA"),      # Indigo 700
            "secondary": colors.HexColor("#6366F1"),    # Indigo 500
            "border": colors.HexColor("#C7D2FE"),       # Indigo 200
            "bg_meta": colors.HexColor("#EEF2FF"),
            "box_bg": colors.HexColor("#FAFAFA"),
            "table_header": colors.HexColor("#4338CA"),
            "table_header_text": colors.white,
            "table_row_even": colors.HexColor("#F5F3FF"),
            "table_row_odd": colors.HexColor("#FFFFFF")
        },
        "minimalist": {
            "primary": colors.HexColor("#0F172A"),      # Slate 900
            "secondary": colors.HexColor("#475569"),    # Slate 600
            "border": colors.HexColor("#CBD5E1"),       # Slate 300
            "bg_meta": colors.HexColor("#F1F5F9"),
            "box_bg": colors.HexColor("#F8FAFC"),
            "table_header": colors.HexColor("#0F172A"),
            "table_header_text": colors.white,
            "table_row_even": colors.HexColor("#F8FAFC"),
            "table_row_odd": colors.HexColor("#FFFFFF")
        },
        "emerald": {
            "primary": colors.HexColor("#065F46"),      # Emerald 800
            "secondary": colors.HexColor("#059669"),    # Emerald 600
            "border": colors.HexColor("#A7F3D0"),       # Emerald 200
            "bg_meta": colors.HexColor("#ECFDF5"),
            "box_bg": colors.HexColor("#F0FDF4"),
            "table_header": colors.HexColor("#065F46"),
            "table_header_text": colors.white,
            "table_row_even": colors.HexColor("#ECFDF5"),
            "table_row_odd": colors.HexColor("#FFFFFF")
        }
    }

    th = THEME_COLORS.get(theme_name, THEME_COLORS["cbse"])

    # Font sizing
    if font_size_mode == "compact":
        body_font_size = 8.5
        body_leading = 12.0
        h1_size, h1_lead = 13.0, 16.0
        h2_size, h2_lead = 11.0, 14.0
        h3_size, h3_lead = 9.5, 13.0
    elif font_size_mode == "large":
        body_font_size = 10.5
        body_leading = 15.0
        h1_size, h1_lead = 15.0, 19.0
        h2_size, h2_lead = 13.0, 17.0
        h3_size, h3_lead = 11.0, 15.0
    else:
        body_font_size = 9.5
        body_leading = 13.5
        h1_size, h1_lead = 14.0, 18.0
        h2_size, h2_lead = 12.0, 15.5
        h3_size, h3_lead = 10.5, 14.0

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=32,
        rightMargin=32,
        topMargin=34,
        bottomMargin=36
    )
    page_width = 595.27 - 64  # A4 width minus margins = ~531pt

    styles = getSampleStyleSheet()

    school_style = ParagraphStyle(
        'WS_School',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=13,
        leading=16,
        alignment=1,
        textColor=th["primary"]
    )
    title_style = ParagraphStyle(
        'WS_Title',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=11,
        leading=14,
        alignment=1,
        textColor=th["secondary"]
    )
    meta_style = ParagraphStyle(
        'WS_Meta',
        parent=styles['Normal'],
        fontName=UNICODE_FONT_NAME,
        fontSize=8.5,
        leading=11,
        alignment=1,
        textColor=colors.HexColor("#475569")
    )
    logo_badge_style = ParagraphStyle(
        'WS_LogoBadge',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=9,
        leading=11,
        alignment=1,
        textColor=th["primary"]
    )
    h1_style = ParagraphStyle(
        'WS_H1',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=h1_size,
        leading=h1_lead,
        textColor=th["primary"],
        spaceBefore=8,
        spaceAfter=4
    )
    h2_style = ParagraphStyle(
        'WS_H2',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=h2_size,
        leading=h2_lead,
        textColor=th["secondary"],
        spaceBefore=6,
        spaceAfter=3
    )
    h3_style = ParagraphStyle(
        'WS_H3',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=h3_size,
        leading=h3_lead,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=4,
        spaceAfter=2
    )
    body_style = ParagraphStyle(
        'WS_Body',
        parent=styles['Normal'],
        fontName=UNICODE_FONT_NAME,
        fontSize=body_font_size,
        leading=body_leading,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=2,
        spaceAfter=3
    )
    bullet_style = ParagraphStyle(
        'WS_Bullet',
        parent=styles['Normal'],
        fontName=UNICODE_FONT_NAME,
        fontSize=body_font_size,
        leading=body_leading,
        leftIndent=12,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=1.5,
        spaceAfter=1.5
    )
    table_cell_style = ParagraphStyle(
        'WS_TableCell',
        parent=styles['Normal'],
        fontName=UNICODE_FONT_NAME,
        fontSize=body_font_size - 1,
        leading=body_leading - 2,
        textColor=colors.HexColor("#1E293B")
    )
    table_header_style = ParagraphStyle(
        'WS_TableHead',
        parent=styles['Normal'],
        fontName=UNICODE_BOLD_FONT_NAME,
        fontSize=body_font_size - 0.5,
        leading=body_leading - 1.5,
        textColor=th["table_header_text"]
    )

    story = []

    # 1. HEADER BANNER
    logo_flowable = _decode_school_logo(school_logo, max_w=55, max_h=38)
    header_left = []
    if logo_flowable:
        header_left.append(logo_flowable)
    else:
        badge_cell = [[Paragraph("<b>DEVGYA</b>", logo_badge_style)]]
        badge_table = Table(badge_cell, colWidths=[60])
        badge_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), th["bg_meta"]),
            ('BOX', (0,0), (-1,-1), 1, th["border"]),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        header_left.append(badge_table)

    sub_info = f"<b>{subject}</b> | <b>{class_name}</b>"
    if chapter:
        sub_info += f" | <i>{chapter}</i>"

    header_center = [
        Paragraph(school_name.upper(), school_style),
        Paragraph(title, title_style),
        Paragraph(sub_info, meta_style)
    ]

    header_table = Table([[header_left[0], header_center]], colWidths=[65, page_width - 65])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (0,0), 'CENTER'),
        ('ALIGN', (1,0), (1,0), 'CENTER'),
        ('BACKGROUND', (0,0), (-1,-1), th["bg_meta"]),
        ('BOX', (0,0), (-1,-1), 1.2, th["primary"]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 6))

    # 2. STUDENT METADATA BOX (if enabled)
    if include_student_header:
        meta_row1 = [
            Paragraph("<b>Student Name:</b> ___________________________", meta_style),
            Paragraph("<b>Roll No:</b> ____________", meta_style),
            Paragraph(f"<b>Class:</b> {class_name}", meta_style),
            Paragraph("<b>Date:</b> ____________", meta_style),
        ]
        meta_table = Table([meta_row1], colWidths=[page_width * 0.40, page_width * 0.20, page_width * 0.20, page_width * 0.20])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), th["box_bg"]),
            ('BOX', (0,0), (-1,-1), 0.8, th["border"]),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 4),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 8))

    # 3. CONTENT PARSER
    lines = content.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        # Check for Code Blocks & Mermaid Diagrams
        if stripped.startswith("```"):
            fence_lang = stripped[3:].strip().lower()
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            if i < len(lines):
                i += 1  # skip closing ```
            
            code_str = "\n".join(code_lines).strip()
            if not code_str:
                continue

            # Check if this code block is a Mermaid diagram
            is_mermaid = (
                fence_lang in ["mermaid", "graph", "flowchart", "sequencediagram", "mindmap", "pie", "classdiagram", "erdiagram", "gantt", "gitgraph", "journey", "quadrantchart"]
                or "-->" in code_str
                or "->>" in code_str
                or "flowchart" in code_str.lower()
                or "graph " in code_str.lower()
                or "mindmap" in code_str.lower()
                or "sequencediagram" in code_str.lower()
            )

            if is_mermaid:
                diag = parse_mermaid_to_flowable(code_str, available_width=page_width)
                if diag:
                    story.append(Spacer(1, 4))
                    story.append(diag)
                    story.append(Spacer(1, 6))
                continue
            else:
                # Regular code block formatted nicely
                code_p = f"<font face='Courier' size='8'>{html.escape(code_str).replace(chr(10), '<br/>')}</font>"
                code_table = Table([[Paragraph(code_p, body_style)]], colWidths=[page_width])
                code_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
                    ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor('#CBD5E1')),
                    ('PADDING', (0,0), (-1,-1), 6),
                ]))
                story.append(Spacer(1, 4))
                story.append(code_table)
                story.append(Spacer(1, 6))
                continue

        # Check for Markdown Table: | Col 1 | Col 2 |
        if stripped.startswith("|") and stripped.endswith("|"):
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
            
            # Parse table rows
            parsed_rows = []
            for tl in table_lines:
                # skip divider row |---|---|
                if re.match(r'^\|[\s\-:|]+\|$', tl):
                    continue
                cells = [c.strip() for c in tl.split("|")[1:-1]]
                parsed_rows.append(cells)

            if parsed_rows:
                try:
                    num_cols = max(len(r) for r in parsed_rows)
                    
                    # Proportional column width estimation based on cell content length
                    col_max_lens = [0] * num_cols
                    for row in parsed_rows:
                        for c_idx in range(num_cols):
                            c_text = row[c_idx] if c_idx < len(row) else ""
                            col_max_lens[c_idx] = max(col_max_lens[c_idx], len(str(c_text)))

                    total_len = sum(max(l, 8) for l in col_max_lens) or 1
                    col_widths = []
                    for l in col_max_lens:
                        raw_w = (max(l, 8) / float(total_len)) * page_width
                        col_widths.append(max(38.0, min(page_width - 40.0, raw_w)))

                    # Normalize to exact available width
                    scale_w = page_width / sum(col_widths)
                    final_col_widths = [w * scale_w for w in col_widths]

                    table_data = []
                    for r_idx, row in enumerate(parsed_rows):
                        row_data = []
                        for c_idx in range(num_cols):
                            c_text = row[c_idx] if c_idx < len(row) else ""
                            c_style = table_header_style if r_idx == 0 else table_cell_style
                            row_data.append(build_safe_paragraph(c_text, c_style))
                        table_data.append(row_data)

                    rl_table = Table(table_data, colWidths=final_col_widths, repeatRows=1)
                    rl_table.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,0), th["table_header"]),
                        ('BOX', (0,0), (-1,-1), 1, th["border"]),
                        ('INNERGRID', (0,0), (-1,-1), 0.5, th["border"]),
                        ('PADDING', (0,0), (-1,-1), 4),
                        ('VALIGN', (0,0), (-1,-1), 'TOP'),
                        ('ROWBACKGROUNDS', (0,1), (-1,-1), [th["table_row_even"], th["table_row_odd"]]),
                    ]))
                    story.append(Spacer(1, 4))
                    story.append(rl_table)
                    story.append(Spacer(1, 6))
                except Exception as tbl_err:
                    logger.warning(f"Table rendering notice: {tbl_err}")
                    for row in parsed_rows:
                        story.append(build_safe_paragraph(" | ".join(row), body_style))
            continue

        # Headings
        if stripped.startswith("### "):
            h_text = stripped[4:].strip()
            story.append(build_safe_paragraph(h_text, h3_style))
            i += 1
            continue
        elif stripped.startswith("## "):
            h_text = stripped[3:].strip()
            story.append(Spacer(1, 4))
            story.append(build_safe_paragraph(h_text, h2_style))
            story.append(HRFlowable(width="100%", thickness=0.8, color=th["border"], spaceBefore=1, spaceAfter=4))
            i += 1
            continue
        elif stripped.startswith("# "):
            h_text = stripped[2:].strip()
            story.append(Spacer(1, 6))
            story.append(build_safe_paragraph(h_text, h1_style))
            story.append(HRFlowable(width="100%", thickness=1.2, color=th["primary"], spaceBefore=1, spaceAfter=5))
            i += 1
            continue

        # Bullet list items
        if stripped.startswith(("- ", "* ", "• ", "+ ")):
            item_text = stripped[2:].strip()
            bullet_p = f"&bull;&nbsp; {item_text}"
            story.append(build_safe_paragraph(bullet_p, bullet_style))
            i += 1
            continue

        # Numbered list items
        num_match = re.match(r'^(\d+[\.\)])\s*(.*)$', stripped)
        if num_match:
            n_prefix, n_text = num_match.group(1), num_match.group(2)
            num_p = f"<b>{n_prefix}</b> {n_text}"
            story.append(build_safe_paragraph(num_p, bullet_style))
            i += 1
            continue

        # General Paragraph
        story.append(build_safe_paragraph(stripped, body_style))
        i += 1

    try:
        doc.build(story, canvasmaker=NumberedCanvas)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
    except Exception as build_err:
        logger.error(f"Worksheet PDF build error: {build_err}, building with safe fallback layout")
        fallback_buffer = io.BytesIO()
        doc_fb = SimpleDocTemplate(fallback_buffer, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=45)
        fallback_story = [
            Paragraph(f"<b>{school_name}</b>", school_style),
            Paragraph(f"<b>{title}</b>", title_style),
            Paragraph(f"<b>{subject}</b> | <b>{class_name}</b>", meta_style),
            Spacer(1, 10)
        ]
        for line in lines:
            if line.strip():
                fallback_story.append(Paragraph(html.escape(line.strip()), body_style))
        doc_fb.build(fallback_story, canvasmaker=NumberedCanvas)
        pdf_bytes = fallback_buffer.getvalue()
        fallback_buffer.close()
        return pdf_bytes

PDFGeneratorService.generate_assignment_worksheet_pdf = _generate_assignment_worksheet_pdf
PDFGeneratorService.generate_worksheet_pdf = _generate_worksheet_pdf
pdf_generator_service = PDFGeneratorService()
