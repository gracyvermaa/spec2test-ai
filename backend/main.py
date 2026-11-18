
from fastapi import FastAPI, HTTPException

from schemas.requirement import (
    RequirementRequest,
    RequirementAnalysis
)

from services.ai_requirement_analyzer import analyze_requirement_with_ai


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
