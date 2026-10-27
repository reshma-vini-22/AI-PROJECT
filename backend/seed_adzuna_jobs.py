
from database import SessionLocal
from utils.job_service import fetch_adzuna_jobs, save_adzuna_jobs


def main():
    db = SessionLocal()

    try:
        print("Fetching real job listings from Adzuna...")

        jobs = fetch_adzuna_jobs(
            keywords="software developer",
            location="India",
            results_per_page=5,
        )

        print(f"Adzuna returned {len(jobs)} jobs.")

        if not jobs:
            print("No jobs returned. Nothing was saved.")
            return

        saved_count = save_adzuna_jobs(db, jobs)

        print(f"New jobs saved to PostgreSQL: {saved_count}")
        print("Job sync completed.")

    except Exception as error:
        db.rollback()
        print(f"Job sync failed: {error}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
