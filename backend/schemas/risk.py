
from pydantic import BaseModel, Field


class Risk(BaseModel):
    risk_id: str
    title: str
    description: str
    category: str
    likelihood: str
    impact: str
    severity: str
    mitigation: str
    related_test_cases: list[str] = Field(default_factory=list)


class RiskAssessmentResponse(BaseModel):
    requirement_title: str
    overall_risk_level: str
    total_risks: int
    risks: list[Risk]
    coverage_gaps: list[str] = Field(default_factory=list)
