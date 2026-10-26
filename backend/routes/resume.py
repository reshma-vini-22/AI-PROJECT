
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Resume,ResumeAnalysis
from utils.auth_utils import get_current_user
from services.resume_analyzer import analyze_resume
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
@router.get("/{resume_id}")
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    return {
        "id": resume.id,
        "filename": resume.filename,
        "uploaded_at": resume.uploaded_at,
        "text": resume.summary or "",
        "text_length": len(resume.summary or ""),
        "skills": resume.skills or [],
        "experience": resume.experience or [],
        "education": resume.education or [],
        "certifications": resume.certifications or [],
        "languages": resume.languages or []
    }

@router.post("/{resume_id}/analyze")
def analyze_resume_endpoint(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Find the resume belonging to the logged-in user
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    # Make sure the resume contains extracted text
    if not resume.summary:
        raise HTTPException(
            status_code=400,
            detail="No resume text available for analysis"
        )

    # Check whether this resume has already been analyzed
    existing_analysis = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.resume_id == resume.id)
        .first()
    )

    # Analyze the resume text
    analysis_result = analyze_resume(resume.summary)

    if existing_analysis:
        # Update the existing analysis
        existing_analysis.score = analysis_result["score"]
        existing_analysis.skills = analysis_result["skills"]
        existing_analysis.education = analysis_result["education"]
        existing_analysis.experience = analysis_result["experience"]
        existing_analysis.strengths = analysis_result["strengths"]
        existing_analysis.weaknesses = analysis_result["weaknesses"]
        existing_analysis.suggestions = analysis_result["suggestions"]

        analysis = existing_analysis

    else:
        # Create a new analysis
        analysis = ResumeAnalysis(
            resume_id=resume.id,
            score=analysis_result["score"],
            skills=analysis_result["skills"],
            education=analysis_result["education"],
            experience=analysis_result["experience"],
            strengths=analysis_result["strengths"],
            weaknesses=analysis_result["weaknesses"],
            suggestions=analysis_result["suggestions"]
        )

        db.add(analysis)

    db.commit()
    db.refresh(analysis)

    return {
        "message": "Resume analyzed successfully",
        "resume_id": resume.id,
        "analysis": {
            "id": analysis.id,
            "score": analysis.score,
            "skills": analysis.skills or [],
            "education": analysis.education or [],
            "experience": analysis.experience or [],
            "projects": analysis_result["projects"],
            "strengths": analysis.strengths or [],
            "weaknesses": analysis.weaknesses or [],
            "suggestions": analysis.suggestions or [],
            "analyzed_at": analysis.analyzed_at
        }
    }
@router.delete("/{resume_id}", status_code=204)
def delete_resume(resume_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
