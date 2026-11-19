
export const runWorkflow = async (project) => {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  return {
    analysis: {
      title: project.requirementTitle,
      summary:
        "The authentication system must verify registered user credentials, " +
        "protect against brute-force attacks through account lockout, " +
        "support secure password recovery, and protect stored credentials " +
        "using password hashing. Key areas requiring validation include " +
        "authentication, lockout timing, recovery link security, and session access.",
      functional_requirements: [
        "Authenticate users using registered email and password",
        "Reject invalid credentials with appropriate error messages",
        "Lock accounts after 5 consecutive failed login attempts",
        "Maintain account lock for 15 minutes",
        "Allow password reset through verified email links",
        "Redirect successful users to their dashboard",
        "Store passwords using secure hashing",
        "Prevent unauthorized access to protected resources",
      ],
      missing_details: [
        "Whether the failed attempt counter resets after a successful login",
        "Whether account lockout duration can be extended after repeated lockouts",
        "Password complexity and minimum length requirements",
        "Password reset link expiration duration",
        "Session expiration and logout behavior",
      ],
      ambiguous_requirements: [
        "Whether the account lockout message reveals if an account exists",
        "Whether login attempts during lockout extend the lockout period",
        "Whether previously issued sessions remain active after password reset",
      ],
      edge_cases: [
        "Exactly 4 versus 5 consecutive failed login attempts",
        "Login attempt at the exact 15-minute lockout boundary",
        "Expired or already-used password reset link",
        "Multiple password reset requests",
        "Concurrent login attempts",
        "Case sensitivity of email addresses",
      ],
      potential_risks: [
        "Brute-force password attacks",
        "Account enumeration through error messages",
        "Password reset token abuse",
        "Unauthorized access due to weak session management",
        "Password exposure due to insecure storage",
      ],
    },

    test_cases: {
      requirement_title: project.requirementTitle,
      total_test_cases: 10,
      test_cases: [
        {
          test_case_id: "TC001",
          title: "Login with valid credentials",
          description:
            "Verify a registered user can authenticate successfully.",
          test_type: "Positive",
          preconditions: [
            "User account exists",
            "Account is not locked",
          ],
          test_steps: [
            "Open the login page",
            "Enter registered email and correct password",
            "Click Login",
          ],
          test_data: [
            "Email: registered_user@example.com",
            "Password: ValidPassword123!",
          ],
          expected_result:
            "User is authenticated and redirected to the dashboard.",
          priority: "High",
        },
        {
          test_case_id: "TC002",
          title: "Login with incorrect password",
          description:
            "Verify incorrect credentials are rejected.",
          test_type: "Negative",
          preconditions: ["User account exists and is not locked"],
          test_steps: [
            "Enter registered email",
            "Enter incorrect password",
            "Click Login",
          ],
          test_data: [
            "Email: registered_user@example.com",
            "Password: WrongPassword123!",
          ],
          expected_result:
            "Login is rejected and an appropriate error message is displayed.",
          priority: "High",
        },
        {
          test_case_id: "TC003",
          title: "Account locks after 5 consecutive failed attempts",
          description:
            "Verify the account is locked after the fifth consecutive failed login.",
          test_type: "Security",
          preconditions: ["Account is active and not locked"],
          test_steps: [
            "Submit an incorrect password 4 times",
            "Verify the account is not yet locked",
            "Submit an incorrect password a fifth time",
            "Attempt login again",
          ],
          test_data: [
            "Registered email",
            "Incorrect password repeated 5 times",
          ],
          expected_result:
            "Account is locked after the fifth failed attempt and further login is prevented.",
          priority: "Critical",
        },
        {
          test_case_id: "TC004",
          title: "Account remains locked during 15-minute period",
          description:
            "Verify login remains blocked before the lockout expires.",
          test_type: "Security",
          preconditions: [
            "Account has been locked after 5 failed attempts",
          ],
          test_steps: [
            "Attempt login with correct credentials during lockout",
            "Verify access is denied",
          ],
          test_data: ["Correct email and password"],
          expected_result:
            "Login remains blocked until the 15-minute lockout expires.",
          priority: "Critical",
        },
        {
          test_case_id: "TC005",
          title: "Account unlocks after 15 minutes",
          description:
            "Verify the account becomes accessible after lockout expiry.",
          test_type: "Positive",
          preconditions: ["Account is locked"],
          test_steps: [
            "Wait for the 15-minute lockout period to expire",
            "Enter valid credentials",
            "Click Login",
          ],
          test_data: ["Registered email and correct password"],
          expected_result:
            "Account is unlocked and the user can log in successfully.",
          priority: "High",
        },
        {
          test_case_id: "TC006",
          title: "Password reset with valid email link",
          description:
            "Verify password can be reset using a valid verified link.",
          test_type: "Positive",
          preconditions: ["Registered account exists"],
          test_steps: [
            "Request password reset",
            "Open the verified reset link",
            "Enter a new valid password",
            "Submit the password reset form",
            "Log in using the new password",
          ],
          test_data: ["Valid reset link", "NewPassword123!"],
          expected_result:
            "Password is updated and the new password allows login.",
          priority: "High",
        },
        {
          test_case_id: "TC007",
          title: "Reject expired password reset link",
          description:
            "Verify an expired password reset link cannot be used.",
          test_type: "Negative",
          preconditions: ["Password reset link has expired"],
          test_steps: [
            "Open the expired password reset link",
            "Attempt to submit a new password",
          ],
          test_data: ["Expired reset token"],
          expected_result:
            "Reset is rejected and the user is prompted to request a new link.",
          priority: "High",
        },
        {
          test_case_id: "TC008",
          title: "Reject reused password reset link",
          description:
            "Verify a password reset token cannot be reused.",
          test_type: "Security",
          preconditions: ["Reset link was already successfully used"],
          test_steps: [
            "Open the previously used reset link",
            "Attempt another password reset",
          ],
          test_data: ["Previously consumed reset token"],
          expected_result:
            "The token is invalidated and cannot be reused.",
          priority: "High",
        },
        {
          test_case_id: "TC009",
          title: "Verify password is securely hashed",
          description:
            "Verify stored credentials are not stored in plaintext.",
          test_type: "Security",
          preconditions: ["User account has been created"],
          test_steps: [
            "Inspect the password storage record in the database",
            "Verify the stored password is hashed",
            "Verify plaintext password is not present",
          ],
          test_data: ["Registered user's password"],
          expected_result:
            "Password is stored using a secure salted hashing mechanism.",
          priority: "Critical",
        },
        {
          test_case_id: "TC010",
          title: "Prevent unauthorized access to dashboard",
          description:
            "Verify unauthenticated users cannot access protected pages.",
          test_type: "Security",
          preconditions: ["User is logged out"],
          test_steps: [
            "Navigate directly to the dashboard URL",
            "Attempt to access protected account information",
          ],
          test_data: ["Direct dashboard URL"],
          expected_result:
            "Unauthorized access is denied and the user is redirected to login.",
          priority: "Critical",
        },
      ],
    },

    risk_assessment: {
      requirement_title: project.requirementTitle,
      overall_risk_level: "High",
      total_risks: 5,
      risks: [
        {
          risk_id: "R001",
          title: "Brute-force credential attacks",
          description:
            "Attackers may repeatedly attempt passwords to gain access to user accounts.",
          category: "Security",
          likelihood: "High",
          impact: "Critical",
          severity: "Critical",
          mitigation:
            "Enforce account lockout, rate limiting, monitoring, and appropriate authentication controls.",
          related_test_cases: ["TC002", "TC003", "TC004"],
        },
        {
          risk_id: "R002",
          title: "Account enumeration",
          description:
            "Different login or password-reset messages may reveal registered accounts.",
          category: "Security",
          likelihood: "Medium",
          impact: "High",
          severity: "High",
          mitigation:
            "Use consistent authentication and password-reset responses that do not disclose account existence.",
          related_test_cases: ["TC002", "TC006"],
        },
        {
          risk_id: "R003",
          title: "Password reset token compromise",
          description:
            "An exposed, expired, or reused reset token could allow unauthorized password changes.",
          category: "Security",
          likelihood: "Medium",
          impact: "Critical",
          severity: "Critical",
          mitigation:
            "Use secure, time-limited, single-use reset tokens and invalidate them after use.",
          related_test_cases: ["TC006", "TC007", "TC008"],
        },
        {
          risk_id: "R004",
          title: "Insecure password storage",
          description:
            "Plaintext or weakly hashed passwords could expose users if the database is compromised.",
          category: "Data Security",
          likelihood: "Low",
          impact: "Critical",
          severity: "High",
          mitigation:
            "Use a modern password hashing algorithm with unique salts and appropriate parameters.",
          related_test_cases: ["TC009"],
        },
        {
          risk_id: "R005",
          title: "Unauthorized dashboard access",
          description:
            "Missing authorization checks may expose banking information to unauthenticated users.",
          category: "Access Control",
          likelihood: "Medium",
          impact: "Critical",
          severity: "Critical",
          mitigation:
            "Validate authentication and authorization on the server for all protected routes.",
          related_test_cases: ["TC001", "TC010"],
        },
      ],
      coverage_gaps: [
        "Concurrent login attempts and race conditions",
        "Session expiration and logout behavior",
        "Multi-factor authentication",
        "Password complexity and password reuse rules",
        "Rate limiting and automated attack protection",
        "Security penetration testing",
      ],
    },
  };
};
