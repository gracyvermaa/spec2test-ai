
from services.requirement_analyzer import analyze_requirement
from fastapi import FastAPI
from schemas.requirement import (
    RequirementRequest,
    RequirementAnalysis
)

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

    return analyze_requirement(
        request.title,
        request.description
    )
