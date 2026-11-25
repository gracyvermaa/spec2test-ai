import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FolderOpen,
  Plus,
  FileText,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Layers,
  Sparkles,
  SearchX,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import "./Projects.css";
import { userStorage } from "../utils/userStorage";

function loadProjects() {
  try {
    const data = JSON.parse(userStorage.getItem("spec2test_projects") || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// done = analysis finished, busy = running, pending = everything else
const statusKind = (status = "") =>
  /complete/i.test(status) ? "done" : /analy[sz]ing/i.test(status) ? "busy" : "pending";

const initials = (name = "") =>
  name.trim().slice(0, 2).toUpperCase() || "P";

const hueFor = (text = "") =>
  [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

function Projects() {
  const navigate = useNavigate();
  const projects = useMemo(() => loadProjects(), []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const statuses = useMemo(
    () => ["All", ...new Set(projects.map((p) => p.status).filter(Boolean))],
    [projects]
  );

  const countFor = (s) =>
    s === "All" ? projects.length : projects.filter((p) => p.status === s).length;

  const analyzed = projects.filter((p) => statusKind(p.status) === "done").length;
  const pending = projects.length - analyzed;

  const visible = projects.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchesText =
      !q ||
      (p.projectName || "").toLowerCase().includes(q) ||
      (p.requirementTitle || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesText && matchesStatus;
  });

  const openProject = (project) =>
    navigate(`/project/${project.id}`, { state: { project } });

  return (
    <DashboardLayout>
      <div className="pj-page">
        <div className="pj-wrap">
          {/* Banner */}
          <header className="pj-hero">
            <div className="pj-hero-text">
              <span className="pj-eyebrow">
                <FolderOpen size={16} /> PROJECT WORKSPACE
              </span>
              <h1>All Projects</h1>
              <p>Manage and track all your AI testing projects.</p>

              <div className="pj-chips">
                <span className="pj-chip">
                  <Layers size={16} /> <b>{projects.length}</b> Total
                </span>
                <span className="pj-chip">
                  <CheckCircle2 size={16} /> <b>{analyzed}</b> Analyzed
                </span>
                <span className="pj-chip">
                  <Clock3 size={16} /> <b>{pending}</b> Pending
                </span>
              </div>
            </div>

            <button className="pj-new" onClick={() => navigate("/new-project")}>
              <Plus size={18} /> New Project
            </button>
          </header>

          {projects.length === 0 ? (
            <div className="pj-empty">
              <span className="pj-empty-icon">
                <Sparkles size={36} />
              </span>
              <h3>No projects yet</h3>
              <p>Create a project to get started.</p>
              <button className="pj-view" onClick={() => navigate("/new-project")}>
                Create Project <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="pj-bar">
                <label className="pj-search">
                  <Search size={18} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by project or requirement..."
                  />
                </label>

                <div className="pj-pills">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      className={`pj-pill ${statusFilter === s ? "is-on" : ""}`}
                      onClick={() => setStatusFilter(s)}
                    >
                      {s} <em>{countFor(s)}</em>
                    </button>
                  ))}
                </div>
              </div>

              <p className="pj-count">
                Showing {visible.length} of {projects.length} projects
              </p>

              {/* List */}
              {visible.length === 0 ? (
                <div className="pj-empty">
                  <span className="pj-empty-icon">
                    <SearchX size={34} />
                  </span>
                  <h3>No matching projects</h3>
                  <p>Try a different search term or status.</p>
                </div>
              ) : (
                <div className="pj-list">
                  {visible.map((project, i) => {
                    const kind = statusKind(project.status);
                    return (
                      <article
                        key={project.id}
                        className="pj-item"
                        style={{ "--i": i, "--h": hueFor(project.projectName) }}
                        onClick={() => openProject(project)}
                      >
                        <div className="pj-avatar">{initials(project.projectName)}</div>

                        <div className="pj-info">
                          <h3>{project.projectName}</h3>
                          <p className="pj-req">
                            <FileText size={14} /> {project.requirementTitle}
                          </p>
                          <p className="pj-date">
                            <CalendarDays size={13} />
                            {new Date(project.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <span className={`pj-badge ${kind}`}>{project.status}</span>

                        <button
                          className="pj-view"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProject(project);
                          }}
                        >
                          View <ArrowRight size={16} />
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Projects;
