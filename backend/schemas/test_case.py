
from pydantic import BaseModel, Field


class TestCase(BaseModel):
    test_case_id: str
    title: str
    description: str
    test_type: str
    preconditions: list[str] = Field(default_factory=list)
    test_steps: list[str] = Field(default_factory=list)
    test_data: list[str] = Field(default_factory=list)
    expected_result: str
    priority: str


class TestCaseGenerationResponse(BaseModel):
    requirement_title: str
    total_test_cases: int
    test_cases: list[TestCase]
