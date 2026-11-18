
from pydantic import BaseModel, Field


class RequirementRequest(BaseModel):
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=10)


class RequirementAnalysis(BaseModel):
    title: str
    summary: str
    functional_requirements: list[str]
    missing_details: list[str]
