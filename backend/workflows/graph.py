
from langgraph.graph import StateGraph, START, END

from schemas.workflow_state import WorkflowState

from workflows.requirement_node import requirement_node
from workflows.test_case_node import test_case_node
from workflows.risk_node import risk_node


def build_workflow():

    # Create the workflow
    workflow = StateGraph(WorkflowState)

    # Register the three agent nodes
    workflow.add_node("requirement_analyst", requirement_node)
    workflow.add_node("test_case_generator", test_case_node)
    workflow.add_node("risk_assessment", risk_node)

    # Connect the nodes in sequence
    workflow.add_edge(START, "requirement_analyst")
    workflow.add_edge("requirement_analyst", "test_case_generator")
    workflow.add_edge("test_case_generator", "risk_assessment")
    workflow.add_edge("risk_assessment", END)

    # Compile the workflow
    return workflow.compile()


# Create the compiled workflow
spec2test_workflow = build_workflow()
