
def analyze_requirement(title: str, description: str):

    text = description.lower()

    # 1. Extract functional requirements
    sentences = [
        sentence.strip()
        for sentence in description.replace("\n", ".").split(".")
        if sentence.strip()
    ]

    # 2. Identify missing details
    missing_details = []

    if "login" in text or "log in" in text or "sign in" in text:
        if "password" in text and not any(
            word in text for word in
            ["password length", "password complexity", "special character"]
        ):
            missing_details.append("Password complexity rules are not specified.")

        if not any(word in text for word in
                   ["lockout", "retry limit", "attempt limit"]):
            missing_details.append("Account lockout or retry limits are not specified.")

        if not any(word in text for word in
                   ["session", "logout", "log out"]):
            missing_details.append("Session and logout behavior is not specified.")

    # 3. Identify ambiguous requirements
    ambiguous_requirements = []

    vague_words = [
        "fast", "quickly", "easy", "user-friendly",
        "appropriate", "efficient", "soon"
    ]

    for word in vague_words:
        if word in text:
            ambiguous_requirements.append(
                f"The term '{word}' is unclear and needs a measurable definition."
            )

    # 4. Identify edge cases
    edge_cases = []

    if "login" in text or "log in" in text:
        edge_cases.extend([
            "User enters an empty email or password.",
            "User enters an incorrectly formatted email.",
            "User submits incorrect credentials repeatedly."
        ])

    if "register" in text or "sign up" in text:
        edge_cases.extend([
            "User registers with an already existing email.",
            "User submits incomplete registration details."
        ])

    # 5. Identify potential risks
    potential_risks = []

    if "password" in text or "login" in text:
        potential_risks.append(
            "Weak authentication controls may expose user accounts."
        )

    if "email" in text:
        potential_risks.append(
            "Improper email validation may allow invalid account details."
        )

    if "payment" in text:
        potential_risks.append(
            "Payment failures or duplicate transactions may affect users."
        )

    return {
        "title": title,
        "summary": description,
        "functional_requirements": sentences,
        "missing_details": missing_details,
        "ambiguous_requirements": ambiguous_requirements,
        "edge_cases": edge_cases,
        "potential_risks": potential_risks
    }
