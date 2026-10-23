
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Resume
from utils.ai_integration import analyze_resume_with_ai
from utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI Analyzer"])


@router.post("/analyze/{resume_id}")
def ai_analyze(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_text = resume.summary

    if not resume_text or not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No extracted resume text found. Please upload the resume again.",
        )

    try:
        result = analyze_resume_with_ai(resume_text)

    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Gemini returned an invalid JSON response. Please try again.",
        ) from exc

    except Exception as exc:
        # Keep internal API keys and provider error details out of the response.
        print(f"Gemini analysis failed: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Gemini analysis failed. Check the backend terminal and try again.",
        ) from exc

    return {
        "message": "AI resume analysis completed successfully",
        "source": "groq",
        "resume_id": resume.id,
        "analysis": result,
    }
