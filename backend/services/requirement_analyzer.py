
def analyze_requirement(title: str, description: str):

    # Split the requirement into individual statements
    sentences = [
        sentence.strip()
        for sentence in description.replace("\n", ".").split(".")
        if sentence.strip()
    ]

    text = description.lower()

    # Identify missing details using basic rules
    missing_details = []

    if "login" in text or "log in" in text or "sign in" in text:
        if "password" in text and not any(
            word in text
            for word in ["password length", "password complexity", "special character"]
        ):
            missing_details.append(
                "Password complexity rules are not specified."
            )

        if not any(word in text for word in ["lockout", "retry limit", "attempt limit"]):
            missing_details.append(
                "Account lockout or retry-limit behavior is not specified."
            )

        if not any(word in text for word in ["session", "logout", "log out"]):
            missing_details.append(
                "Session and logout behavior are not specified."
            )

    return {
        "title": title,
        "summary": description,
        "functional_requirements": sentences,
        "missing_details": missing_details
    }
