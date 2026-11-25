import { useEffect, useMemo, useState } from "react";
import { Sparkles, ChartNoAxesColumnIncreasing } from "lucide-react";
import {
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { userStorage } from "../utils/userStorage";

const PROJECTS_KEY = "spec2test_projects";
const UPDATE_EVENT = "spec2test-projects-updated";

function readProjects() {
  try {
    return JSON.parse(userStorage.getItem(PROJECTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function getProjectMetrics(projects) {
  const analyzedProjects = projects.filter(
    (project) => project?.analysisResults
  );

  const totalTestCases = analyzedProjects.reduce((total, project) => {
    return total + (project.analysisResults?.test_cases?.test_cases?.length || 0);
  }, 0);

  let totalRisks = 0;
  let coveredRisks = 0;

  analyzedProjects.forEach((project) => {
    const results = project.analysisResults;
    const testCases = results?.test_cases?.test_cases || [];

    const testCaseIds = new Set(
      testCases
        .map((testCase) => testCase?.test_case_id ?? testCase?.id)
        .filter(Boolean)
        .map(String)
    );

    const risks = results?.risk_assessment?.risks || [];

    risks.forEach((risk) => {
      totalRisks += 1;

      const relatedCases = risk?.related_test_cases || [];

      const isCovered = relatedCases.some((related) => {
        const relatedId =
          typeof related === "object"
            ? related?.test_case_id ?? related?.id
            : related;

        return relatedId != null && testCaseIds.has(String(relatedId));
      });

      if (isCovered) coveredRisks += 1;
    });
  });

  const riskCoverage =
    totalRisks > 0
      ? Math.round((coveredRisks / totalRisks) * 100)
      : null;

  return {
    analyzedProjects: analyzedProjects.length,
    totalTestCases,
    riskCoverage,
  };
}

function getActivityData(projects) {
  const now = new Date();

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (5 - index),
      1
    );

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: date.toLocaleDateString("en-IN", { month: "short" }),
      count: 0,
    };
  });

  const monthIndex = new Map(
    months.map((month, index) => [month.key, index])
  );

  projects.forEach((project) => {
    if (!project?.analysisResults) return;

    // Older projects use createdAt if analyzedAt is not available.
    const dateValue = project.analyzedAt || project.createdAt;

    if (!dateValue) return;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const index = monthIndex.get(key);

    if (index !== undefined) {
      months[index].count += 1;
    }
  });

  return months;
}

function TestingImpact() {
  const [projects, setProjects] = useState(readProjects);

  useEffect(() => {
    const refreshProjects = () => setProjects(readProjects());

    window.addEventListener("storage", refreshProjects);
    window.addEventListener(UPDATE_EVENT, refreshProjects);

    return () => {
      window.removeEventListener("storage", refreshProjects);
      window.removeEventListener(UPDATE_EVENT, refreshProjects);
    };
  }, []);

  const metrics = useMemo(
    () => getProjectMetrics(projects),
    [projects]
  );

  const chartData = useMemo(
    () => getActivityData(projects),
    [projects]
  );

  const hasActivity = chartData.some((month) => month.count > 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-[#F0E7FF] to-[#FCEAFF] shadow-sm">

      <div className="flex items-center justify-between border-b border-purple-200/60 px-5 py-4">
        <h2 className="flex items-center gap-3 text-lg font-bold text-[#211A4B]">
          <ChartNoAxesColumnIncreasing
            size={23}
            className="text-purple-600"
          />
          Your Testing Impact
        </h2>

        <Sparkles size={22} className="text-orange-400" />
      </div>

      <div className="grid grid-cols-3 divide-x divide-purple-200/70 px-3 py-5">

        <div className="px-3">
          <h3 className="text-3xl font-bold text-[#17143E]">
            {metrics.totalTestCases}
          </h3>
          <p className="mt-1 text-sm text-[#62588A]">
            Test Cases
            <br />
            Generated
          </p>
        </div>

        <div className="px-3">
          <h3 className="text-3xl font-bold text-[#17143E]">
            {metrics.analyzedProjects}
          </h3>
          <p className="mt-1 text-sm text-[#62588A]">
            Projects
            <br />
            Analyzed
          </p>
        </div>

        <div className="px-3">
          <h3 className="text-3xl font-bold text-[#17143E]">
            {metrics.riskCoverage === null
              ? "—"
              : `${metrics.riskCoverage}%`}
          </h3>
          <p className="mt-1 text-sm text-[#62588A]">
            Risk
            <br />
            Coverage
          </p>
        </div>

      </div>

      <div className="h-[115px] px-3 pb-3">
        {hasActivity ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="coverageGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#8655E8"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="#8655E8"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <XAxis dataKey="month" hide />

              <Tooltip
                formatter={(value) => [value, "Projects analyzed"]}
                labelFormatter={(label) => label}
              />

              <Area
                type="monotone"
                dataKey="count"
                stroke="#8655E8"
                strokeWidth={2.5}
                fill="url(#coverageGradient)"
                dot={{
                  fill: "#8655E8",
                  stroke: "#fff",
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#62588A]">
            Analyze a project to see your testing activity
          </div>
        )}
      </div>

    </section>
  );
}

export default TestingImpact;
