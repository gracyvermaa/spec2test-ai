"""Offline tests for the mock AI workflow (no API key, no network)."""

from workflows.graph import spec2test_workflow


def run(title, description):
    return spec2test_workflow.invoke(
        {
            "title": title,
            "description": description,
            "analysis": None,
            "test_cases": None,
            "risk_assessment": None,
            "error": None,
        }
    )


LOGIN = "Users can register and log in with email and password. The account locks after five failed attempts."
CHECKOUT = "Customers can pay by card at checkout. The payment page should load quickly and show a receipt by email."


def test_workflow_returns_all_three_parts():
    result = run("User Login", LOGIN)
    assert result["analysis"].title == "User Login"
    assert result["test_cases"].total_test_cases == len(result["test_cases"].test_cases) > 0
    assert result["risk_assessment"].total_risks == len(result["risk_assessment"].risks)


def test_risks_only_reference_existing_test_cases():
    result = run("User Login", LOGIN)
    valid = {t.test_case_id for t in result["test_cases"].test_cases}
    for risk in result["risk_assessment"].risks:
        assert set(risk.related_test_cases) <= valid


def test_output_depends_on_the_requirement():
    login = run("User Login", LOGIN)["test_cases"].total_test_cases
    checkout = run("Checkout", CHECKOUT)["test_cases"].total_test_cases
    assert login != checkout
