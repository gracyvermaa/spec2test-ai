
from google.genai import types

from schemas.requirement import RequirementAnalysis
from schemas.test_case import TestCaseGenerationResponse
from services.ai_requirement_analyzer import client


def generate_test_cases(
    analysis: RequirementAnalysis
) -> TestCaseGenerationResponse:

    prompt = f"""
    You are an expert Software QA Test Engineer.

    Analyze this requirement:
    {analysis.model_dump_json(indent=2)}

    Generate at least 8 meaningful test cases covering:
    1. Positive testing
    2. Negative testing
    3. Boundary value testing
    4. Edge case testing
    5. Security testing

    Every test case must include:
    - Unique ID (TC001, TC002, etc.)
    - Title
    - Description
    - Test type
    - Preconditions
    - Test steps
    - Test data
    - Expected result
    - Priority (High, Medium, Low)

    Do not invent unsupported business rules.
    Return structured JSON only.
    """

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=TestCaseGenerationResponse,
            temperature=0.2
        )
    )

    return TestCaseGenerationResponse.model_validate_json(
        response.text
    )
