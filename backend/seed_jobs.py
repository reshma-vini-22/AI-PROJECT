
from database import SessionLocal
from models import Job

demo_jobs = [
    {
        "title": "Junior Full Stack Developer",
        "company": "TechNova Demo",
        "description": (
            "Demo listing for a junior developer working with "
            "React, JavaScript, Python, and REST APIs."
        ),
        "required_skills": [
            "React", "JavaScript", "Python", "REST APIs"
        ],
        "nice_to_have_skills": ["Docker", "Git"],
        "experience_level": "Entry-level",
        "location": "Chennai, India",
        "salary_min": 400000,
        "salary_max": 600000,
        "currency": "INR",
        "job_type": "Full-time",
        "job_url": "https://example.com/demo-jobs/full-stack-001",
        "source": "Demo data",
        "is_active": True,
    },
    {
        "title": "Python Backend Developer",
        "company": "CloudBridge Demo",
        "description": (
            "Demo listing for building Python APIs and "
            "database-backed applications."
        ),
        "required_skills": [
            "Python", "FastAPI", "SQL", "REST APIs"
        ],
        "nice_to_have_skills": ["Docker", "AWS"],
        "experience_level": "Entry-level",
        "location": "Bengaluru, India",
        "salary_min": 500000,
        "salary_max": 800000,
        "currency": "INR",
        "job_type": "Full-time",
        "job_url": "https://example.com/demo-jobs/python-backend-002",
        "source": "Demo data",
        "is_active": True,
    },
    {
        "title": "Frontend Developer Intern",
        "company": "PixelWorks Demo",
        "description": (
            "Demo listing for building responsive interfaces "
            "with HTML, CSS, JavaScript, and React."
        ),
        "required_skills": [
            "HTML", "CSS", "JavaScript", "React"
        ],
        "nice_to_have_skills": ["TypeScript", "Testing"],
        "experience_level": "Internship",
        "location": "Remote, India",
        "salary_min": 15000,
        "salary_max": 15000,
        "currency": "INR",
        "job_type": "Internship",
        "job_url": "https://example.com/demo-jobs/frontend-intern-003",
        "source": "Demo data",
        "is_active": True,
    },
    {
        "title": "Java Software Engineer",
        "company": "DataSpring Demo",
        "description": (
            "Demo listing for developing Java applications "
            "and working with SQL databases."
        ),
        "required_skills": [
            "Java", "SQL", "Git", "Spring Boot"
        ],
        "nice_to_have_skills": ["REST APIs", "Microservices"],
        "experience_level": "Entry-level",
        "location": "Hyderabad, India",
        "salary_min": 600000,
        "salary_max": 900000,
        "currency": "INR",
        "job_type": "Full-time",
        "job_url": "https://example.com/demo-jobs/java-engineer-004",
        "source": "Demo data",
        "is_active": True,
    },
]


def seed_jobs():
    db = SessionLocal()

    try:
        inserted = 0
        skipped = 0

        for job_data in demo_jobs:
            existing_job = (
                db.query(Job)
                .filter(Job.job_url == job_data["job_url"])
                .first()
            )

            if existing_job:
                skipped += 1
                continue

            db.add(Job(**job_data))
            inserted += 1

        db.commit()

        print(f"Inserted jobs: {inserted}")
        print(f"Skipped existing jobs: {skipped}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_jobs()
