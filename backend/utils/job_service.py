
import os
import requests

from dotenv import load_dotenv
from datetime import datetime
from sqlalchemy.orm import Session
from services.resume_analyzer import extract_skills

from models import Job

load_dotenv()


def fetch_adzuna_jobs(
    keywords="software developer",
    location="India",
    results_per_page=10,
):
    app_id = os.getenv("ADZUNA_APP_ID")
    app_key = os.getenv("ADZUNA_APP_KEY")

    if not app_id or not app_key:
        raise ValueError(
            "Adzuna credentials are missing from the backend .env file."
        )

    url = "https://api.adzuna.com/v1/api/jobs/in/search/1"

    params = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": min(results_per_page, 10),
        "what": keywords,
        "where": location,
        "content-type": "application/json",
    }

    response = requests.get(url, params=params, timeout=15)
    response.raise_for_status()

    data = response.json()
    return data.get("results", [])

def save_adzuna_jobs(db: Session, jobs: list) -> int:
    """Save new Adzuna listings and update existing ones."""
    saved_count = 0

    for item in jobs:
        external_id = str(item.get("id") or item.get("adref") or "").strip()
        job_url = item.get("redirect_url")

        if not external_id or not job_url:
            continue

        company_data = item.get("company") or {}
        location_data = item.get("location") or {}

        company_name = (
            company_data.get("display_name")
            or "Company not specified"
        )

        location_name = (
            location_data.get("display_name")
            or "Location not specified"
        )

        description = item.get("description") or ""
        detected_skills = extract_skills(description)
        title = item.get("title") or "Untitled job"

        existing = (
            db.query(Job)
            .filter(Job.external_id == external_id)
            .first()
        )

        if not existing:
            existing = (
                db.query(Job)
                .filter(Job.job_url == job_url)
                .first()
            )

        if existing:
            existing.title = title
            existing.company = company_name
            existing.description = description
            existing.location = location_name
            existing.job_url = job_url
            existing.source = "Adzuna"
            existing.updated_at = datetime.utcnow()
            existing.is_active = True
            existing.required_skills = detected_skills
            existing.nice_to_have_skills = []
        else:
            new_job = Job(
                title=title,
                company=company_name,
                description=description,
                required_skills=detected_skills,
                nice_to_have_skills=[],
                location=location_name,
                job_type="Not specified",
                currency="INR",
                job_url=job_url,
                source="Adzuna",
                external_id=external_id,
                posted_at=None,
                first_seen_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                is_active=True,
            )
            db.add(new_job)
            saved_count += 1

    db.commit()
    return saved_count

