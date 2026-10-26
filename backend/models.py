from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Float,
    Boolean,
    ForeignKey,
    JSON
)
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import ARRAY


Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)

    full_name = Column(String(255))
    email = Column(String(100))
    phone = Column(String(20))
    summary = Column(Text)

    skills = Column(ARRAY(String), default=list)
    experience = Column(JSON, default=list)
    education = Column(JSON, default=list)

    certifications = Column(ARRAY(String), default=list)
    languages = Column(ARRAY(String), default=list)

    uploaded_at = Column(DateTime, default=datetime.utcnow)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    required_skills = Column(ARRAY(String), default=list)
    nice_to_have_skills = Column(ARRAY(String), default=list)

    experience_level = Column(String(50))
    location = Column(String(255))

    salary_min = Column(Float)
    salary_max = Column(Float)

    currency = Column(String(10), default="USD")
    job_type = Column(String(50))

    company_url = Column(String(500))
    job_url = Column(String(500), unique=True, nullable=False)

    source = Column(String(100))
    external_id = Column(String(100), unique=True, index=True, nullable=True)

    posted_at = Column(DateTime, nullable=True)

    first_seen_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id"),
        nullable=False
    )

    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
        nullable=False
    )

    match_score = Column(Integer)
    skill_match_score = Column(Integer)
    experience_match_score = Column(Integer)
    education_match_score = Column(Integer)

    matched_skills = Column(ARRAY(String), default=list)
    missing_skills = Column(ARRAY(String), default=list)
    additional_skills = Column(ARRAY(String), default=list)

    suggestions = Column(JSON, default=list)
    ai_analysis = Column(Text)

    is_saved = Column(Boolean, default=False)
    is_applied = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id"),
        nullable=False,
        unique=True
    )

    score = Column(Integer, nullable=True)

    skills = Column(ARRAY(String), default=list)
    experience = Column(JSON, default=list)
    education = Column(JSON, default=list)

    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)

    analyzed_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# Relationships

User.resumes = relationship(
    "Resume",
    back_populates="user",
    cascade="all, delete-orphan"
)

Resume.user = relationship(
    "User",
    back_populates="resumes"
)

Resume.analysis = relationship(
    "ResumeAnalysis",
    back_populates="resume",
    uselist=False,
    cascade="all, delete-orphan"
)

ResumeAnalysis.resume = relationship(
    "Resume",
    back_populates="analysis"
)

Resume.matches = relationship(
    "JobMatch",
    back_populates="resume",
    cascade="all, delete-orphan"
)

Job.matches = relationship(
    "JobMatch",
    back_populates="job",
    cascade="all, delete-orphan"
)

JobMatch.resume = relationship(
    "Resume",
    back_populates="matches"
)

JobMatch.job = relationship(
    "Job",
    back_populates="matches"
)