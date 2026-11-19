from pydantic import BaseModel

from schemas.requirement import RequirementAnalysis
from schemas.test_case import TestCaseGenerationResponse
from schemas.risk import RiskAssessmentResponse


class WorkflowResponse(BaseModel):
    analysis: RequirementAnalysis
    test_cases: TestCaseGenerationResponse
    risk_assessment: RiskAssessmentResponse