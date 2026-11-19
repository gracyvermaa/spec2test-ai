import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  FolderKanban,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function getReportData() {
  const projects = JSON.parse(
    localStorage.getItem("spec2test_projects") || "[]"
  );

  let totalTestCases = 0;
  let passed = 0;
  let failed = 0;
  let notRun = 0;
  let analyzedProjects = 0;

  const riskCounts = { High: 0, Medium: 0, Low: 0 };

  projects.forEach((project) => {
    const results = project.analysisResults;

    if (!results) return;

    analyzedProjects++;

    const testCases = results.test_cases?.test_cases || [];
    totalTestCases += testCases.length;

    const statuses = JSON.parse(
      localStorage.getItem(`spec2test_status_${project.id}`) || "{}"
    );

    testCases.forEach((test) => {
      const status = statuses[test.test_case_id] || "Not Run";

      if (status === "Passed") passed++;
      else if (status === "Failed") failed++;
      else notRun++;
    });

    const risks = results.risk_assessment?.risks || [];

    risks.forEach((risk) => {
      const severity = String(risk.severity || "").toLowerCase();

      if (severity === "critical" || severity === "high") {
        riskCounts.High++;
      } else if (severity === "medium") {
        riskCounts.Medium++;
      } else if (severity === "low") {
        riskCounts.Low++;
      }
    });
  });

  const executed = passed + failed;
  const passRate = executed > 0 ? Math.round((passed / executed) * 100) : 0;

  return {
    projects,
    stats: {
      totalProjects: projects.length,
      analyzedProjects,
      totalTestCases,
      passed,
      failed,
      passRate,
    },
    executionData: [
      { name: "Passed", value: passed, color: "#34D399" },
      { name: "Failed", value: failed, color: "#F472B6" },
      { name: "Not Run", value: notRun, color: "#C4B5FD" },
    ],
    riskData: [
      { name: "High", value: riskCounts.High, color: "#F472B6" },
      { name: "Medium", value: riskCounts.Medium, color: "#FBBF24" },
      { name: "Low", value: riskCounts.Low, color: "#34D399" },
    ],
  };
}

const cards = [
  {
    title: "Total Projects",
    key: "totalProjects",
    icon: FolderKanban,
    color: "purple",
    description: "Projects in workspace",
  },
  {
    title: "Analyzed Projects",
    key: "analyzedProjects",
    icon: Sparkles,
    color: "blue",
    description: "Projects analyzed",
  },
  {
    title: "Total Test Cases",
    key: "totalTestCases",
    icon: ClipboardList,
    color: "indigo",
    description: "Generated test cases",
  },
  {
    title: "Tests Passed",
    key: "passed",
    icon: CheckCircle2,
    color: "green",
    description: "Successfully executed",
  },
  {
    title: "Tests Failed",
    key: "failed",
    icon: XCircle,
    color: "pink",
    description: "Failed executions",
  },
  {
    title: "Pass Rate",
    key: "passRate",
    icon: TrendingUp,
    color: "violet",
    description: "Of executed test cases",
    suffix: "%",
  },
];

const colorStyles = {
  purple: "bg-purple-100 text-purple-600",
  blue: "bg-blue-100 text-blue-600",
  indigo: "bg-indigo-100 text-indigo-600",
  green: "bg-green-100 text-green-600",
  pink: "bg-pink-100 text-pink-600",
  violet: "bg-violet-100 text-violet-600",
};

