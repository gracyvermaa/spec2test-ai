import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronRight,
  History,
  Search,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

const RUNS_KEY = "spec2test_execution_runs";
const DEFECTS_KEY = "spec2test_defects";
const EXPANDED_DEFECTS_KEY = "spec2test_expanded_defects";

function Execution() {
  const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem("spec2test_projects") || "[]"));
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const savedProjects = JSON.parse(localStorage.getItem("spec2test_projects") || "[]");
    const savedRuns = JSON.parse(localStorage.getItem(RUNS_KEY) || "[]");

    const latestRun = savedRuns
      .filter((run) => run.status === "Completed")
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0];

    if (latestRun && savedProjects.some((project) => String(project.id) === String(latestRun.projectId))) {
      return String(latestRun.projectId);
    }

    const firstAnalyzed = savedProjects.find(
      (project) => project.analysisResults?.test_cases?.test_cases?.length
    );

    return firstAnalyzed ? String(firstAnalyzed.id) : "";
  });
  const [runs, setRuns] = useState(() => JSON.parse(localStorage.getItem(RUNS_KEY) || "[]"));
  const [isRunning, setIsRunning] = useState(false);
  const [currentResults, setCurrentResults] = useState({});
  const [currentRun, setCurrentRun] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewHistory, setViewHistory] = useState(false);
  const [defects, setDefects] = useState(() => JSON.parse(localStorage.getItem(DEFECTS_KEY) || "[]"));
  const [defectSearch, setDefectSearch] = useState("");
  const [defectStatusFilter, setDefectStatusFilter] = useState("All");
  const [expandedDefectIds, setExpandedDefectIds] = useState(() =>
    JSON.parse(localStorage.getItem(EXPANDED_DEFECTS_KEY) || "[]")
  );
  useEffect(() => {
    if (!selectedProjectId) {
      setCurrentRun(null);
      setCurrentResults({});
      return;
    }

    const latestRun = runs
      .filter(
        (run) =>
          String(run.projectId) === selectedProjectId &&
          run.status === "Completed" &&
          Array.isArray(run.results)
      )
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0];

    if (!latestRun) {
      setCurrentRun(null);
      setCurrentResults({});
      return;
    }

    const restoredResults = {};
    latestRun.results.forEach((result) => {
      restoredResults[result.testCaseId] = {
        status: result.status,
        logs: result.logs || [],
      };
    });

    setCurrentRun(latestRun);
    setCurrentResults(restoredResults);
    setViewHistory(false);
    setSelectedTest(null);
  }, [selectedProjectId, runs]);
