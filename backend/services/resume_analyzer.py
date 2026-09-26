import re


# Skills are stored using one canonical name.
# This prevents React + React.js from being counted twice.
SKILL_ALIASES = {
    "python": ["python"],
    "java": ["java"],
    "javascript": ["javascript"],
    "typescript": ["typescript"],
    "react": ["react", "react.js"],
    "node.js": ["node.js", "nodejs"],
    "express.js": ["express", "express.js"],
    "fastapi": ["fastapi"],
    "django": ["django"],
    "sql": ["sql"],
    "mysql": ["mysql"],
    "postgresql": ["postgresql", "postgres"],
    "mongodb": ["mongodb"],
    "html": ["html"],
    "css": ["css"],
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


def extract_education(text: str) -> list:
    """
    Find actual education-related lines from the resume.

    Avoids treating profile summaries that merely mention
    Computer Science as education.
    """

    education = []

    lines = text.splitlines()

    education_keywords = [
        "b.tech",
        "b.e",
        "b.sc",
        "bca",
        "m.tech",
        "m.e",
        "m.sc",
        "mca",
        "phd",
        "bachelor",
        "master",
        "degree",
        "university",
        "college",
    ]

    for line in lines:
        cleaned_line = line.strip()

        if not cleaned_line:
            continue

        line_lower = cleaned_line.lower()

        # Check for a clear education keyword.
        has_education_keyword = any(
            keyword in line_lower
            for keyword in education_keywords
        )

        # Check for an education year range such as 2023 - Present.
        has_year_range = (
            ("20" in line_lower and "-" in line_lower)
            or "present" in line_lower
        )

        # Keep the line only when it looks like an actual
        # education entry.
        if has_education_keyword and has_year_range:
            if cleaned_line not in education:
                education.append(cleaned_line)

    return education[:10]

def extract_experience(text: str) -> list:
    """
    Find job/internship experience entries from the resume.

    Only role/company entries are returned.
    Detailed responsibility/project lines are not returned
    as separate experience entries.
    """

    experience = []

    lines = text.splitlines()

    ignored_headings = {
        "experience",
        "work experience",
        "professional experience",
        "projects",
        "project",
        "education",
        "skills",
        "technical skills",
        "certifications",
        "languages",
    }

    role_keywords = [
        "intern",
        "internship",
        "developer",
        "engineer",
        "software developer",
        "frontend developer",
        "backend developer",
        "full stack developer",
        "software engineer",
    ]

    description_keywords = [
        "built",
        "developed",
        "designed",
        "implemented",
        "created",
        "worked",
        "using",
        "responsible",
        "developing",
    ]

    education_keywords = [
        "b.e",
        "b.tech",
        "bachelor",
        "degree",
        "college",
        "university",
        "education",
    ]

    profile_keywords = [
        "undergraduate",
        "career objective",
        "objective",
        "seeking",
        "role to build",
    ]

    for line in lines:
        cleaned_line = line.strip()

        if not cleaned_line:
            continue

        line_lower = cleaned_line.lower()

        # Ignore section headings.
        if line_lower in ignored_headings:
            continue

        # Ignore education lines.
        if any(keyword in line_lower for keyword in education_keywords):
            continue

        # Ignore profile/objective statements.
        if any(keyword in line_lower for keyword in profile_keywords):
            continue

        # Ignore detailed responsibility/project descriptions.
        if any(keyword in line_lower for keyword in description_keywords):
            continue

        # Keep lines that look like actual job/role entries.
        if any(keyword in line_lower for keyword in role_keywords):
            if cleaned_line not in experience:
                experience.append(cleaned_line)

    return experience             

def extract_projects(text: str) -> list:
    """
    Find project-related lines from the resume.

    Detailed project descriptions are returned here instead of
    being treated as separate work experience entries.
    """

    projects = []

    lines = text.splitlines()

    project_keywords = [
        "built",
        "developed",
        "designed",
        "implemented",
        "created",
        "developed a",
        "built a",
        "designed a",
        "implemented a",
    ]

    education_keywords = [
        "b.e",
        "b.tech",
        "bachelor",
        "degree",
        "college",
        "university",
    ]

    profile_keywords = [
        "undergraduate",
        "career objective",
        "objective",
        "seeking",
    ]

    for line in lines:
        cleaned_line = line.strip()

        if not cleaned_line:
            continue

        line_lower = cleaned_line.lower()

        # Ignore education lines.
        if any(keyword in line_lower for keyword in education_keywords):
            continue

        # Ignore profile/objective lines.
        if any(keyword in line_lower for keyword in profile_keywords):
            continue

        # Find project/action descriptions.
        if any(keyword in line_lower for keyword in project_keywords):
            if cleaned_line not in projects:
                projects.append(cleaned_line)

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