import os
import uuid

from fastapi import HTTPException, UploadFile
from pypdf import PdfReader
from core.constants import ALLOWED_EXTENSIONS, MAX_FILE_SIZE, MAX_PAGES


async def extract_pdf_text(file: UploadFile) -> str:
    """
    Validate uploaded PDF and return extracted text.
    """

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    os.makedirs("uploads", exist_ok=True)

    temp_filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join("uploads", temp_filename)

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 10 MB limit")

    with open(filepath, "wb") as f:
        f.write(content)

    try:
        try:
            reader = PdfReader(filepath)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid or corrupted PDF")

        if len(reader.pages) > MAX_PAGES:
            raise HTTPException(status_code=400, detail="PDF exceeds page limit")

        extracted_text = ""

        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                extracted_text += page_text
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    return extracted_text
