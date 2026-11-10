import re


# Skills are stored using one canonical name.
# This prevents React + React.js from being counted twice.

def clean_resume_text(text):
    """Remove resume-template tips and common page markers."""
    cleaned_lines = []

    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue

        # Ignore instructional text from resume templates.
        if re.match(r"^\(?\s*tip\s*:", line, re.IGNORECASE):
            continue

        # Ignore page-number-only lines.
        if re.match(r"^page\s+\d+\s*$", line, re.IGNORECASE):
            continue

        cleaned_lines.append(line)

    return "\n".join(cleaned_lines)

SKILL_ALIASES = {
    "python": ["python"],
    "java": ["java"],
    "javascript": ["javascript"],
    "typescript": ["typescript"],
    "react": ["react", "react.js","reactjs"],
    "node.js": ["node.js", "nodejs","node"],
    "express.js": ["express", "express.js","epressjs"],
    "fastapi": ["fastapi"],
    "django": ["django"],
    "sql": ["sql"],
    "mysql": ["mysql"],
    "postgresql": ["postgresql", "postgres"],
    "mongodb": ["mongodb"],
    "html": ["html","html5"],
    "css": ["css","css3"],
    "tailwind": ["tailwind", "tailwind css"],
    "git": ["git"],
    "github": ["github"],
    "docker": ["docker"],
    "aws": ["aws"],
    "c": ["c programming"],
    "c++": ["c++"],
    "c#": ["c#"],
    "spring boot": ["spring boot"],
    "machine learning": ["machine learning"],
    "data science": ["data science"],
    "figma": ["figma"],
    "ui/ux": ["ui/ux", "ui ux"],
    "rest api": ["rest api", "rest apis", "restful api", "restful apis"],
    "api development": ["api development"],
    "dotnet": [".net", "dotnet"],
    "visual basic": ["visual basic", "vb.net"],
    "oracle": ["oracle"],
    "autosar": ["autosar"],
    "software testing": ["software testing", "test automation"],
    
    # Soft skills
    "communication": [
        "communication", "communication skills", "verbal communication",
        "written communication", "interpersonal communication"
    ],
    "teamwork": [
        "teamwork", "team work", "team player", "collaborative",
        "collaboration", "working as part of a team"
    ],
    "leadership": [
        "leadership", "leadership skills", "led a team",
        "team leadership"
    ],
    "problem-solving": [
        "problem-solving", "problem solving", "troubleshooting"
    ],
    "critical thinking": ["critical thinking"],
    "time management": ["time management", "managing time"],
    "organization": ["organization", "organisation", "organizational skills",
                     "organisational skills"],
    "adaptability": ["adaptability", "adaptable", "flexibility"],
    "creativity": ["creativity", "creative thinking"],
    "attention to detail": ["attention to detail", "detail-oriented"],
    "decision-making": ["decision-making", "decision making"],
    "conflict resolution": ["conflict resolution", "resolving conflicts"],
    "responsibility": ["responsibility", "taking responsibility",
                       "accountability"],
    "self-motivation": ["self-motivated", "self motivation",
                        "self-motivation"],
    "customer service": ["customer service", "customer service skills"],
    "numeracy": ["numeracy", "numeracy skills"],
    "cash handling": ["cash handling", "handling cash"],
    "coaching": ["coaching", "coached a team"],
    "mentoring": ["mentoring", "mentored"],
    "public speaking": ["public speaking", "presentation skills"],
    "negotiation": ["negotiation", "negotiation skills"],
    "confidentiality": ["confidentiality", "handling confidential information"],
    "research": ["research", "research skills"],
    "analytical skills": ["analytical skills", "analysis"],
}


def contains_skill(text: str, term: str) -> bool:
    """
    Check whether a skill appears as a separate term.

    Word boundaries prevent short skills such as 'c'
    from matching inside unrelated words.
    """

    pattern = rf"(?<![a-zA-Z0-9+#]){re.escape(term.lower())}(?![a-zA-Z0-9+#])"

    return re.search(pattern, text.lower()) is not None


def extract_skills(text: str) -> list:
    """
    Find technical skills mentioned in the resume.

    Each skill is returned only once using its canonical name.
    """

    found_skills = []

    for skill, aliases in SKILL_ALIASES.items():
        for alias in aliases:
            if contains_skill(text, alias):
                found_skills.append(skill)
                break

    return found_skills