const selectedProject = projects.find(
    (project) => String(project.id) === selectedProjectId
  );

  const testCases =
    selectedProject?.analysisResults?.test_cases?.test_cases || [];

  const projectRuns = runs.filter(
    (run) => String(run.projectId) === selectedProjectId
  );
  const projectDefects = defects.filter(
    (defect) => String(defect.projectId) === selectedProjectId
  );

  const filteredDefects = projectDefects.filter((defect) => {
    const matchesSearch = `${defect.id} ${defect.title} ${defect.testCaseId}`
      .toLowerCase()
      .includes(defectSearch.toLowerCase());

    const matchesStatus =
      defectStatusFilter === "All" || defect.status === defectStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const completed = Object.values(currentResults).filter(
    (result) => result.status === "Passed" || result.status === "Failed"
  ).length;

  const passed = Object.values(currentResults).filter(
    (result) => result.status === "Passed"
  ).length;

  const failed = Object.values(currentResults).filter(
    (result) => result.status === "Failed"
  ).length;

  const filteredTests = testCases.filter((test) =>
    JSON.stringify(test).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveRuns = (updatedRuns) => {
    setRuns(updatedRuns);
    localStorage.setItem(RUNS_KEY, JSON.stringify(updatedRuns));
  };
  const saveDefects = (updatedDefects) => {
    setDefects(updatedDefects);
    localStorage.setItem(DEFECTS_KEY, JSON.stringify(updatedDefects));
  };

  const createDefectsForRun = (run, failedResults) => {
    if (!failedResults.length) return;

    const existingDefects = JSON.parse(
      localStorage.getItem(DEFECTS_KEY) || "[]"
    );

    let updatedDefects = [...existingDefects];

    let nextNumber = existingDefects.reduce((max, defect) => {
      const number = Number(String(defect.id).replace("DEF-", ""));
      return Number.isFinite(number) ? Math.max(max, number) : max;
    }, 0);

    const now = new Date().toISOString();

    failedResults.forEach((result) => {
      const existingIndex = updatedDefects.findIndex(
        (defect) =>
          String(defect.projectId) === String(run.projectId) &&
          defect.testCaseId === result.testCaseId
      );

      const priority = String(result.priority || "").toLowerCase();

      const severity =
        priority.includes("critical") ? "Critical" :
        priority.includes("high") ? "High" :
        priority.includes("medium") ? "Medium" : "Low";

      if (existingIndex !== -1) {
        const existing = updatedDefects[existingIndex];

        updatedDefects[existingIndex] = {
          ...existing,
          runId: run.id,
          lastRunId: run.id,
          runIds: [...new Set([...(existing.runIds || [existing.runId]), run.id])],
          occurrences: (existing.occurrences || 1) + 1,
          lastSeenAt: now,
          actualResult: result.errorMessage || "Simulated test failure",
          severity,
          status:
            existing.status === "Resolved" || existing.status === "Closed"
              ? "Open"
              : existing.status,
          updatedAt: now,
        };
      } else {
        nextNumber++;

        updatedDefects.unshift({
          id: `DEF-${String(nextNumber).padStart(3, "0")}`,
          projectId: run.projectId,
          projectName: run.projectName,
          runId: run.id,
          lastRunId: run.id,
          runIds: [run.id],
          occurrences: 1,
          lastSeenAt: now,
          testCaseId: result.testCaseId,
          title: result.title,
          description: result.description || "",
          steps: result.steps || [],
          expectedResult: result.expectedResult || "Not specified",
          actualResult: result.errorMessage || "Simulated test failure",
          severity,
          status: "Open",
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    saveDefects(updatedDefects);
  };
  const updateDefect = (defectId, updates) => {
    const updatedDefects = defects.map((defect) =>
      defect.id === defectId
        ? { ...defect, ...updates, updatedAt: new Date().toISOString() }
        : defect
    );

    saveDefects(updatedDefects);
  };

  const startExecution = async () => {
    if (!selectedProject || !testCases.length || isRunning) return;

    setIsRunning(true);
    setViewHistory(false);
    setSelectedTest(null);

    const initialResults = {};
    testCases.forEach((test) => {
      initialResults[test.test_case_id] = { status: "Pending", logs: [] };
    });
    setCurrentResults(initialResults);

    const runId = Date.now();
    const startedAt = new Date().toISOString();

    setCurrentRun({
      id: runId,
      projectId: selectedProject.id,
      projectName: selectedProject.projectName,
      startedAt,
      status: "Running",
    });

    const resultList = [];

    for (let index = 0; index < testCases.length; index++) {
      const test = testCases[index];
      const testId = test.test_case_id;

      setCurrentResults((previous) => ({
        ...previous,
        [testId]: {
          status: "Running",
          logs: ["Test execution started..."],
        },
      }));

      await new Promise((resolve) => setTimeout(resolve, 650));

      // Demo simulation only. This does NOT execute the actual application.
      const simulatedFailure = (index + 1) % 5 === 0;
      const outcome = simulatedFailure ? "Failed" : "Passed";

      const logs = [
        "Test execution started",
        ...(test.test_steps || []).map(
          (step, stepIndex) => `Step ${stepIndex + 1}: ${step}`
        ),
        simulatedFailure
          ? "Simulated failure: expected behavior was not verified."
          : "Simulated execution completed successfully.",
      ];

      const result = {
        testCaseId: testId,
        title: test.title,
        priority: test.priority,
        status: outcome,
        expectedResult: test.expected_result,
        description: test.description,
        steps: test.test_steps || [],
        logs,
        duration: "0.65s",
        errorMessage: simulatedFailure
          ? "Demo failure — this is simulated, not a real application error."
          : "",
      };

      resultList.push(result);

      setCurrentResults((previous) => ({
        ...previous,
        [testId]: { status: outcome, logs },
      }));
    }

    const finishedAt = new Date().toISOString();
    const run = {
      id: runId,
      projectId: selectedProject.id,
      projectName: selectedProject.projectName,
      startedAt,
      finishedAt,
      status: "Completed",
      total: testCases.length,
      passed: resultList.filter((result) => result.status === "Passed").length,
      failed: resultList.filter((result) => result.status === "Failed").length,
      results: resultList,
    };

    const updatedRuns = [run, ...runs];
    saveRuns(updatedRuns);
    setCurrentRun(run);
    createDefectsForRun(
      run,
      resultList.filter((result) => result.status === "Failed")
    );
    setIsRunning(false);
  };

  const openTestDetails = (test) => {
    setSelectedTest(test);
  };

  const resetExecution = () => {
    setCurrentResults({});
    setCurrentRun(null);
    setSelectedTest(null);
    setViewHistory(false);
  };

  const openHistoryRun = (run) => {
    setCurrentRun(run);
    const results = {};

    run.results.forEach((result) => {
      results[result.testCaseId] = {
        status: result.status,
        logs: result.logs,
      };
    });

    setCurrentResults(results);
    setViewHistory(true);
    setSelectedTest(null);
  };

  const clearHistory = () => {
    const remaining = runs.filter(
      (run) => String(run.projectId) !== selectedProjectId
    );
    saveRuns(remaining);
    setCurrentRun(null);
    setCurrentResults({});
    setSelectedTest(null);
  };

  const statusStyle = (status) => {
    if (status === "Passed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "Failed") return "bg-rose-50 text-rose-700 border-rose-200";
    if (status === "Running") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#211A4B]">
              Execution Workspace
            </h1>
            <p className="mt-2 text-sm text-[#81769F]">
              Run test scenarios, inspect results, and review execution history.
            </p>
          </div>

          <button
            onClick={() => setViewHistory(!viewHistory)}
            className="flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm font-semibold text-purple-700 hover:bg-purple-50"
          >
            <History size={18} />
            {viewHistory ? "Current Run" : "Execution History"}
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-[#211A4B]">
            Select Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(event) => {
              setSelectedProjectId(event.target.value);
              resetExecution();
            }}
            className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm text-[#211A4B] outline-none focus:border-purple-400 md:max-w-xl"
          >
            <option value="">Choose a project...</option>
            {projects.map((project) => (
              <option key={project.id} value={String(project.id)}>
                {project.projectName || project.requirementTitle || "Untitled Project"}
              </option>
            ))}
          </select>
        </div>

        {!selectedProject ? (
          <div className="rounded-2xl border border-purple-100 bg-white p-12 text-center">
            <AlertTriangle className="mx-auto mb-3 text-purple-400" size={32} />
            <h2 className="font-semibold text-[#211A4B]">Select a project</h2>
            <p className="mt-2 text-sm text-[#81769F]">
              Choose a project to load its generated test cases.
            </p>
          </div>
        ) : testCases.length === 0 ? (
          <div className="rounded-2xl border border-purple-100 bg-white p-12 text-center">
            <AlertTriangle className="mx-auto mb-3 text-amber-400" size={32} />
            <h2 className="font-semibold text-[#211A4B]">No generated test cases</h2>
            <p className="mt-2 text-sm text-[#81769F]">
              Analyze this project's requirements and generate test cases before execution.
            </p>
          </div>
        ) : viewHistory ? (
          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#211A4B]">Run History</h2>
              <button
                onClick={clearHistory}
                className="text-sm text-rose-600 hover:underline"
              >
                Clear project history
              </button>
            </div>

            {projectRuns.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#81769F]">
                No execution runs saved for this project yet.
              </p>
            ) : (
              <div className="space-y-3">
                {projectRuns.map((run) => (
                  <button
                    key={run.id}
                    onClick={() => openHistoryRun(run)}
                    className="flex w-full flex-wrap items-center justify-between gap-4 rounded-xl border border-purple-100 p-4 text-left hover:bg-purple-50"
                  >
                    <div>
                      <p className="font-semibold text-[#211A4B]">
                        Run #{String(run.id).slice(-6)}
                      </p>
                      <p className="mt-1 text-xs text-[#81769F]">
                        {new Date(run.startedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="text-emerald-700">{run.passed} Passed</span>
                      <span className="text-rose-700">{run.failed} Failed</span>
                      <span className="text-[#81769F]">{run.total} Total</span>
                    </div>
                    <ChevronRight size={18} className="text-purple-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#211A4B]">
                  {selectedProject.projectName || selectedProject.requirementTitle}
                </h2>
                <p className="mt-1 text-sm text-[#81769F]">
                  {testCases.length} test cases available
                </p>
              </div>

              <button
                onClick={startExecution}
                disabled={isRunning}
                className="flex items-center gap-2 rounded-xl bg-[#8065D5] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#7055C5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRunning ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                {isRunning ? "Running Tests..." : "Run All Tests"}
              </button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Total Tests", value: testCases.length, icon: Clock, color: "text-purple-600" },
                { label: "Passed", value: passed, icon: CheckCircle2, color: "text-emerald-600" },
                { label: "Failed", value: failed, icon: XCircle, color: "text-rose-600" },
                { label: "Completed", value: completed, icon: CheckCircle2, color: "text-blue-600" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#81769F]">{item.label}</p>
                      <Icon size={20} className={item.color} />
                    </div>
                    <p className={`mt-3 text-3xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                );
              })}
            </div>

            {currentRun && (
              <div className="mb-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-wrap justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-[#211A4B]">
                      {isRunning ? "Execution in Progress" : "Execution Completed"}
                    </h3>
                    <p className="mt-1 text-xs text-[#81769F]">
                      Run #{String(currentRun.id).slice(-6)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-purple-700">
                    {completed} / {testCases.length} completed
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-purple-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-300"
                    style={{ width: `${testCases.length ? (completed / testCases.length) * 100 : 0}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#81769F]">
                  Simulation only — no real application or browser tests are being executed.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-[#211A4B]">Test Cases</h2>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search test cases..."
                      className="rounded-lg border border-purple-100 py-2 pl-9 pr-3 text-sm outline-none focus:border-purple-300"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredTests.map((test) => {
                    const status = currentResults[test.test_case_id]?.status || "Pending";
                    const result = currentRun?.results?.find(
                      (item) => item.testCaseId === test.test_case_id
                    );

                    return (
                      <button
                        key={test.test_case_id}
                        onClick={() => openTestDetails(result || test)}
                        className="w-full rounded-xl border border-purple-100 p-4 text-left transition hover:border-purple-300 hover:bg-purple-50/40"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-semibold text-purple-600">{test.test_case_id}</span>
                            <h3 className="mt-1 font-semibold text-[#211A4B]">{test.title}</h3>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle(status)}`}>
                            {status}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#81769F]">
                          <span className="rounded-md bg-purple-50 px-2 py-1">Priority: {test.priority || "N/A"}</span>
                          <span>{(test.test_steps || []).length} steps</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-[#211A4B]">Test Details</h2>
                {!selectedTest ? (
                  <div className="py-10 text-center">
                    <ChevronDown className="mx-auto mb-2 text-purple-300" size={26} />
                    <p className="text-sm text-[#81769F]">
                      Select a test case to inspect its details.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-purple-600">
                        {selectedTest.testCaseId || selectedTest.test_case_id}
                      </p>
                      <h3 className="mt-1 font-semibold text-[#211A4B]">
                        {selectedTest.title}
                      </h3>
                    </div>

                    {selectedTest.status && (
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle(selectedTest.status)}`}>
                        {selectedTest.status}
                      </span>
                    )}

                    <div>
                      <p className="mb-1 text-xs font-semibold text-[#81769F]">Description</p>
                      <p className="text-sm text-[#514675]">
                        {selectedTest.description || "No description provided."}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-semibold text-[#81769F]">Expected Result</p>
                      <p className="text-sm text-[#514675]">
                        {selectedTest.expectedResult || selectedTest.expected_result || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold text-[#81769F]">Test Steps</p>
                      <ol className="space-y-2">
                        {(selectedTest.steps || selectedTest.test_steps || []).map((step, index) => (
                          <li key={index} className="rounded-lg bg-purple-50 p-3 text-sm text-[#514675]">
                            <span className="mr-2 font-semibold text-purple-600">{index + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {selectedTest.logs && (
                      <div>
                        <p className="mb-2 text-xs font-semibold text-[#81769F]">Execution Log</p>
                        <div className="space-y-2 rounded-xl bg-[#211A4B] p-3">
                          {selectedTest.logs.map((log, index) => (
                            <p key={index} className="text-xs leading-5 text-purple-100">
                              {log}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTest.errorMessage && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                        <p className="mb-1 text-xs font-semibold text-rose-700">Failure Details</p>
                        <p className="text-sm text-rose-700">{selectedTest.errorMessage}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <History size={19} className="text-purple-600" />
                <h2 className="text-lg font-bold text-[#211A4B]">Recent Runs</h2>
              </div>
              {projectRuns.length === 0 ? (
                <p className="text-sm text-[#81769F]">
                  No previous runs. Start your first execution above.
                </p>
              ) : (
                <div className="space-y-2">
                  {projectRuns.slice(0, 3).map((run) => (
                    <div key={run.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-purple-50/60 p-3 text-sm">
                      <span className="font-medium text-[#211A4B]">
                        Run #{String(run.id).slice(-6)}
                      </span>
                      <span className="text-xs text-[#81769F]">
                        {new Date(run.startedAt).toLocaleString()}
                      </span>
                      <span className="text-emerald-700">{run.passed} passed</span>
                      <span className="text-rose-700">{run.failed} failed</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#211A4B]">
                    Defect Tracking
                  </h2>
                  <p className="mt-1 text-sm text-[#81769F]">
                    Track, prioritize, and manage defects identified during simulated test runs.
                  </p>
                </div>
                <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                  {projectDefects.length} total defects
                </span>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  {
                    label: "Total Defects",
                    value: projectDefects.length,
                    color: "text-purple-700",
                  },
                  {
                    label: "Open",
                    value: projectDefects.filter((d) => d.status === "Open").length,
                    color: "text-rose-600",
                  },
                  {
                    label: "Critical",
                    value: projectDefects.filter((d) => d.severity === "Critical").length,
                    color: "text-red-700",
                  },
                  {
                    label: "Resolved",
                    value: projectDefects.filter(
                      (d) => d.status === "Resolved" || d.status === "Closed"
                    ).length,
                    color: "text-emerald-600",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-purple-100 bg-purple-50/40 p-4"
                  >
                    <p className="text-xs text-[#81769F]">{item.label}</p>
                    <p className={`mt-2 text-2xl font-bold ${item.color}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mb-4 flex flex-wrap gap-3">
                <div className="relative min-w-[200px] flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"
                  />
                  <input
                    value={defectSearch}
                    onChange={(event) => setDefectSearch(event.target.value)}
                    placeholder="Search defects or test cases..."
                    className="w-full rounded-lg border border-purple-100 py-2 pl-9 pr-3 text-sm outline-none focus:border-purple-300"
                  />
                </div>

                <select
                  value={defectStatusFilter}
                  onChange={(event) => setDefectStatusFilter(event.target.value)}
                  className="rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-[#514675] outline-none focus:border-purple-300"
                >
                  {["All", "Open", "In Progress", "Resolved", "Closed"].map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "All Statuses" : status}
                    </option>
                  ))}
                </select>
              </div>

              {filteredDefects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-purple-200 py-10 text-center">
                  <AlertTriangle className="mx-auto mb-2 text-purple-300" size={28} />
                  <p className="font-medium text-[#514675]">
                    {projectDefects.length === 0
                      ? "No defects detected yet"
                      : "No defects match your filters"}
                  </p>
                  <p className="mt-1 text-sm text-[#81769F]">
                    {projectDefects.length === 0
                      ? "Run the simulated tests. Failed test cases will automatically create defects here."
                      : "Try changing your search or status filter."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDefects.map((defect) => (
                    <div
                      key={defect.id}
                      className="rounded-xl border border-purple-100 p-4 transition hover:border-purple-200"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-purple-600">
                              {defect.id}
                            </span>
                            <span className="rounded-md bg-purple-50 px-2 py-1 text-xs text-purple-700">
                              {defect.testCaseId}
                            </span>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                defect.severity === "Critical"
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : defect.severity === "High"
                                  ? "border-orange-200 bg-orange-50 text-orange-700"
                                  : defect.severity === "Medium"
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-gray-200 bg-gray-50 text-gray-600"
                              }`}
                            >
                              {defect.severity}
                            </span>
                          </div>
                          <h3 className="mt-2 font-semibold text-[#211A4B]">
                            {defect.title}
                          </h3>
                          <p className="mt-1 text-sm text-[#81769F]">
                            Run #{String(defect.runId).slice(-6)} · Created{" "}
                            {new Date(defect.createdAt).toLocaleString()}
                          </p>
                          {defect.occurrences > 1 && (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                              <span>↻</span>
                              Repeated failure · {defect.occurrences} occurrences
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <select
                            value={defect.severity}
                            onChange={(event) =>
                              updateDefect(defect.id, {
                                severity: event.target.value,
                              })
                            }
                            className="rounded-lg border border-purple-100 bg-white px-2 py-1.5 text-xs outline-none focus:border-purple-300"
                            aria-label={`Severity for ${defect.id}`}
                          >
                            {["Critical", "High", "Medium", "Low"].map((severity) => (
                              <option key={severity} value={severity}>
                                {severity}
                              </option>
                            ))}
                          </select>

                          <select
                            value={defect.status}
                            onChange={(event) =>
                              updateDefect(defect.id, {
                                status: event.target.value,
                              })
                            }
                            className="rounded-lg border border-purple-100 bg-white px-2 py-1.5 text-xs outline-none focus:border-purple-300"
                            aria-label={`Status for ${defect.id}`}
                          >
                            {["Open", "In Progress", "Resolved", "Closed"].map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <details
                        className="mt-3"
                        open={expandedDefectIds.includes(defect.id)}
                        onToggle={(event) => {
                          const isOpen = event.currentTarget.open;

                          setExpandedDefectIds((previous) => {
                            const next = isOpen
                              ? [...new Set([...previous, defect.id])]
                              : previous.filter((id) => id !== defect.id);

                            localStorage.setItem(
                              EXPANDED_DEFECTS_KEY,
                              JSON.stringify(next)
                            );

                            return next;
                          });
                        }}
                      >
                        <summary className="cursor-pointer text-sm font-medium text-purple-600 hover:text-purple-800">
                          View defect details
                        </summary>
                        <div className="mt-3 space-y-3 rounded-lg bg-purple-50/50 p-4">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-purple-100 bg-white p-3">
                              <p className="text-xs font-medium text-[#81769F]">
                                First Detected
                              </p>
                              <p className="mt-1 text-sm font-semibold text-[#514675]">
                                {new Date(defect.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="rounded-lg border border-purple-100 bg-white p-3">
                              <p className="text-xs font-medium text-[#81769F]">
                                Last Detected
                              </p>
                              <p className="mt-1 text-sm font-semibold text-[#514675]">
                                {new Date(defect.lastSeenAt || defect.updatedAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="rounded-lg border border-purple-100 bg-white p-3">
                              <p className="text-xs font-medium text-[#81769F]">
                                Total Occurrences
                              </p>
                              <p className="mt-1 text-lg font-bold text-purple-700">
                                {defect.occurrences || 1}
                              </p>
                            </div>

                            <div className="rounded-lg border border-purple-100 bg-white p-3">
                              <p className="text-xs font-medium text-[#81769F]">
                                Unique Runs Affected
                              </p>
                              <p className="mt-1 text-lg font-bold text-purple-700">
                                {defect.runIds?.length || (defect.runId ? 1 : 0)}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="mb-1 text-xs font-semibold text-[#81769F]">
                              Description
                            </p>
                            <p className="text-sm text-[#514675]">
                              {defect.description || "No description available."}
                            </p>
                          </div>

                          <div>
                            <p className="mb-1 text-xs font-semibold text-[#81769F]">
                              Expected Result
                            </p>
                            <p className="text-sm text-[#514675]">
                              {defect.expectedResult}
                            </p>
                          </div>

                          <div>
                            <p className="mb-1 text-xs font-semibold text-[#81769F]">
                              Actual Result
                            </p>
                            <p className="text-sm text-rose-700">
                              {defect.actualResult}
                            </p>
                          </div>

                          <div>
                            <p className="mb-1 text-xs font-semibold text-[#81769F]">
                              Steps to Reproduce
                            </p>
                            {defect.steps.length ? (
                              <ol className="space-y-1">
                                {defect.steps.map((step, index) => (
                                  <li key={index} className="text-sm text-[#514675]">
                                    {index + 1}. {step}
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <p className="text-sm text-[#514675]">
                                No reproduction steps available.
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 border-t border-purple-100 pt-3 text-xs text-[#81769F]">
                            <span>Project: {defect.projectName}</span>
                            <span>Test: {defect.testCaseId}</span>
                            <span>
                              Last updated: {new Date(defect.updatedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Execution;












