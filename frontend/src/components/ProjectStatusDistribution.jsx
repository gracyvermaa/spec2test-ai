import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const CATEGORIES = [
  { name: "Draft", color: "#C4B5FD" },
  { name: "Analyzed", color: "#8B5CF6" },
  { name: "Test Cases Generated", color: "#60A5FA" },
  { name: "High Risk", color: "#F0ABFC" },
  { name: "Needs Review", color: "#F59E0B" },
  { name: "Ready for Execution", color: "#34D399" },
  { name: "Completed", color: "#A78BFA" },
];

function classifyProject(project) {
  const results = project.analysisResults;

  if (!results) return "Draft";

  const analysis = results.analysis;
  const tests = results.test_cases?.test_cases || [];
  const riskLevel = String(
    results.risk_assessment?.overall_risk_level || ""
  ).toLowerCase();

  const missingDetails = analysis?.missing_details || [];
  const ambiguities = analysis?.ambiguous_requirements || [];

  const statuses = JSON.parse(
    localStorage.getItem(`spec2test_status_${project.id}`) || "{}"
  );

  const executed = tests.filter((test) =>
    ["Passed", "Failed"].includes(statuses[test.test_case_id])
  ).length;

  if (tests.length > 0 && executed === tests.length) {
    return "Completed";
  }

  if (riskLevel === "high" || riskLevel === "critical") {
    return "High Risk";
  }

  if (missingDetails.length > 0 || ambiguities.length > 0) {
    return "Needs Review";
  }

  if (!tests.length) {
    return analysis ? "Analyzed" : "Draft";
  }

  if (executed > 0 || !results.risk_assessment) {
    return "Test Cases Generated";
  }

  return "Ready for Execution";
}

function getProjectStatusData() {
  const projects = JSON.parse(
    localStorage.getItem("spec2test_projects") || "[]"
  );

  const counts = Object.fromEntries(
    CATEGORIES.map((category) => [category.name, 0])
  );

  projects.forEach((project) => {
    const status = classifyProject(project);
    counts[status] += 1;
  });

  return CATEGORIES.map((category) => ({
    ...category,
    value: counts[category.name],
  }));
}

function ProjectStatusDistribution() {
  const [data, setData] = useState(getProjectStatusData);

  useEffect(() => {
    const refresh = () => setData(getProjectStatusData());

    window.addEventListener("storage", refresh);
    window.addEventListener("spec2test-projects-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("spec2test-projects-updated", refresh);
    };
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.filter((item) => item.value > 0);

  return (
    <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-[#211A4B]">
          Project Lifecycle Overview
        </h2>
        <p className="mt-1 text-sm text-[#81769F]">
          Distribution of projects across their testing lifecycle
        </p>
      </div>

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
        {/* Donut Chart */}
        <div className="relative h-[240px] w-full max-w-[280px]">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={3}
                  stroke="none"
                >
                  {chartData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E9D5FF",
                    boxShadow: "0 4px 15px rgba(139,92,246,0.12)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="h-[190px] w-[190px] rounded-full border-[18px] border-[#F3E8FF]" />
            </div>
          )}

          {/* Center Label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[#211A4B]">
              {total}
            </span>
            <span className="text-xs text-[#81769F]">
              Total Projects
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-3">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-[#756A92]">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#211A4B]">
                  {item.value}
                </span>
                <span className="text-xs text-[#958BAC]">
                  {total > 0
                    ? `${Math.round((item.value / total) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectStatusDistribution;
