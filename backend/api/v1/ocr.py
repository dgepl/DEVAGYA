from fastapi import APIRouter, UploadFile, File, HTTPException
from services.ocr_service import ocr_service

router = APIRouter(prefix="/ocr", tags=["OCR Scanner"])

@router.post("/scan")
async def scan_textbook_page(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    try:
        content = await file.read()
        extracted_text = await ocr_service.extract_text_from_bytes(
            content, 
            file.filename or "scanned_doc.jpg",
            file.content_type or ""
        )
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "extracted_text": extracted_text,
            "word_count": len(extracted_text.split()),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR scan failed: {str(e)}")
