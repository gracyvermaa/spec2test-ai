
import os

import config
from schemas.requirement import RequirementAnalysis
from services.mock_ai import mock_analyze_requirement

_client = None


def get_client():
    """Create the Gemini client on first use (live mode only)."""
    global _client

    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError(
                "AI_MODE=live requires GEMINI_API_KEY to be set."
            )

        from google import genai

        _client = genai.Client(api_key=api_key)

    return _client


def analyze_requirement_with_ai(title: str, description: str):

    if config.AI_MODE != "live":
        return mock_analyze_requirement(title, description)

    from google.genai import types

    prompt = f"""
    You are an expert software QA Requirement Analyst.

    Analyze the following software requirement.

    Title: {title}
    Description: {description}

    Identify:
    1. A clear summary.
    2. Functional requirements.
    3. Missing details.
    4. Ambiguous requirements.
    5. Possible edge cases.
    6. Potential testing risks.

    Do not invent requirements.
    If a category has no findings, return an empty list.
    Be specific and practical.
    """

    response = get_client().models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RequirementAnalysis,
            temperature=0.2
        )
    )

    return RequirementAnalysis.model_validate_json(response.text)
