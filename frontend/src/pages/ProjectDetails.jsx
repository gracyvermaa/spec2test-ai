
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Sparkles,
  ClipboardList,
  Play,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Search,
  Download,
} from "lucide-react";
import { runWorkflow } from "../services/api";

function ProjectDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [project, setProject] = useState(() => {
    const projects = JSON.parse(
      localStorage.getItem("spec2test_projects") || "[]"
    );

    const savedProject = projects.find(
      (item) => String(item.id) === id
    );

    return savedProject || location.state?.project;
  });

  const [results, setResults] = useState(project?.analysisResults || null);
  console.log("PROJECT:", project);
  console.log("RESULTS STATE:", results);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [testStatuses, setTestStatuses] = useState(() => {
    return JSON.parse(
      localStorage.getItem(`spec2test_status_${id}`) || "{}"
    );
  });

  const updateTestStatus = (testCaseId, status) => {
    const updatedStatuses = {
      ...testStatuses,
      [testCaseId]: status,
    };

    setTestStatuses(updatedStatuses);

    localStorage.setItem(
      `spec2test_status_${id}`,
      JSON.stringify(updatedStatuses)
    );

    window.dispatchEvent(new Event("spec2test-projects-updated"));
  };

  const allTestCases = results?.test_cases?.test_cases || [];

  const statusCounts = {
    passed: allTestCases.filter(
      (test) => testStatuses[test.test_case_id] === "Passed"
    ).length,
    failed: allTestCases.filter(
      (test) => testStatuses[test.test_case_id] === "Failed"
    ).length,
    notRun: allTestCases.filter(
      (test) => !testStatuses[test.test_case_id] || testStatuses[test.test_case_id] === "Not Run"
    ).length,
  };
  const filteredTestCases =
    results?.test_cases?.test_cases?.filter((test) => {
      const matchesPriority =
        priorityFilter === "All" || test.priority === priorityFilter;

      const matchesSearch = JSON.stringify(test)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesPriority && matchesSearch;
    }) || [];

  const exportTestCases = () => {
    const headers = [
      "Test Case ID",
      "Title",
      "Priority",
      "Description",
      "Expected Result",
      "Test Steps",
        "Execution Status",
    ];

    const rows = filteredTestCases.map((test) => [
      test.test_case_id,
      test.title,
      test.priority,
      test.description,
      test.expected_result,
      (test.test_steps || []).join(" | "),
      testStatuses[test.test_case_id] || "Not Run",
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "spec2test-test-cases.csv";
    link.click();

    URL.revokeObjectURL(url);
  };
  if (!project) {
    return (
      <div className="min-h-screen bg-[#F8F6FF] p-10 text-center">
        <h1 className="text-2xl font-bold text-[#211A4B]">
          Project not found
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const formattedDate = new Date(project.createdAt).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const handleAnalysis = async () => {
    setLoading(true);
    setError("");

    try {
      // This uses mock data only. No Gemini API calls.
      const data = await runWorkflow(project);

      setResults(data);

      const updatedProject = {
        ...project,
        status: "Analysis Complete",
        analysisResults: data,
        analyzedAt: new Date().toISOString(),
      };

      setProject(updatedProject);

      const savedProjects = JSON.parse(
        localStorage.getItem("spec2test_projects") || "[]"
      );

      const updatedProjects = savedProjects.map((item) =>
        String(item.id) === String(project.id)
          ? updatedProject
          : item
      );

      localStorage.setItem(
        "spec2test_projects",
        JSON.stringify(updatedProjects)
      );
      window.dispatchEvent(new Event("spec2test-projects-updated"));
    } catch (err) {
      setError("Something went wrong while analyzing this project.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
      case "critical":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6FF] p-6 md:p-10">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-8 flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="mx-auto max-w-5xl">

        {/* Project Header */}
        <div className="mb-8 rounded-2xl border border-purple-200 bg-gradient-to-r from-[#E7D9FF] via-[#F5DFFF] to-[#FCE5F7] p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-purple-700">
            <Sparkles size={20} />
            <span className="text-xs font-semibold tracking-wide">
              PROJECT WORKSPACE
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[#211A4B] md:text-4xl">
            {project.projectName}
          </h1>

          <p className="mt-3 text-[#62588A]">
            Review your project requirements and track analysis progress.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                project.status === "Analysis Complete"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : project.status === "Analyzing..."
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {loading ? "Analyzing..." : project.status}
            </span>

            <span className="flex items-center gap-2 rounded-full border border-white bg-white/70 px-4 py-2 text-sm text-[#62588A]">
              <Calendar size={15} />
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Project Information */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Requirement Details */}
          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                <FileText size={22} />
              </div>

              <h2 className="font-semibold text-[#211A4B]">
                Requirement Details
              </h2>
            </div>

            <h3 className="mb-3 text-lg font-bold text-[#35265E]">
              {project.requirementTitle}
            </h3>

            <p className="whitespace-pre-wrap text-sm leading-7 text-[#62588A]">
              {project.description}
            </p>
          </div>

          {/* Analysis Control */}
          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
                <ClipboardList size={22} />
              </div>

              <h2 className="font-semibold text-[#211A4B]">
                AI Analysis
              </h2>
            </div>

            <div className="rounded-xl border border-purple-200 bg-[#FAF8FF] p-6 text-center">
              {loading ? (
                <>
                  <Loader2
                    size={35}
                    className="mx-auto animate-spin text-purple-500"
                  />

                  <h3 className="mt-3 font-semibold text-[#35265E]">
                    Analyzing Requirements...
                  </h3>

                  <p className="mt-2 text-sm text-[#756A92]">
                    Our AI agents are reviewing requirements,
                    generating test cases and identifying risks.
                  </p>
                </>
              ) : results ? (
                <>
                  <CheckCircle2
                    size={35}
                    className="mx-auto text-green-500"
                  />

                  <h3 className="mt-3 font-semibold text-[#35265E]">
                    Analysis Completed!
                  </h3>

                  <p className="mt-2 text-sm text-[#756A92]">
                    Your analysis results are saved and ready to review.
                  </p>
                </>
              ) : (
                <>
                  <Sparkles
                    size={35}
                    className="mx-auto text-purple-400"
                  />

                  <h3 className="mt-3 font-semibold text-[#35265E]">
                    Ready for Analysis
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#756A92]">
                    Analyze your requirement to generate insights,
                    test cases and risk assessments.
                  </p>
                </>
              )}

              <button
                onClick={handleAnalysis}
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3 font-medium text-white shadow-sm transition hover:from-purple-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Play size={18} />
                )}

                {loading
                  ? "Running Analysis..."
                  : results
                  ? "Run Analysis Again"
                  : "Run AI Analysis"}
              </button>

              <p className="mt-3 text-xs text-purple-400">
                Demo mode Ã‚Â· Sample AI results Ã‚Â· No API usage
              </p>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                <AlertTriangle size={18} />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-8 space-y-6">

            {/* Summary */}
            <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <Sparkles className="text-purple-600" size={22} />

                <h2 className="text-lg font-bold text-[#211A4B]">
                  Requirement Analysis
                </h2>
              </div>

              <p className="text-sm leading-7 text-[#62588A]">
                {results.analysis.summary}
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: "Functional Requirements",
                    items: results.analysis.functional_requirements,
                  },
                  {
                    title: "Missing Details",
                    items: results.analysis.missing_details,
                  },
                  {
                    title: "Ambiguous Requirements",
                    items: results.analysis.ambiguous_requirements,
                  },
                  {
                    title: "Edge Cases",
                    items: results.analysis.edge_cases,
                  },
                ].map((section) => (
                  <div
                    key={section.title}
                    className="rounded-xl bg-[#FAF8FF] p-4"
                  >
                    <h3 className="mb-3 font-semibold text-[#35265E]">
                      {section.title}
                    </h3>

                    <ul className="space-y-2">
                      {section.items?.length ? (
                        section.items.map((item, index) => (
                          <li
                            key={index}
                            className="flex gap-2 text-sm text-[#62588A]"
                          >
                            <span className="text-purple-500">Ã¢â‚¬Â¢</span>
                            {item}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-400">
                          None identified
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Execution Summary */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">Passed</p>
                <p className="mt-1 text-2xl font-bold text-green-800">
                  {statusCounts.passed}
                </p>
              </div>

              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">Failed</p>
                <p className="mt-1 text-2xl font-bold text-red-800">
                  {statusCounts.failed}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-600">Not Run</p>
                <p className="mt-1 text-2xl font-bold text-gray-800">
                  {statusCounts.notRun}
                </p>
              </div>
            </div>
{/* Test Cases */}
            <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                    <ClipboardList size={22} />
                  </div>

                  <h2 className="text-lg font-bold text-[#211A4B]">
                    Generated Test Cases
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                    {filteredTestCases.length} {priorityFilter === "All" ? "Tests" : priorityFilter + " Tests"}
                  </span>

                  <button
                    onClick={exportTestCases}
                    disabled={filteredTestCases.length === 0}
                    className="flex items-center gap-2 rounded-lg bg-[#6D4AFF] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#5938DB] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-md">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B80B5]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search test cases by ID, title, or keyword..."
                    className="w-full rounded-lg border border-purple-200 bg-white py-2.5 pl-10 pr-4 text-sm text-[#35265E] outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="whitespace-nowrap text-sm font-medium text-[#62588A]">
                    Priority
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-[#35265E]"
                  >
                    <option value="All">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div><div className="space-y-4">
                {filteredTestCases.length === 0 && (
                  <div className="rounded-xl border border-dashed border-purple-200 bg-[#FAF8FF] px-6 py-10 text-center">
                    <Search size={28} className="mx-auto mb-3 text-purple-300" />
                    <p className="font-semibold text-[#35265E]">
                      No test cases found
                    </p>
                    <p className="mt-1 text-sm text-[#8B80B5]">
                      Try a different search term or priority.
                    </p>
                  </div>
                )}

                {filteredTestCases.map((test) => (
                  <div
                    key={test.test_case_id}
                    className="rounded-xl border border-purple-100 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-purple-600">
                        {test.test_case_id}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          test.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : test.priority === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {test.priority} Priority
                      </span>
                    </div>

                    <h3 className="mt-2 font-semibold text-[#35265E]">
                      {test.title}
                    </h3>

                    <p className="mt-2 text-sm text-[#756A92]">
                      {test.description}
                    </p>

                    <div className="mt-3">
                      <p className="text-xs font-semibold text-[#35265E]">
                        Expected Result
                      </p>

                      <p className="mt-1 text-sm text-[#62588A]">
                        {test.expected_result}
                      </p>
                    </div>

                    {test.test_steps?.length > 0 && (
  <div className="mt-4 rounded-xl bg-[#FAF8FF] p-4">
    <p className="mb-3 text-sm font-semibold text-[#35265E]">
      Test Steps
    </p>

    <ol className="space-y-3">
      {test.test_steps.map((step, index) => (
        <li
          key={index}
          className="flex gap-3 text-sm leading-6 text-[#62588A]"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  </div>
)}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-purple-100 pt-4">
                      <label className="text-sm font-semibold text-[#35265E]">
                        Test Status
                      </label>

                      <select
                        value={testStatuses[test.test_case_id] || "Not Run"}
                        onChange={(e) =>
                          updateTestStatus(test.test_case_id, e.target.value)
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                          testStatuses[test.test_case_id] === "Passed"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : testStatuses[test.test_case_id] === "Failed"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-gray-200 bg-gray-50 text-gray-600"
                        }`}
                      >
                        <option value="Not Run">Not Run</option>
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </div></div>))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-red-100 p-3 text-red-600">
                    <ShieldAlert size={22} />
                  </div>

                  <h2 className="text-lg font-bold text-[#211A4B]">
                    Risk Assessment
                  </h2>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${riskColor(
                    results.risk_assessment.overall_risk_level
                  )}`}
                >
                  Overall Risk: {results.risk_assessment.overall_risk_level}
                </span>
              </div>

              <div className="space-y-4">
                {results.risk_assessment.risks.map((risk) => (
                  <div
                    key={risk.risk_id}
                    className="rounded-xl border border-purple-100 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-[#35265E]">
                        {risk.risk_id} Ã‚Â· {risk.title}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${riskColor(
                          risk.severity
                        )}`}
                      >
                        {risk.severity} Severity
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-[#756A92]">
                      {risk.description}
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-[#FAF8FF] p-3">
                        <p className="text-xs font-semibold text-purple-600">
                          Category
                        </p>
                        <p className="mt-1 text-sm text-[#62588A]">
                          {risk.category}
                        </p>
                      </div>

                      <div className="rounded-lg bg-[#FAF8FF] p-3">
                        <p className="text-xs font-semibold text-purple-600">
                          Likelihood
                        </p>
                        <p className="mt-1 text-sm text-[#62588A]">
                          {risk.likelihood}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-semibold text-[#35265E]">
                        Mitigation
                      </p>

                      <p className="mt-1 text-sm text-[#62588A]">
                        {risk.mitigation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coverage Gaps */}
              <div className="mt-6 rounded-xl bg-amber-50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle size={19} className="text-amber-600" />

                  <h3 className="font-semibold text-amber-800">
                    Coverage Gaps
                  </h3>
                </div>

                <ul className="space-y-2">
                  {results.risk_assessment.coverage_gaps.map(
                    (gap, index) => (
                      <li
                        key={index}
                        className="flex gap-2 text-sm text-amber-800"
                      >
                        <span>Ã¢â‚¬Â¢</span>
                        {gap}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetails;




















