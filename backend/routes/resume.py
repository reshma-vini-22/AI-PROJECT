
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Resume
from utils.auth_utils import get_current_user
from utils.resume_parser import extract_resume_text


router = APIRouter(
    prefix="/api/resumes",
    tags=["Resumes"]
)


UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    allowed_extensions = [".pdf", ".docx"]

    file_extension = Path(file.filename).suffix.lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed"
        )

    max_file_size = 5 * 1024 * 1024

    file_content = await file.read()

    if len(file_content) > max_file_size:
        raise HTTPException(
            status_code=400,
            detail="File size must not exceed 5 MB"
        )

    unique_filename = f"{uuid.uuid4()}{file_extension}"

    file_path = UPLOAD_DIR / unique_filename

    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    try:
        extracted_text = extract_resume_text(str(file_path))

    except Exception as error:
        file_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=400,
            detail=f"Could not extract resume text: {str(error)}"
        )

    new_resume = Resume(
    user_id=current_user.id,
    filename=file.filename,
    file_path=str(file_path),
    summary=extracted_text
    )

    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return {
        "message": "Resume uploaded and text extracted successfully",
        "resume_id": new_resume.id,
        "filename": new_resume.filename,
        "user_id": new_resume.user_id,
        "text_length": len(extracted_text),
        "text_preview": extracted_text[:300]
    }

@router.get("/my-resumes")
def get_my_resumes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .all()
    )

    return {
        "message": "Resumes retrieved successfully",
        "total_resumes": len(resumes),
        "resumes": [
            {
                "id": resume.id,
                "filename": resume.filename,
                "uploaded_at": resume.uploaded_at,
                "text_length": len(resume.summary or "")
            }
            for resume in resumes
        ]
    }
