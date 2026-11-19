
from fastapi import FastAPI, HTTPException

from schemas.requirement import (
    RequirementRequest,
    RequirementAnalysis
)
from schemas.test_case import TestCaseGenerationResponse
from schemas.risk import RiskAssessmentResponse
from schemas.workflow_response import WorkflowResponse

from services.ai_requirement_analyzer import analyze_requirement_with_ai
from services.test_case_generator import generate_test_cases
from services.risk_assessment_agent import assess_risks

from workflows.graph import spec2test_workflow


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


@app.post(
    "/workflow/run",
    response_model=WorkflowResponse
)
def run_workflow_api(request: RequirementRequest):
    try:
        initial_state = {
            "title": request.title,
            "description": request.description,
            "analysis": None,
            "test_cases": None,
            "risk_assessment": None,
            "error": None
        }

        result = spec2test_workflow.invoke(initial_state)

        return {
            "analysis": result["analysis"],
            "test_cases": result["test_cases"],
            "risk_assessment": result["risk_assessment"]
        }

    except Exception as e:
        print("WORKFLOW ERROR:", repr(e))
        raise HTTPException(
            status_code=502,
            detail=str(e)
        )
