import { useEffect, useState } from "react";
import {
  FolderKanban,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import { userStorage } from "../utils/userStorage";

function getDashboardStats() {
  const projects = JSON.parse(
    userStorage.getItem("spec2test_projects") || "[]"
  );

  let totalTestCases = 0;
  let passed = 0;
  let failed = 0;

  projects.forEach((project) => {
    const testCases =
      project.analysisResults?.test_cases?.test_cases || [];

    totalTestCases += testCases.length;

    const statuses = JSON.parse(
      userStorage.getItem(`spec2test_status_${project.id}`) || "{}"
    );

    testCases.forEach((test) => {
      const status = statuses[test.test_case_id];

      if (status === "Passed") passed++;
      if (status === "Failed") failed++;
    });
  });

  const executed = passed + failed;
  const notRun = totalTestCases - executed;

  return {
    totalProjects: projects.length,
    totalTestCases,
    passed,
    failed,
    executed,
    notRun,
    executionRate: totalTestCases
      ? Math.round((executed / totalTestCases) * 100)
      : 0,
  };
}

function DashboardStats() {
  const [stats, setStats] = useState(getDashboardStats);

  useEffect(() => {
    const refreshStats = () => setStats(getDashboardStats());

    window.addEventListener("storage", refreshStats);
    window.addEventListener("spec2test-projects-updated", refreshStats);

    return () => {
      window.removeEventListener("storage", refreshStats);
      window.removeEventListener("spec2test-projects-updated", refreshStats);
    };
  }, []);

  const cards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      subtitle: "Projects created",
      icon: FolderKanban,
      color: "text-purple-600",
      bg: "bg-[#F3E8FF]",
    },
    {
      title: "Total Test Cases",
      value: stats.totalTestCases,
      subtitle: "Across all projects",
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Tests Passed",
      value: stats.passed,
      subtitle: "Successfully passed",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Tests Failed",
      value: stats.failed,
      subtitle: "Need attention",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Main Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#756A92]">
                    {card.title}
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-[#211A4B]">
                    {card.value}
                  </h3>
                </div>

                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                  <Icon size={23} className={card.color} />
                </div>
              </div>

              <p className="mt-3 text-xs text-[#81769F]">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </section>

      {/* Execution Progress */}
      <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-purple-600" />
              <h2 className="text-lg font-bold text-[#211A4B]">
                Execution Progress
              </h2>
            </div>

            <p className="mt-1 text-sm text-[#81769F]">
              Overall test execution across all projects
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-3xl font-bold text-[#7950D7]">
              {stats.executionRate}%
            </p>
            <p className="text-xs text-[#81769F]">
              {stats.executed} of {stats.totalTestCases} executed
            </p>
          </div>
        </div>

        {/* Magical Progress Meter */}
        <div className="mt-6">
          <div className="relative h-5 overflow-hidden rounded-full border border-[#E8D8FF] bg-[#F3E9FF] shadow-inner">

            {/* Passed segment */}
            <div
              className="absolute left-0 top-0 h-full rounded-l-full bg-gradient-to-r from-[#D8B4FE] via-[#A78BFA] to-[#8B5CF6] shadow-[0_0_12px_rgba(167,139,250,0.6)] transition-all duration-700"
              style={{
                width: `${(stats.passed / (stats.totalTestCases || 1)) * 100}%`,
              }}
            />

            {/* Failed segment */}
            <div
              className="absolute top-0 h-full bg-gradient-to-r from-[#F0ABFC] via-[#E879F9] to-[#C084FC] shadow-[0_0_12px_rgba(232,121,249,0.5)] transition-all duration-700"
              style={{
                left: `${(stats.passed / (stats.totalTestCases || 1)) * 100}%`,
                width: `${(stats.failed / (stats.totalTestCases || 1)) * 100}%`,
              }}
            />

            {/* Glossy highlight */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 via-transparent to-purple-300/10 pointer-events-none" />

            {/* Progress diamond */}
            {stats.executed > 0 && (
              <div
                className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                style={{ left: `${stats.executionRate}%` }}
              >
                <div className="h-3 w-3 rotate-45 rounded-[2px] border border-white bg-[#FDF4FF] shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
              </div>
            )}
          </div>
        </div>
        {/* Status breakdown */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Passed
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-green-700">
              {stats.passed}
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <XCircle size={17} className="text-red-600" />
              <span className="text-sm font-medium text-red-700">
                Failed
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-red-700">
              {stats.failed}
            </p>
          </div>

          <div className="rounded-xl bg-purple-50 p-4">
            <div className="flex items-center gap-2">
              <ClipboardList size={17} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Not Run
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-purple-700">
              {stats.notRun}
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}

export default DashboardStats;