
from schemas.workflow_state import WorkflowState
from services.test_case_generator import generate_test_cases


def test_case_node(state: WorkflowState) -> dict:

    analysis = state.get("analysis")

    if analysis is None:
        raise ValueError(
            "Requirement analysis is missing from workflow state."
        )

    test_cases = generate_test_cases(analysis)

    return {
        "test_cases": test_cases
    }
