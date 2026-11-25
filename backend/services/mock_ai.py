"""Offline, deterministic stand-ins for the Gemini-backed services.

Used whenever AI_MODE is "mock" (the default). Output is derived from the
requirement text, so different requirements give different results, but no
network call or API key is involved.
"""

import re

from schemas.requirement import RequirementAnalysis
from schemas.risk import Risk, RiskAssessmentResponse
from schemas.test_case import TestCase, TestCaseGenerationResponse
from services.requirement_analyzer import analyze_requirement

SECURITY_WORDS = ("password", "authentication", "account", "credential", "login")
LEVELS = {"Low": 1, "Medium": 2, "High": 3}


def mock_analyze_requirement(title: str, description: str) -> RequirementAnalysis:
    return RequirementAnalysis(**analyze_requirement(title, description))


def mock_generate_test_cases(
    analysis: RequirementAnalysis,
) -> TestCaseGenerationResponse:
    cases: list[TestCase] = []

    def add(title, description, test_type, steps, data, expected, priority):
        cases.append(
            TestCase(
                test_case_id=f"TC{len(cases) + 1:03d}",
                title=title,
                description=description,
                test_type=test_type,
                preconditions=["The application is running and reachable."],
                test_steps=steps,
                test_data=data,
                expected_result=expected,
                priority=priority,
            )
        )

    for req in analysis.functional_requirements[:3]:
        add(
            f"Verify: {req[:70]}",
            f"Confirm the stated behaviour works with valid input: {req}",
            "Positive",
            ["Prepare valid input.", "Perform the described action.", "Observe the result."],
            ["Valid input"],
            f"The system behaves as described: {req}",
            "High",
        )

    for case in analysis.edge_cases[:4]:
        add(
            f"Edge case: {case[:70]}",
            case,
            "Edge Case",
            ["Set up the scenario described.", "Submit the request.", "Observe the response."],
            ["Scenario-specific input"],
            "The system handles the scenario gracefully with a clear message.",
            "Medium",
        )

    for item in analysis.missing_details[:3]:
        add(
            f"Unspecified behaviour: {item[:60]}",
            f"Behaviour is undefined in the requirement: {item}",
            "Negative",
            ["Exercise the undefined behaviour.", "Record the actual outcome."],
            ["Input outside the specified rules"],
            "Behaviour is clarified with the product owner and then asserted.",
            "High",
        )

    for item in analysis.ambiguous_requirements[:2]:
        add(
            "Boundary check for a vague term",
            item,
            "Boundary",
            ["Agree a measurable threshold.", "Test just below, at, and above it."],
            ["Values around the agreed threshold"],
            "The system meets the agreed measurable threshold.",
            "Medium",
        )

    for risk in analysis.potential_risks[:3]:
        if any(word in risk.lower() for word in SECURITY_WORDS):
            add(
                f"Security: {risk[:60]}",
                risk,
                "Security",
                ["Attempt invalid or malicious input.", "Check that access is denied."],
                ["Malformed and malicious input"],
                "No unauthorised access or data exposure occurs.",
                "High",
            )

    add(
        "Empty input is rejected",
        "Submit the form or request with all fields empty.",
        "Negative",
        ["Leave every field empty.", "Submit."],
        ["Empty strings"],
        "Validation errors are shown and nothing is saved.",
        "Medium",
    )
    add(
        "Very long input is handled",
        "Submit input at and beyond a reasonable maximum length.",
        "Boundary",
        ["Enter an extremely long value.", "Submit."],
        ["Strings of 255, 256 and 10,000 characters"],
        "Input is accepted or rejected consistently, without errors.",
        "Low",
    )

    return TestCaseGenerationResponse(
        requirement_title=analysis.title,
        total_test_cases=len(cases),
        test_cases=cases,
    )


def _words(text: str) -> set[str]:
    return {w for w in re.findall(r"[a-z]+", text.lower()) if len(w) > 4}


def _related_ids(text: str, test_cases: TestCaseGenerationResponse) -> list[str]:
    wanted = _words(text)
    scored = []
    for case in test_cases.test_cases:
        overlap = len(wanted & _words(f"{case.title} {case.description}"))
        if overlap:
            scored.append((overlap, case.test_case_id))
    scored.sort(key=lambda pair: (-pair[0], pair[1]))
    return [case_id for _, case_id in scored[:3]]


def mock_assess_risks(
    analysis: RequirementAnalysis,
    test_cases: TestCaseGenerationResponse,
) -> RiskAssessmentResponse:
    sources = [(text, "Specification") for text in analysis.missing_details[:3]]
    sources += [
        (
            text,
            "Security" if any(w in text.lower() for w in SECURITY_WORDS) else "Functional",
        )
        for text in analysis.potential_risks[:4]
    ]

    risks: list[Risk] = []
    gaps: list[str] = []

    for text, category in sources:
        likelihood = "High" if category == "Security" else "Medium"
        impact = "High" if category in ("Security", "Functional") else "Medium"
        score = LEVELS[likelihood] * LEVELS[impact]
        severity = "High" if score >= 6 else "Medium" if score >= 3 else "Low"
        risk_id = f"RISK{len(risks) + 1:03d}"
        related = _related_ids(text, test_cases)

        if not related:
            gaps.append(f"{risk_id} has no matching test case: {text}")

        risks.append(
            Risk(
                risk_id=risk_id,
                title=text[:80],
                description=text,
                category=category,
                likelihood=likelihood,
                impact=impact,
                severity=severity,
                mitigation="Clarify the requirement and add targeted test coverage.",
                related_test_cases=related,
            )
        )

    severities = {risk.severity for risk in risks}
    overall = "High" if "High" in severities else "Medium" if "Medium" in severities else "Low"

    return RiskAssessmentResponse(
        requirement_title=analysis.title,
        overall_risk_level=overall,
        total_risks=len(risks),
        risks=risks,
        coverage_gaps=gaps,
    )
