import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Laptop,
  Eye,
  MoreVertical,
  ArrowRight,
  Sparkles,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { userStorage } from "../utils/userStorage";

function RecentProjects({ searchTerm = "" }) {
  const navigate = useNavigate();

  const [projects, setProjects] = useState(() =>
    JSON.parse(userStorage.getItem("spec2test_projects") || "[]")
  );

  const [menuId, setMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const saveProjects = (updated) => {
    setProjects(updated);
    userStorage.setItem("spec2test_projects", JSON.stringify(updated));
    window.dispatchEvent(new Event("spec2test-projects-updated"));
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const startRename = (project) => {
    setEditingId(project.id);
    setEditName(project.projectName);
    setMenuId(null);
  };

  const saveRename = (id) => {
    if (!editName.trim()) return;

    saveProjects(
      projects.map((p) =>
        p.id === id ? { ...p, projectName: editName.trim() } : p
      )
    );

    setEditingId(null);
  };

  const deleteProject = (id) => {
    saveProjects(projects.filter((p) => p.id !== id));
    setDeleteId(null);
    setMenuId(null);
  };

  // Live search
  const filteredProjects = projects.filter((project) => {
    const search = searchTerm.toLowerCase().trim();

    return (
      project.projectName?.toLowerCase().includes(search) ||
      project.requirementTitle?.toLowerCase().includes(search) ||
      project.description?.toLowerCase().includes(search)
    );
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white/90 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-100 px-5 py-4">
        <h2 className="flex items-center gap-3 text-lg font-bold text-[#211A4B]">
          <Star size={22} className="text-orange-400" />
          Recent Projects
        </h2>

        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-sm font-semibold text-[#7950D7] hover:text-purple-900"
        >
          View All
          <ArrowRight size={17} />
        </button>
      </div>

      {/* Projects table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[550px] text-left">

          <thead className="bg-[#F8F5FF] text-xs font-semibold text-[#554A7B]">
            <tr>
              <th className="px-5 py-3">Project Name</th>
              <th className="px-4 py-3">Created On</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-5 py-12 text-center">
                  <Sparkles
                    className="mx-auto mb-3 text-purple-400"
                    size={28}
                  />

                  <p className="text-sm font-medium text-[#35265E]">
                    {searchTerm.trim()
                      ? "No matching projects found"
                      : "No projects yet"}
                  </p>

                  <p className="mt-1 text-xs text-[#756A92]">
                    {searchTerm.trim()
                      ? "Try another project name or keyword."
                      : "Create your first project to get started."}
                  </p>
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-t border-purple-50 transition hover:bg-purple-50/50"
                >
                  {/* Project name */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                        <Laptop size={20} />
                      </div>

                      {editingId === project.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRename(project.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="w-40 rounded-lg border border-purple-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-purple-100"
                          />

                          <button
                            onClick={() => saveRename(project.id)}
                            className="rounded p-1 text-green-600 hover:bg-green-50"
                            title="Save"
                          >
                            <Check size={16} />
                          </button>

                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded p-1 text-gray-500 hover:bg-gray-100"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="whitespace-nowrap text-sm font-semibold text-[#211A4B]">
                          {project.projectName}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Created date */}
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[#62588A]">
                    {formatDate(project.createdAt)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className="whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      {project.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">

                      <button
                        onClick={() =>
                          navigate(`/project/${project.id}`, {
                            state: { project },
                          })
                        }
                        className="rounded-full border border-purple-200 px-3 py-1.5 text-xs font-semibold text-[#35265E] hover:bg-purple-100"
                      >
                        <Eye size={14} className="inline mr-1" />
                        View
                      </button>

                      {/* Options menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuId(
                              menuId === project.id ? null : project.id
                            )
                          }
                          className="rounded-lg p-1.5 text-[#62588A] hover:bg-purple-100"
                          title="Project options"
                        >
                          <MoreVertical size={17} />
                        </button>

                        {menuId === project.id && (
                          <div className="absolute right-0 z-20 mt-1 w-36 rounded-xl border border-purple-100 bg-white p-1 shadow-lg">

                            <button
                              onClick={() => startRename(project)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#35265E] hover:bg-purple-50"
                            >
                              <Pencil size={15} />
                              Rename
                            </button>

                            <button
                              onClick={() => {
                                setDeleteId(project.id);
                                setMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>

                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete confirmation */}
                    {deleteId === project.id && (
                      <div className="mt-2 rounded-lg border border-red-100 bg-red-50 p-2">
                        <p className="text-xs text-red-700">
                          Delete this project?
                        </p>

                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                          >
                            Delete
                          </button>

                          <button
                            onClick={() => setDeleteId(null)}
                            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

    </section>
  );
}

export default RecentProjects;