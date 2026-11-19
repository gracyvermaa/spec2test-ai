
from schemas.workflow_state import WorkflowState
from services.ai_requirement_analyzer import analyze_requirement_with_ai


def requirement_node(state: WorkflowState) -> dict:

    analysis = analyze_requirement_with_ai(
        state["title"],
        state["description"]
    )

    return {
        "analysis": analysis
    }