function Reports() {
  const [reportData, setReportData] = useState(getReportData);
  const [selectedProjectId, setSelectedProjectId] = useState("all");

  useEffect(() => {
    const refresh = () => setReportData(getReportData());

    window.addEventListener("storage", refresh);
    window.addEventListener("spec2test-projects-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("spec2test-projects-updated", refresh);
    };
  }, []);

  const activeProject =
    selectedProjectId === "all"
      ? null
      : reportData.projects.find(
          (project) => String(project.id) === selectedProjectId
        );

  const projectReport = (() => {
    if (!activeProject) return null;

    const results = activeProject.analysisResults;
    const testCases = results?.test_cases?.test_cases || [];

    const statuses = JSON.parse(
      localStorage.getItem(`spec2test_status_${activeProject.id}`) || "{}"
    );

    let passed = 0;
    let failed = 0;
    let notRun = 0;

    testCases.forEach((test) => {
      const status = statuses[test.test_case_id] || "Not Run";

      if (status === "Passed") passed++;
      else if (status === "Failed") failed++;
      else notRun++;
    });

    const executed = passed + failed;

    return {
      total: testCases.length,
      passed,
      failed,
      notRun,
      executed,
      passRate: executed > 0 ? Math.round((passed / executed) * 100) : 0,
      risks: results?.risk_assessment?.risks || [],
      requirements: results?.analysis?.functional_requirements || [],
      missingDetails: results?.analysis?.missing_details || [],
      ambiguities: results?.analysis?.ambiguous_requirements || [],
      coverageGaps: results?.coverage_gaps || results?.analysis?.coverage_gaps || [],
    };
  })();

  const { stats, executionData, riskData } = reportData;
  const executed = stats.passed + stats.failed;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#211A4B]">Reports</h1>
          <p className="mt-2 text-[#81769F]">
            Generate insights and review your testing performance.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-[#211A4B]">
            Select Project Report
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm text-[#211A4B] outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100 md:max-w-md"
          >
            <option value="all">All Projects — Overall Report</option>
            {reportData.projects.map((project) => (
              <option key={project.id} value={String(project.id)}>
                {project.title || project.requirementTitle || project.name || "Untitled Project"}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#211A4B]">
            Testing Overview
          </h2>
          <p className="mt-1 text-sm text-[#81769F]">
            Overall performance across all your projects.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.key}
                className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#81769F]">
                      {card.title}
                    </p>
                    <h3 className="mt-3 text-3xl font-bold text-[#211A4B]">
                      {stats[card.key]}{card.suffix || ""}
                    </h3>
                    <p className="mt-2 text-xs text-[#958BAC]">
                      {card.description}
                    </p>
                  </div>

                  <div className={`rounded-xl p-3 ${colorStyles[card.color]}`}>
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Execution Results Chart */}
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#211A4B]">
              Test Execution Results
            </h2>
            <p className="mt-1 text-sm text-[#81769F]">
              Overall status of generated test cases
            </p>

            <div className="relative mt-4 h-[280px]">
              {stats.totalTestCases > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={executionData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={72}
                      outerRadius={105}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {executionData.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="h-[190px] w-[190px] rounded-full border-[18px] border-purple-100" />
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#211A4B]">
                  {stats.totalTestCases}
                </span>
                <span className="text-xs text-[#81769F]">Total Tests</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {executionData.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-[#81769F]">{item.name}</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-[#211A4B]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Risk Distribution Chart */}
          <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#211A4B]">
              Risk Distribution
            </h2>
            <p className="mt-1 text-sm text-[#81769F]">
              Risk severity across analyzed projects
            </p>

            <div className="mt-6 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={riskData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" />
                  <XAxis dataKey="name" tick={{ fill: "#81769F" }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#81769F" }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Risks" radius={[8, 8, 0, 0]}>
                    {riskData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {riskData.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-[#81769F]">{item.name}</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-[#211A4B]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#211A4B]">Execution Summary</h2>
          <p className="mt-1 text-sm text-[#81769F]">
            {executed} of {stats.totalTestCases} test cases have been executed.
          </p>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-purple-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all duration-500"
              style={{
                width: `${stats.totalTestCases > 0 ? (executed / stats.totalTestCases) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-sm">
            <span className="text-[#81769F]">
              Execution Progress: {stats.totalTestCases > 0 ? Math.round((executed / stats.totalTestCases) * 100) : 0}%
            </span>
            <span className="font-semibold text-[#211A4B]">
              Pass Rate: {stats.passRate}%
            </span>
          </div>
        </div>
      </div>
            {projectReport && (
          <section className="mt-8 rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#211A4B]">Project Report</h2>
              <p className="mt-1 text-sm text-[#81769F]">
                Individual testing results for {activeProject.title || activeProject.requirementTitle || activeProject.name || "Selected Project"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {[
                { label: "Total Tests", value: projectReport.total, color: "text-purple-600" },
                { label: "Passed", value: projectReport.passed, color: "text-emerald-600" },
                { label: "Failed", value: projectReport.failed, color: "text-pink-600" },
                { label: "Not Run", value: projectReport.notRun, color: "text-violet-500" },
                { label: "Executed", value: projectReport.executed, color: "text-blue-600" },
                { label: "Pass Rate", value: `${projectReport.passRate}%`, color: "text-indigo-600" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-purple-50/70 p-4">
                  <p className="text-sm text-[#81769F]">{item.label}</p>
                  <p className={`mt-2 text-2xl font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-[#81769F]">Execution Progress</span>
                <span className="font-semibold text-[#211A4B]">
                  {projectReport.total > 0
                    ? Math.round((projectReport.executed / projectReport.total) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-purple-100">
                {projectReport.total > 0 && (
                  <>
                    <div className="bg-emerald-400 transition-all" style={{ width: `${(projectReport.passed / projectReport.total) * 100}%` }} />
                    <div className="bg-pink-400 transition-all" style={{ width: `${(projectReport.failed / projectReport.total) * 100}%` }} />
                  </>
                )}
              </div>
            </div>
          </section>
        )}
        {projectReport && (
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-[#211A4B]">Risk Analysis</h2>
              {projectReport.risks.length > 0 ? (
                <div className="space-y-3">
                  {projectReport.risks.map((risk, index) => (
                    <div key={index} className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#211A4B]">
                          {risk.title || risk.risk || risk.description || `Risk ${index + 1}`}
                        </span>
                        {risk.severity && (
                          <span className="rounded-full bg-pink-100 px-2 py-1 text-xs font-semibold text-pink-700">
                            {risk.severity}
                          </span>
                        )}
                      </div>
                      {risk.mitigation && (
                        <p className="text-sm text-[#81769F]">
                          <span className="font-medium">Mitigation:</span> {risk.mitigation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#81769F]">No risk data available.</p>
              )}
            </section>

            <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-[#211A4B]">Missing Requirements Details</h2>
              {projectReport.missingDetails.length > 0 ? (
                <ul className="space-y-3">
                  {projectReport.missingDetails.map((item, index) => (
                    <li key={index} className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                      {typeof item === "string" ? item : item.description || item.detail || item.title || JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#81769F]">No missing details identified.</p>
              )}
            </section>

            <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-[#211A4B]">Ambiguous Requirements</h2>
              {projectReport.ambiguities.length > 0 ? (
                <ul className="space-y-3">
                  {projectReport.ambiguities.map((item, index) => (
                    <li key={index} className="rounded-xl bg-violet-50 p-4 text-sm text-violet-900">
                      {typeof item === "string" ? item : item.description || item.requirement || item.title || JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#81769F]">No ambiguous requirements identified.</p>
              )}
            </section>

            <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-[#211A4B]">Coverage Gaps</h2>
              {projectReport.coverageGaps.length > 0 ? (
                <ul className="space-y-3">
                  {projectReport.coverageGaps.map((item, index) => (
                    <li key={index} className="rounded-xl bg-pink-50 p-4 text-sm text-pink-900">
                      {typeof item === "string" ? item : item.description || item.gap || item.requirement || item.title || JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#81769F]">No coverage gaps reported.</p>
              )}
            </section>
          </div>
        )}
</DashboardLayout>
  );
}

export default Reports;





