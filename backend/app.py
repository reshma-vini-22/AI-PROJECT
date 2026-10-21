

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routes.auth import router as auth_router
from routes.resume import router as resumes_router
from routes.jobs import router as jobs_router

import models  # Ensures models are registered before table creation

init_db()

app = FastAPI(
    title="AI Resume Analyzer & Job Matcher",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(resumes_router)
app.include_router(jobs_router)

@app.get("/")
def home():
    return {
        "message": "AI Resume Analyzer Backend is running!",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
