
from schemas.workflow_state import WorkflowState
from services.risk_assessment_agent import assess_risks


def risk_node(state: WorkflowState) -> dict:

    analysis = state.get("analysis")
    test_cases = state.get("test_cases")

    if analysis is None:
        raise ValueError(
            "Requirement analysis is missing."
        )

    if test_cases is None:
        raise ValueError(
            "Generated test cases are missing."
        )

    risk_assessment = assess_risks(
        analysis,
        test_cases
    )

    return {
        "risk_assessment": risk_assessment
    }