def extract_education(text):
    lines = text.splitlines()
    education = []
    current_section = False

    education_headings = {
        "education", "educational qualifications",
        "academic background", "academic qualifications"
    }

    other_headings = {
        "experience", "work experience", "professional experience",
        "employment", "projects", "personal projects",
        "skills", "technical skills", "certifications",
        "achievements", "awards", "summary", "profile",
        "objective", "contact", "interests", "references"
    }

    degree_pattern = re.compile(
        r"\b(b\.?\s?tech|b\.?\s?e\.?|m\.?\s?tech|m\.?\s?e\.?|"
        r"bca|mca|bsc|m\.?\s?sc|bcom|mcom|bba|mba|"
        r"bachelor(?:'s)?|master(?:'s)?|ph\.?d\.?|diploma|"
        r"degree|high school|higher secondary|12th|10th|sslc|hsc)\b",
        re.IGNORECASE
    )

    for line in lines:
        line = line.strip()
        if not line:
            continue

        heading = line.lower().rstrip(":").strip()

        if heading in education_headings:
            current_section = True
            continue

        if heading in other_headings:
            current_section = False
            continue

        if current_section:
            if line not in education:
                education.append(line)
        elif degree_pattern.search(line):
            if line not in education:
                education.append(line)

    return education



def extract_experience(text):
    lines = text.splitlines()
    experience = []
    current_section = False

    experience_headings = {
        "experience", "work experience", "professional experience",
        "employment history", "work history", "internship",
        "internships", "industrial experience"
    }

    other_headings = {
        "education", "educational qualifications",
        "academic background", "academic qualifications",
        "projects", "personal projects", "academic projects",
        "skills", "technical skills", "certifications",
        "achievements", "awards", "summary", "profile",
        "objective", "contact", "interests", "references"
    }

    role_pattern = re.compile(
        r"\b(software engineer|software developer|web developer|"
        r"frontend developer|front-end developer|backend developer|"
        r"back-end developer|full stack developer|full-stack developer|"
        r"python developer|java developer|data analyst|data scientist|"
        r"machine learning engineer|devops engineer|qa engineer|"
        r"test engineer|intern|trainee|engineer|developer|analyst|"
        r"designer|consultant|manager|administrator|programmer)\b",
        re.IGNORECASE
    )

    for line in lines:
        line = line.strip()
        if not line:
            continue

        heading = line.lower().rstrip(":").strip()

        if heading in experience_headings:
            current_section = True
            continue

        if heading in other_headings:
            current_section = False
            continue

        if current_section:
            if line not in experience:
                experience.append(line)
        elif role_pattern.search(line):
            if line not in experience:
                experience.append(line)

    return experience


def extract_projects(text):
    lines = text.splitlines()
    projects = []
    current_section = ""
    current_project_lines = []

    project_sections = {
        "project", "projects", "academic projects",
        "personal projects", "key projects", "selected projects"
    }

    other_sections = {
        "education", "experience", "work experience",
        "professional experience", "employment",
        "skills", "technical skills", "certifications",
        "achievements", "awards", "summary", "profile",
        "objective", "contact", "interests", "references"
    }

    def normalize_heading(line):
        return line.strip().lower().rstrip(":").strip()

    def save_project():
        if not current_project_lines:
            return

        content = " ".join(current_project_lines).strip()
        if content and content not in projects:
            projects.append(content)

    for line in lines:
        line = line.strip()

        if not line:
            continue

        heading = normalize_heading(line)

        # Detect section headings.
        if heading in project_sections:
            save_project()
            current_project_lines = []
            current_section = "projects"
            continue

        if heading in other_sections:
            save_project()
            current_project_lines = []
            current_section = heading
            continue

        # In a dedicated Projects section, collect project names
        # and descriptions until another section begins.
        if current_section == "projects":
            # Ignore standalone links.
            if re.match(r"^(https?://|www\.)", line, re.IGNORECASE):
                continue

            # Ignore bullets that contain only a link.
            if re.match(r"^[-*•]\s*(https?://|www\.)", line, re.IGNORECASE):
                continue

            current_project_lines.append(line)

        # Also detect explicitly named projects in other sections.
        elif current_section in {
            "education", "experience", "work experience",
            "professional experience", "employment"
        }:
            if re.search(r"\b(project|capstone project|academic project)\b",
                         line, re.IGNORECASE):
                projects.append(line)

    save_project()

    return projects


