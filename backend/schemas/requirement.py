
from pydantic import BaseModel, Field


class RequirementRequest(BaseModel):
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=10)


class RequirementAnalysis(BaseModel):
    title: str
    summary: str
    functional_requirements: list[str]
    missing_details: list[str]
    ambiguous_requirements: list[str] = Field(default_factory=list)
    edge_cases: list[str] = Field(default_factory=list)
    potential_risks: list[str] = Field(default_factory=list)
