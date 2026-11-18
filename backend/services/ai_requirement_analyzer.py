
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

from schemas.requirement import RequirementAnalysis

# Load API key from backend/.env
load_dotenv(
    os.path.join(os.path.dirname(__file__), "..", ".env")
)

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing from backend/.env")

client = genai.Client(api_key=api_key)


def analyze_requirement_with_ai(title: str, description: str):

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

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RequirementAnalysis,
            temperature=0.2
        )
    )

    return RequirementAnalysis.model_validate_json(response.text)