def calculate_score(
    skills: list,
    education: list,
    experience: list,
    text: str
) -> int:
    """
    Calculate a basic resume score out of 100.

    Skills      -> 25 points
    Education   -> 15 points
    Experience  -> 25 points
    Projects    -> 20 points
    Content     -> 15 points
    """
    skills = skills or []
    education = education or []
    experience = experience or []
    text = text or ""
    score = 0
    text_lower = text.lower()
    word_count = len(text.split())

    # -------------------------
    # Skills: maximum 25 points
    # -------------------------

    if len(skills) >= 12:
        score += 25
    elif len(skills) >= 9:
        score += 22
    elif len(skills) >= 6:
        score += 18
    elif len(skills) >= 3:
        score += 12
    elif len(skills) >= 1:
        score += 6

    # -----------------------------
    # Education: maximum 15 points
    # -----------------------------

    if len(education) >= 2:
        score += 15
    elif len(education) == 1:
        score += 12

    # ------------------------------
    # Experience: maximum 25 points
    # ------------------------------

    if len(experience) >= 7:
        score += 25
    elif len(experience) >= 5:
        score += 22
    elif len(experience) >= 3:
        score += 18
    elif len(experience) >= 1:
        score += 12

    # ----------------------------
    # Projects: maximum 20 points
    # ----------------------------

    project_keywords = [
        "project",
        "projects",
        "built",
        "developed",
        "designed",
        "implemented",
        "application",
        "app"
    ]

    project_keyword_count = sum(
        1
        for keyword in project_keywords
        if keyword in text_lower
    )

    if project_keyword_count >= 6:
        score += 20
    elif project_keyword_count >= 4:
        score += 16
    elif project_keyword_count >= 2:
        score += 12
    elif project_keyword_count >= 1:
        score += 6

    # ----------------------------
    # Content: maximum 15 points
    # ----------------------------

    if word_count >= 600:
        score += 15
    elif word_count >= 450:
        score += 13
    elif word_count >= 300:
        score += 10
    elif word_count >= 150:
        score += 6
    elif word_count >= 75:
        score += 3

    return min(score, 100)


def generate_strengths(
    skills: list,
    education: list,
    experience: list
) -> list:

    strengths = []

    if len(skills) >= 5:
        strengths.append("Good technical skill coverage")
    elif skills:
        strengths.append("Technical skills are included")

    if education:
        strengths.append("Education information is included")

    if experience:
        strengths.append("Experience or project information is included")

    if not strengths:
        strengths.append("Resume contains basic professional information")

    return strengths


def generate_weaknesses(
    skills: list,
    education: list,
    experience: list,
    text: str
) -> list:

    weaknesses = []

    if len(skills) < 5:
        weaknesses.append(
            "Technical skills could be expanded"
        )

    if not education:
        weaknesses.append(
            "Education details were not clearly detected"
        )

    if not experience:
        weaknesses.append(
            "Experience or project details were not clearly detected"
        )

    if len(text.split()) < 150:
        weaknesses.append(
            "Resume content appears too short"
        )

    if not weaknesses:
        weaknesses.append(
            "No major weaknesses detected by the basic analyzer"
        )

    return weaknesses


def generate_suggestions(
    skills: list,
    education: list,
    experience: list,
    text: str
) -> list:

    suggestions = []

    if len(skills) < 5:
        suggestions.append(
            "Add more relevant technical skills that match your target roles."
        )

    if not experience:
        suggestions.append(
            "Add internship, project, or work experience with measurable results."
        )

    if not education:
        suggestions.append(
            "Clearly mention your degree, college, and graduation details."
        )

    if len(text.split()) < 150:
        suggestions.append(
            "Add more details about projects, achievements, and responsibilities."
        )

    if not suggestions:
        suggestions.append(
            "Continue tailoring the resume to each job description."
        )

    return suggestions


def analyze_resume(text: str) -> dict:
    text = clean_resume_text(text)
    """
    Analyze the complete resume and return structured results.
    """

    if not text or not text.strip():
        raise ValueError("Resume text is empty")

    skills = extract_skills(text)
    education = extract_education(text)
    experience = extract_experience(text)
    projects = extract_projects(text)
    

    score = calculate_score(
        skills,
        education,
        experience,
        text
    )

    strengths = generate_strengths(
        skills,
        education,
        experience
    )

    weaknesses = generate_weaknesses(
        skills,
        education,
        experience,
        text
    )

    suggestions = generate_suggestions(
        skills,
        education,
        experience,
        text
    )

    return {
        "score": score,
        "skills": skills,
        "education": education,
        "experience": experience,
        "projects": projects,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions,
    }

