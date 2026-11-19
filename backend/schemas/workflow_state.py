
from typing import TypedDict

from schemas.requirement import RequirementAnalysis
from schemas.test_case import TestCaseGenerationResponse
from schemas.risk import RiskAssessmentResponse


class WorkflowState(TypedDict):
    title: str
    description: str

    analysis: RequirementAnalysis | None
    test_cases: TestCaseGenerationResponse | None
    risk_assessment: RiskAssessmentResponse | None

    error: str | None
