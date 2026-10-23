
import json
import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
MAX_RESUME_CHARS = 15000


def analyze_resume_with_ai(resume_text: str) -> dict:
    """Analyze resume text using Groq and return structured JSON."""

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set in .env")

    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text is empty")

    prompt = f"""
Analyze the following resume as an expert resume reviewer.

Return a valid JSON object with exactly these fields:
{{
  "score": 0,
  "skills": [],
  "education": [],
  "experience": [],
  "projects": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}}

Rules:
- score must be an integer from 0 to 100.
- All other fields must be arrays of strings.
- Base every item only on the supplied resume text.
- Do not invent qualifications, experience, or achievements.
- Provide practical suggestions for improvement.
- Return JSON only, without Markdown code fences.

RESUME:
{resume_text[:MAX_RESUME_CHARS]}
"""

    client = Groq(api_key=api_key)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a careful resume reviewer. "
                    "Return only valid JSON matching the requested structure."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_completion_tokens=2000,
        response_format={"type": "json_object"},
    )

    raw_response = (
        response.choices[0].message.content or ""
    ).strip()

    if not raw_response:
        raise ValueError("Groq returned an empty response")

    result = json.loads(raw_response)

    expected_fields = {
        "score",
        "skills",
        "education",
        "experience",
        "projects",
        "strengths",
        "weaknesses",
        "suggestions",
    }

    if not isinstance(result, dict) or not expected_fields.issubset(result):
        raise ValueError("Groq returned an unexpected response structure")

    if (
        not isinstance(result["score"], int)
        or isinstance(result["score"], bool)
        or not 0 <= result["score"] <= 100
    ):
        raise ValueError("Groq returned an invalid resume score")

    for field in expected_fields - {"score"}:
        if not isinstance(result[field], list) or not all(
            isinstance(item, str) for item in result[field]
        ):
            raise ValueError(f"Groq returned an invalid {field} field")

    return result
