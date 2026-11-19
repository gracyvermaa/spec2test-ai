
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";

function NewProject() {
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [requirementTitle, setRequirementTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!projectName.trim() || !requirementTitle.trim() || !description.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const project = {
      id: Date.now(),
      projectName,
      requirementTitle,
      description,
      createdAt: new Date().toISOString(),
      status: "Pending Analysis",
    };

    const existingProjects = JSON.parse(
      localStorage.getItem("spec2test_projects") || "[]"
    );

    localStorage.setItem(
      "spec2test_projects",
      JSON.stringify([project, ...existingProjects])
    );
    window.dispatchEvent(new Event("spec2test-projects-updated"));

    navigate("/dashboard", { state: { newProject: project } });
  };

  return (
    <div className="min-h-screen bg-[#F8F6FF] p-6 md:p-10">

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-8 flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-purple-600">
            <Sparkles size={20} />
            <span className="text-sm font-semibold">
              AI TESTING WORKSPACE
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[#211A4B]">
            Create New Project
          </h1>

          <p className="mt-2 text-[#756A92]">
            Describe your software requirements and let AI
            generate test cases and identify risks.
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
              <FileText size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-[#211A4B]">
                Project Requirements
              </h2>
              <p className="text-xs text-purple-500">
                Provide details for better AI results
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-[#35265E]">
                Project Name
              </label>

              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. User Authentication System"
                required
                className="w-full rounded-xl border border-purple-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#35265E]">
                Requirement Title
              </label>

              <input
                type="text"
                value={requirementTitle}
                onChange={(e) => setRequirementTitle(e.target.value)}
                placeholder="e.g. Secure user login"
                required
                className="w-full rounded-xl border border-purple-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#35265E]">
                Requirement Description
              </label>

              <textarea
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how the feature should work, expected behavior, rules, validations, and edge cases..."
                required
                className="w-full resize-y rounded-xl border border-purple-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Sparkles size={18} />
              {loading ? "Creating Project..." : "Analyze Requirements with AI"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default NewProject;
