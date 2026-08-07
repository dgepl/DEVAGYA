import io
import base64
import logging
from PIL import Image
from services.ai_provider import ai_provider
from services.pdf_service import extract_document_text

logger = logging.getLogger("ocr_service")

class OCRService:
    async def extract_text_from_bytes(self, file_bytes: bytes, filename: str, content_type: str = "") -> str:
        """
        Perform real OCR extraction from uploaded image, PDF, or worksheet bytes.
        Utilizes AI Vision for images/photos and text parsing for PDF/Word documents.
        """
        filename_lower = filename.lower()
        c_type = (content_type or "").lower()

        # 1. Document Extraction (PDF, DOCX, TXT)
        if filename_lower.endswith((".pdf", ".docx", ".doc", ".txt")) or "pdf" in c_type or "word" in c_type:
            try:
                extracted = extract_document_text(file_bytes, filename, content_type)
                if extracted and not extracted.startswith("[Error"):
                    return f"### OCR Document Extract ({filename})\n\n{extracted}"
            except Exception as e:
                logger.warning(f"Document extraction fallback for {filename}: {e}")

        # 2. Image OCR via AI Vision Model (PNG, JPG, JPEG, WEBP, etc.)
        try:
            img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            if img.width > 1400:
                h = int(img.height * 1400 / img.width)
                img = img.resize((1400, h))
            
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=85)
            enc = base64.b64encode(buf.getvalue()).decode("ascii")
            image_data_url = f"data:image/jpeg;base64,{enc}"

            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are an expert Optical Character Recognition (OCR) Engine. "
                        "Transcribe ALL visible text, headings, sub-headings, mathematical formulas, equations, "
                        "question statements, and options from the image EXACTLY as they appear. "
                        "Do NOT skip any text. Output clean, well-formatted Markdown."
                    )
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Transcribe all text from this textbook page / worksheet image ({filename}) into clean markdown."
                        },
                        {"type": "image_url", "image_url": {"url": image_data_url}}
                    ]
                }
            ]

            transcription = await ai_provider.chat_completion(messages, temperature=0.2)
            if transcription and len(transcription.strip()) > 10:
                return transcription.strip()
        except Exception as e:
            logger.error(f"Vision OCR Error for {filename}: {e}")

        # 3. Fallback Document Extractor
        try:
            raw_text = extract_document_text(file_bytes, filename, content_type)
            if raw_text:
                return raw_text
        except Exception:
            pass

        return f"### OCR Scan Result ({filename})\n\nUnable to extract clear text from image. Please ensure image is well-lit and legible."

ocr_service = OCRService()
