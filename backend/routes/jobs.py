
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Job, Resume, ResumeAnalysis
from utils.auth_utils import get_current_user
from datetime import datetime

router = APIRouter(
    prefix="/api/jobs",
    tags=["Jobs"]
)


def normalize_skill(skill):
    """Normalize skill names for case-insensitive comparison."""
    return " ".join(skill.strip().lower().split())


@router.get("/matches")
def get_job_matches(
    resume_id: int = Query(..., gt=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Retrieve only a resume belonging to the logged-in user.
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

    # Prefer skills extracted by the existing rule-based analyzer.
    analysis = (
    db.query(ResumeAnalysis)
    .filter(ResumeAnalysis.resume_id == resume.id)
    .order_by(
        ResumeAnalysis.analyzed_at.desc(),
        ResumeAnalysis.id.desc()
    )
    .first()
    )

    resume_skills = (
        analysis.skills if analysis and analysis.skills
        else resume.skills or []
    )

    # Retrieve active jobs from PostgreSQL.
    jobs = (
        db.query(Job)
        .filter(Job.is_active.is_(True))
        .order_by(Job.created_at.desc())
        .all()
    )

    results = []

    for job in jobs:
        required_skills = job.required_skills or []
        nice_to_have = job.nice_to_have_skills or []

        resume_skill_map = {
            normalize_skill(skill): skill
            for skill in resume_skills
            if isinstance(skill, str) and skill.strip()
        }

        required_map = {
            normalize_skill(skill): skill
            for skill in required_skills
            if isinstance(skill, str) and skill.strip()
        }

        optional_map = {
            normalize_skill(skill): skill
            for skill in nice_to_have
            if isinstance(skill, str) and skill.strip()
        }

        matched_required = [
            skill for key, skill in required_map.items()
            if key in resume_skill_map
        ]

        missing_skills = [
            skill for key, skill in required_map.items()
            if key not in resume_skill_map
        ]

        matched_optional = [
            skill for key, skill in optional_map.items()
            if key in resume_skill_map
        ]

        # Score required skills only, so the percentage is transparent.
        if required_map:
            match_score = round(
                len(matched_required) / len(required_map) * 100
            )
        else:
            # Avoid presenting an invented score when no requirements exist.
            match_score = None

        results.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "initials": "".join(
                word[0] for word in job.company.split() if word
            )[:2].upper(),
            "location": job.location or "Not specified",
            "type": job.job_type or "Not specified",
            "salary": (
                f"{job.currency or 'USD'} "
                f"{job.salary_min:,.0f}–{job.salary_max:,.0f}"
                if job.salary_min is not None
                and job.salary_max is not None
                else "Not specified"
            ),
            "match": match_score,
            "postedDaysAgo": (
                max(0, (datetime.utcnow().date() -
                    job.created_at.date()).days)
                if job.created_at else 0
           ),
            "matchedSkills": matched_required + matched_optional,
            "missingSkills": missing_skills,
            "description": job.description,
            "applyUrl": job.job_url,
            "source": job.source,
        })

    results.sort(
        key=lambda item: (
            item["match"] is None,
            -(item["match"] or 0)
        )
    )

    return {
        "message": "Job matches retrieved successfully",
        "resume_id": resume.id,
        "resume_skills": resume_skills,
        "total_jobs": len(results),
        "jobs": results
    }
