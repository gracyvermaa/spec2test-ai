import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  Plus,
  FolderOpen,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { userStorage } from "../utils/userStorage";

const PROJECTS_KEY = "spec2test_projects";

const loadProjects = () =>
  JSON.parse(userStorage.getItem(PROJECTS_KEY) || "[]");

function TestCases() {
  const [projects, setProjects] = useState(loadProjects);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  const [statuses, setStatuses] = useState(() => {
    const saved = {};
    loadProjects().forEach((project) => {
      saved[project.id] = JSON.parse(
        userStorage.getItem(`spec2test_status_${project.id}`) || "{}"
      );
    });
    return saved;
  });

  useEffect(() => {
    const refresh = () => {
      const latestProjects = loadProjects();
      setProjects(latestProjects);

      const latestStatuses = {};
      latestProjects.forEach((project) => {
        latestStatuses[project.id] = JSON.parse(
          userStorage.getItem(`spec2test_status_${project.id}`) || "{}"
        );
      });
      setStatuses(latestStatuses);
    };

    window.addEventListener("spec2test-projects-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("spec2test-projects-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const testCases = useMemo(() => {
    return projects.flatMap((project) => {
      const cases =
        project.analysisResults?.test_cases?.test_cases || [];

      return cases.map((test) => ({
        ...test,
        projectId: project.id,
        projectName: project.projectName,
        requirementTitle: project.requirementTitle,
        status:
          statuses[project.id]?.[test.test_case_id] || "Not Run",
      }));
    });
  }, [projects, statuses]);

  const filtered = testCases.filter((test) => {
    const text = [
      test.test_case_id,
      test.title,
      test.description,
      test.projectName,
      test.requirementTitle,
    ]
      .join(" ")
      .toLowerCase();

    return (
      text.includes(search.toLowerCase()) &&
      (projectFilter === "All" ||
        String(test.projectId) === projectFilter) &&
      (priorityFilter === "All" ||
        test.priority === priorityFilter) &&
      (statusFilter === "All" || test.status === statusFilter)
    );
  });

  const counts = {
    total: testCases.length,
    passed: testCases.filter((t) => t.status === "Passed").length,
    failed: testCases.filter((t) => t.status === "Failed").length,
    notRun: testCases.filter((t) => t.status === "Not Run").length,
  };

  const saveProjects = (updated) => {
    userStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
    setProjects(updated);
    window.dispatchEvent(new Event("spec2test-projects-updated"));
  };

  const updateStatus = (test) => {
    const newStatus =
      test.status === "Not Run"
        ? "Passed"
        : test.status === "Passed"
          ? "Failed"
          : "Not Run";

    const projectStatuses = {
      ...(statuses[test.projectId] || {}),
      [test.test_case_id]: newStatus,
    };

    userStorage.setItem(
      `spec2test_status_${test.projectId}`,
      JSON.stringify(projectStatuses)
    );

    setStatuses((prev) => ({
      ...prev,
      [test.projectId]: projectStatuses,
    }));

    window.dispatchEvent(new Event("spec2test-projects-updated"));
  };

  const openDetails = (test) => {
    setSelected(test);
    setDraft({
      ...test,
      test_steps: [...(test.test_steps || [])],
      preconditions: [...(test.preconditions || [])],
      test_data: [...(test.test_data || [])],
    });
    setEditing(false);
  };

  const saveEdit = () => {
    const updatedProjects = projects.map((project) => {
      if (String(project.id) !== String(draft.projectId)) {
        return project;
      }

      const updatedCases =
        project.analysisResults.test_cases.test_cases.map((test) =>
          test.test_case_id === draft.test_case_id
            ? {
                test_case_id: test.test_case_id,
                title: draft.title.trim(),
                description: draft.description.trim(),
                test_type: draft.test_type,
                preconditions: draft.preconditions,
                test_steps: draft.test_steps,
                test_data: draft.test_data,
                expected_result: draft.expected_result.trim(),
                priority: draft.priority,
              }
            : test
        );

      return {
        ...project,
        analysisResults: {
          ...project.analysisResults,
          test_cases: {
            ...project.analysisResults.test_cases,
            test_cases: updatedCases,
            total_test_cases: updatedCases.length,
          },
        },
      };
    });

    saveProjects(updatedProjects);
    setSelected({
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      expected_result: draft.expected_result.trim(),
    });
    setEditing(false);
  };

  const deleteTest = (test) => {
    const confirmed = window.confirm(
      `Delete ${test.test_case_id} — ${test.title}? This cannot be undone.`
    );

    if (!confirmed) return;

    const updatedProjects = projects.map((project) => {
      if (String(project.id) !== String(test.projectId)) {
        return project;
      }

      const updatedCases =
        project.analysisResults.test_cases.test_cases.filter(
          (item) => item.test_case_id !== test.test_case_id
        );

      return {
        ...project,
        analysisResults: {
          ...project.analysisResults,
          test_cases: {
            ...project.analysisResults.test_cases,
            test_cases: updatedCases,
            total_test_cases: updatedCases.length,
          },
        },
      };
    });

    saveProjects(updatedProjects);

    setSelected(null);
    setEditing(false);
  };

  const exportCSV = () => {
    const headers = [
      "Test Case ID",
      "Project",
      "Title",
      "Type",
      "Priority",
      "Status",
      "Description",
      "Expected Result",
      "Test Steps",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filtered.map((test) => [
      test.test_case_id,
      test.projectName,
      test.title,
      test.test_type,
      test.priority,
      test.status,
      test.description,
      test.expected_result,
      (test.test_steps || []).join(" | "),
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spec2test-all-test-cases.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const priorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const statusStyle = (status) => {
    switch (status) {
      case "Passed":
        return "bg-green-100 text-green-700";
      case "Failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F8F6FF] p-6 md:p-9">
        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-purple-600">
              <ClipboardCheck size={20} />
              <span className="text-xs font-bold tracking-widest">
                TEST MANAGEMENT
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#211A4B]">
              Test Cases
            </h1>
            <p className="mt-1 text-sm text-[#756A92]">
              Manage, review, and track test cases across your projects.
            </p>
          </div>

          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Test Cases",
              value: counts.total,
              icon: ClipboardCheck,
              color: "text-purple-600",
            },
            {
              label: "Passed",
              value: counts.passed,
              icon: CheckCircle2,
              color: "text-green-600",
            },
            {
              label: "Failed",
              value: counts.failed,
              icon: XCircle,
              color: "text-red-600",
            },
            {
              label: "Not Run",
              value: counts.notRun,
              icon: Clock,
              color: "text-amber-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#756A92]">
                    {stat.label}
                  </span>
                  <Icon size={19} className={stat.color} />
                </div>
                <p className="mt-3 text-2xl font-bold text-[#211A4B]">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, title, description, project..."
              className={`${fieldClass} pl-10`}
            />
          </div>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className={fieldClass}
          >
            <option value="All">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={String(project.id)}>
                {project.projectName}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={fieldClass}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={fieldClass}
          >
            <option value="All">All Statuses</option>
            <option value="Not Run">Not Run</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-purple-50 px-5 py-4">
            <h2 className="font-semibold text-[#35265E]">
              All Test Cases
            </h2>
            <span className="text-sm text-[#756A92]">
              {filtered.length} of {testCases.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardCheck
                size={40}
                className="mx-auto mb-3 text-purple-300"
              />
              <h3 className="font-semibold text-[#35265E]">
                {testCases.length === 0
                  ? "No test cases generated yet"
                  : "No matching test cases"}
              </h3>
              <p className="mt-2 text-sm text-[#756A92]">
                {testCases.length === 0
                  ? "Create a project and run its analysis to generate test cases."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[#FAF8FF] text-xs uppercase tracking-wide text-[#756A92]">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Test Case</th>
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-purple-50">
                  {filtered.map((test) => (
                    <tr
                      key={`${test.projectId}-${test.test_case_id}`}
                      className="transition hover:bg-purple-50/50"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-purple-700">
                        {test.test_case_id}
                      </td>
                      <td className="max-w-sm px-5 py-4">
                        <p className="font-medium text-[#35265E]">
                          {test.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-[#756A92]">
                          {test.description}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#756A92]">
                        {test.projectName}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyle(test.priority)}`}
                        >
                          {test.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => updateStatus(test)}
                          title="Click to cycle status"
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(test.status)}`}
                        >
                          {test.status}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openDetails(test)}
                            title="View details"
                            className="rounded-lg border border-purple-200 p-2 text-purple-600 hover:bg-purple-50"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              openDetails(test);
                              setEditing(true);
                            }}
                            title="Edit test case"
                            className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteTest(test)}
                            title="Delete test case"
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details / Edit Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            setSelected(null);
            setEditing(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                  {selected.test_case_id} · {selected.projectName}
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#211A4B]">
                  {editing ? "Edit Test Case" : selected.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelected(null);
                  setEditing(false);
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    className={fieldClass}
                    value={draft.title}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className={fieldClass}
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      className={fieldClass}
                      value={draft.priority}
                      onChange={(e) =>
                        setDraft({ ...draft, priority: e.target.value })
                      }
                    >
                      {["Critical", "High", "Medium", "Low"].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Test Type
                    </label>
                    <input
                      className={fieldClass}
                      value={draft.test_type || ""}
                      onChange={(e) =>
                        setDraft({ ...draft, test_type: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Expected Result
                  </label>
                  <textarea
                    rows={3}
                    className={fieldClass}
                    value={draft.expected_result}
                    onChange={(e) =>
                      setDraft({ ...draft, expected_result: e.target.value })
                    }
                  />
                </div>

                {[
                  ["Test Steps", "test_steps"],
                  ["Preconditions", "preconditions"],
                  ["Test Data", "test_data"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {label} (one item per line)
                    </label>
                    <textarea
                      rows={4}
                      className={fieldClass}
                      value={(draft[key] || []).join("\n")}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          [key]: e.target.value
                            .split("\n")
                            .filter((line) => line.trim() !== ""),
                        })
                      }
                    />
                  </div>
                ))}

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    onClick={() => {
                      setEditing(false);
                      openDetails(selected);
                    }}
                    className="rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-semibold text-purple-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={!draft.title.trim()}
                    className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyle(selected.priority)}`}
                  >
                    {selected.priority} Priority
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(selected.status)}`}
                  >
                    {selected.status}
                  </span>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                    {selected.test_type || "Functional"}
                  </span>
                </div>

                <section>
                  <h3 className="mb-1 text-sm font-semibold text-[#35265E]">
                    Description
                  </h3>
                  <p className="text-sm leading-6 text-gray-600">
                    {selected.description || "No description provided."}
                  </p>
                </section>

                {[
                  ["Preconditions", selected.preconditions],
                  ["Test Steps", selected.test_steps],
                  ["Test Data", selected.test_data],
                ].map(([label, items]) => (
                  <section key={label}>
                    <h3 className="mb-2 text-sm font-semibold text-[#35265E]">
                      {label}
                    </h3>
                    {items?.length ? (
                      <ol className="space-y-2">
                        {items.map((item, index) => (
                          <li
                            key={index}
                            className="flex gap-3 rounded-lg bg-[#FAF8FF] p-3 text-sm text-gray-700"
                          >
                            <span className="font-semibold text-purple-600">
                              {index + 1}.
                            </span>
                            {item}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-gray-400">None provided.</p>
                    )}
                  </section>
                ))}

                <section className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <h3 className="mb-1 text-sm font-semibold text-green-800">
                    Expected Result
                  </h3>
                  <p className="text-sm leading-6 text-green-700">
                    {selected.expected_result}
                  </p>
                </section>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <Pencil size={15} />
                    Edit Test Case
                  </button>
                  <button
                    onClick={() => deleteTest(selected)}
                    className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default TestCases;