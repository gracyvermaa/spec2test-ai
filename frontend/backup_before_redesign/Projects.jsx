import { useNavigate } from "react-router-dom";
import { ArrowLeft, FolderOpen, Eye, Sparkles } from "lucide-react";

function Projects() {
  const navigate = useNavigate();

  const projects = JSON.parse(
    localStorage.getItem("spec2test_projects") || "[]"
  );

  return (
    <div className="min-h-screen bg-[#F8F6FF] p-6 md:p-10">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-8 flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-purple-600">
            <FolderOpen size={20} />
            <span className="text-sm font-semibold">PROJECT WORKSPACE</span>
          </div>

          <h1 className="text-3xl font-bold text-[#211A4B]">
            All Projects
          </h1>

          <p className="mt-2 text-[#756A92]">
            Manage and track all your AI testing projects.
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-white shadow-sm">
          {projects.length === 0 ? (
            <div className="py-16 text-center">
              <Sparkles size={35} className="mx-auto mb-3 text-purple-400" />
              <h3 className="font-semibold text-[#35265E]">No projects yet</h3>
              <p className="mt-2 text-sm text-[#756A92]">
                Create a project to get started.
              </p>
              <button
                onClick={() => navigate("/new-project")}
                className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="divide-y divide-purple-50">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-[#211A4B]">
                      {project.projectName}
                    </h3>

                    <p className="mt-1 text-sm text-[#756A92]">
                      {project.requirementTitle}
                    </p>

                    <p className="mt-2 text-xs text-[#9185AE]">
                      {new Date(project.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      {project.status}
                    </span>

                    <button
                      onClick={() =>
                        navigate(`/project/${project.id}`, {
                          state: { project },
                        })
                      }
                      className="flex items-center gap-2 rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Projects;
