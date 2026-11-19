import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardCheck,
  PlayCircle,
  FileBarChart,
  Settings,
  Sparkles,
  ChevronLeft,
  CircleHelp
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "My Projects", icon: FolderKanban, path: "/projects" },
  { name: "Test Cases", icon: ClipboardCheck },
  { name: "Execution Results", icon: PlayCircle, path: "/execution" },
  { name: "Reports", icon: FileBarChart, path: "/reports" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="flex min-h-screen w-[250px] shrink-0 flex-col bg-[#242044] px-5 py-7 text-white">
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A78BFA]">
            <Sparkles size={25} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">Spec2Test</h1>
            <p className="text-xs text-purple-300">AI Testing Studio</p>
          </div>
        </div>
        <ChevronLeft size={18} className="text-purple-300" />
      </div>

      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-purple-300">
        Workspace
      </p>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <button
              key={item.name}
              onClick={() => item.path && navigate(item.path)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all ${
                active
                  ? "bg-[#8B72D9] font-semibold text-white shadow-lg shadow-purple-950/30"
                  : "text-purple-100 hover:bg-white/10"
              }`}
            >
              <Icon size={19} />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-purple-100 hover:bg-white/10">
          <CircleHelp size={19} />
          Help & Support
        </button>

        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-purple-100 hover:bg-white/10">
          <Settings size={19} />
          Settings
        </button>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">Spec2Test AI</p>
          <p className="mt-1 text-xs text-purple-300">
            Intelligent testing, simplified.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-purple-200">
            <Sparkles size={14} />
            Powered by AI
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

