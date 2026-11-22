import { useLocation, useNavigate } from "react-router-dom";
import {
  House,
  LayoutDashboard,
  FolderKanban,
  ClipboardCheck,
  PlayCircle,
  FileBarChart,
  Settings,
  Sparkles,
  CircleHelp,
} from "lucide-react";
import "../pages/Dashboard.css";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "My Projects", icon: FolderKanban, path: "/projects" },
  { name: "Test Cases", icon: ClipboardCheck, path: "/test-cases" },
  { name: "Execution Results", icon: PlayCircle, path: "/execution" },
  { name: "Reports", icon: FileBarChart, path: "/reports" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (item) =>
    item.path &&
    (location.pathname === item.path ||
      (item.path === "/projects" && location.pathname.startsWith("/project/")));

  return (
    <aside className="dash-side">
      <div className="dash-brand">
        <div className="dash-logo">
          <Sparkles size={24} />
        </div>
        <div>
          <b>Spec2Test</b>
          <small>AI Testing Studio</small>
        </div>
      </div>

      <button
        onClick={() => navigate("/")}
        className="dash-nav-item mb-5"
        title="Go to Landing Page"
      >
        <House size={19} />
        Home
      </button>

      <p className="dash-label">Workspace</p>

      <nav className="flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => item.path && navigate(item.path)}
              className={`dash-nav-item ${isActive(item) ? "is-active" : ""}`}
            >
              <Icon size={19} />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1.5 pt-6">
        <button onClick={() => navigate("/help-support")} className="dash-nav-item"><CircleHelp size={19} />
          Help &amp; Support
        </button>
        <button onClick={() => navigate("/settings")} className="dash-nav-item"><Settings size={19} />
          Settings
        </button>

        <div className="dash-promo">
          <p className="text-sm font-semibold">Spec2Test AI</p>
          <p className="mt-1 text-xs text-purple-300">Intelligent testing, simplified.</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-purple-200">
            <Sparkles size={14} className="spark" />
            Powered by AI
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;



