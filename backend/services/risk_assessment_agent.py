
from google.genai import types

from schemas.requirement import RequirementAnalysis
from schemas.test_case import TestCaseGenerationResponse
from schemas.risk import RiskAssessmentResponse
from services.ai_requirement_analyzer import client


def assess_risks(
    analysis: RequirementAnalysis,
    test_cases: TestCaseGenerationResponse
) -> RiskAssessmentResponse:

    prompt = f"""
    You are a senior Software Quality and Risk Assessment Engineer.

    Assess the risks associated with this software requirement.

    REQUIREMENT ANALYSIS:
    {analysis.model_dump_json(indent=2)}

    GENERATED TEST CASES:
    {test_cases.model_dump_json(indent=2)}

    Identify:
    1. Security risks.
    2. Functional risks.
    3. Performance risks.
    4. Reliability risks.
    5. Data integrity risks.
    6. Testing coverage gaps.

    For every risk provide:
    - Unique risk ID (RISK001, RISK002, etc.)
    - Title
    - Description
    - Category
    - Likelihood (High, Medium, Low)
    - Impact (High, Medium, Low)
    - Severity (Critical, High, Medium, Low)
    - Mitigation strategy
    - Related test case IDs

    Also provide:
    - Overall risk level
    - Total number of risks
    - Coverage gaps

    Do not invent unsupported requirements.
    Do not claim a risk is covered unless a relevant test case exists.
    Return structured JSON only.
    """

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RiskAssessmentResponse,
            temperature=0.2
        )
    )

    result = RiskAssessmentResponse.model_validate_json(
        response.text
    )

    # Collect valid test case IDs
    valid_test_case_ids = {
        test_case.test_case_id
        for test_case in test_cases.test_cases
    }

    # Validate risk-to-test-case references
    for risk in result.risks:

        invalid_ids = [
            test_id
            for test_id in risk.related_test_cases
            if test_id not in valid_test_case_ids
        ]

        risk.related_test_cases = [
            test_id
            for test_id in risk.related_test_cases
            if test_id in valid_test_case_ids
        ]

        if invalid_ids:
            result.coverage_gaps.append(
                f"{risk.risk_id} referenced non-existent test cases: "
                f"{', '.join(invalid_ids)}"
            )

    # Keep the risk count accurate
    result.total_risks = len(result.risks)

    return result
