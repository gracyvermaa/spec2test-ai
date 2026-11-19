
from workflows.graph import spec2test_workflow


initial_state = {
    "title": "User Login",
    "description": (
        "Users should be able to register and log in "
        "using their email and password. The system "
        "should show an error for invalid credentials "
        "and lock the account after five consecutive "
        "failed login attempts."
    ),
    "analysis": None,
    "test_cases": None,
    "risk_assessment": None,
    "error": None
}


print("Starting Spec2Test AI workflow...")

result = spec2test_workflow.invoke(initial_state)

print("\n========== REQUIREMENT ANALYSIS ==========")
print(result["analysis"].model_dump_json(indent=2))

print("\n========== GENERATED TEST CASES ==========")
print(result["test_cases"].model_dump_json(indent=2))

print("\n========== RISK ASSESSMENT ==========")
print(result["risk_assessment"].model_dump_json(indent=2))

print("\nSpec2Test AI workflow completed successfully!")
