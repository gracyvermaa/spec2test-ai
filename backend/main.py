
from fastapi import FastAPI, HTTPException

from schemas.requirement import (
    RequirementRequest,
    RequirementAnalysis
)
from schemas.test_case import TestCaseGenerationResponse
from schemas.risk import RiskAssessmentResponse

from services.ai_requirement_analyzer import analyze_requirement_with_ai
from services.test_case_generator import generate_test_cases
from services.risk_assessment_agent import assess_risks


app = FastAPI(
    title="Spec2Test AI",
    description="AI-powered software testing assistant",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to Spec2Test AI!",
        "status": "Backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Spec2Test AI Backend"
    }


@app.post(
    "/requirements/analyze",
    response_model=RequirementAnalysis
)
def analyze_requirement_api(request: RequirementRequest):
    try:
        return analyze_requirement_with_ai(
            request.title,
            request.description
        )

    except Exception as e:
        print("GEMINI ERROR:", repr(e))
        raise HTTPException(
            status_code=502,
            detail=str(e)
        )


@app.post(
    "/test-cases/generate",
    response_model=TestCaseGenerationResponse
)
def generate_test_cases_api(request: RequirementRequest):
    try:
        analysis = analyze_requirement_with_ai(
            request.title,
            request.description
        )

        return generate_test_cases(analysis)

    except Exception as e:
        print("TEST CASE GENERATOR ERROR:", repr(e))
        raise HTTPException(
            status_code=502,
            detail=str(e)
        )


@app.post(
    "/risks/assess",
    response_model=RiskAssessmentResponse
)
def assess_risks_api(request: RequirementRequest):
    try:
        analysis = analyze_requirement_with_ai(
            request.title,
            request.description
        )

        test_cases = generate_test_cases(analysis)

        return assess_risks(
            analysis,
            test_cases
        )

    except Exception as e:
        print("RISK ASSESSMENT ERROR:", repr(e))
        raise HTTPException(
            status_code=502,
            detail=str(e)
        )
