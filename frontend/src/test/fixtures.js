// Test data shaped exactly like what the app stores today.

export const GRACY = { name: "Gracy Verma", email: "gracyverma962@gmail.com", password: "gracy123" };
export const KINJAL = { name: "Kinjal Shah", email: "kinjal@example.com", password: "kinjal123" };

const testCase = (id, title, priority) => ({
  test_case_id: id,
  title,
  description: `${title} description`,
  priority,
  steps: ["Open the page", "Perform the action"],
  expected_result: "Works as expected",
});

export const GRACY_PROJECTS = [
  {
    id: 1001,
    projectName: "Banking AI Test Project",
    requirementTitle: "Secure User Authentication",
    description: "Users log in with email and password.",
    createdAt: "2026-11-19T09:02:21.000Z",
    status: "Analysis Complete",
    analysisResults: {
      analysis: { missing_details: [], ambiguous_requirements: [] },
      test_cases: {
        test_cases: [
          testCase("TC001", "Login with valid credentials", "High"),
          testCase("TC002", "Account locks after 5 failed attempts", "Critical"),
        ],
      },
      risk_assessment: { overall_risk_level: "High", risks: [] },
    },
  },
  {
    id: 1002,
    projectName: "Gracy Payments Portal",
    requirementTitle: "Payment checkout flow",
    description: "Checkout.",
    createdAt: "2026-11-21T18:16:49.000Z",
    status: "Pending Analysis",
  },
];

/** The global keys the app wrote BEFORE per-account storage existed. */
export function legacyGlobalData() {
  return {
    spec2test_projects: JSON.stringify(GRACY_PROJECTS),
    spec2test_status_1001: JSON.stringify({ TC001: "Passed", TC002: "Failed" }),
    spec2test_execution_runs: JSON.stringify([
      {
        id: 7001001,
        projectId: 1001,
        projectName: "Banking AI Test Project",
        status: "Completed",
        startedAt: "2026-11-20T10:00:00.000Z",
        completedAt: "2026-11-20T10:01:00.000Z",
        passed: 1,
        failed: 1,
        total: 2,
        results: [
          { testCaseId: "TC001", title: "Login with valid credentials", status: "Passed", priority: "High", logs: [] },
          { testCaseId: "TC002", title: "Account locks after 5 failed attempts", status: "Failed", priority: "Critical", logs: [] },
        ],
      },
    ]),
    spec2test_defects: JSON.stringify([
      {
        id: "DEF-001",
        projectId: 1001,
        projectName: "Banking AI Test Project",
        runId: 7001001,
        lastRunId: 7001001,
        runIds: [7001001],
        occurrences: 1,
        testCaseId: "TC002",
        title: "Account locks after 5 failed attempts",
        description: "",
        steps: [],
        expectedResult: "Account is locked",
        actualResult: "Simulated test failure",
        severity: "Critical",
        status: "Open",
        createdAt: "2026-11-20T10:01:00.000Z",
        updatedAt: "2026-11-20T10:01:00.000Z",
      },
    ]),
    spec2test_expanded_defects: JSON.stringify(["DEF-001"]),
    spec2test_read_notifications: JSON.stringify(["project-1001"]),
    "spec2test-profile": JSON.stringify({
      name: "Gracy Verma",
      email: "gracyverma962@gmail.com",
      role: "AI Engineer",
      bio: "Gracy's own bio text.",
    }),
    "spec2test-settings": JSON.stringify({
      notifications: false,
      projectUpdates: true,
      testAlerts: true,
      autosave: true,
      compactView: true,
    }),
    "spec2test-support": JSON.stringify([
      { email: "gracyverma962@gmail.com", message: "Gracy support question", date: "2026-11-20T00:00:00.000Z" },
    ]),
  };
}

export function seedLegacy({ withGracyAccount = true } = {}) {
  Object.entries(legacyGlobalData()).forEach(([key, value]) => localStorage.setItem(key, value));
  if (withGracyAccount) {
    localStorage.setItem("spec2test-users", JSON.stringify([GRACY]));
  }
}

export function snapshotLegacy() {
  const snapshot = {};
  Object.keys(legacyGlobalData()).forEach((key) => {
    snapshot[key] = localStorage.getItem(key);
  });
  return snapshot;
}
