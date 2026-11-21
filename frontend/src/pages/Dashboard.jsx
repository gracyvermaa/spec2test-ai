import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

import HeroSection from "../components/HeroSection";
import WorkflowSteps from "../components/WorkflowSteps";
import RecentProjects from "../components/RecentProjects";
import TestingImpact from "../components/TestingImpact";
import DashboardStats from "../components/DashboardStats";
import ProjectStatusDistribution from "../components/ProjectStatusDistribution";

import { Bell, Search, Sparkles } from "lucide-react";
import "./Dashboard.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardLayout>
      <div className="dash-page">
        <div className="mx-auto max-w-[1600px] p-5 md:p-8">
          {/* Top bar */}
          <header className="dash-rise mb-7 flex items-center justify-between" style={{ "--i": 0 }}>
            <div>
              <span className="dash-date">
                <i /> {today}
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#211A4B]">
                {getGreeting()}, <span className="dash-name">Gracy Verma</span>{" "}
                <span className="dash-wave">{"\u{1F44B}"}</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="dash-search hidden items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 md:flex">
                <Search size={17} className="text-purple-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-44 bg-transparent text-sm outline-none"
                />
              </div>

              <button className="relative rounded-xl border border-purple-100 bg-white p-3 text-purple-600 transition hover:-translate-y-0.5 hover:shadow-md">
                <Bell size={20} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-pink-500" />
              </button>

              <button onClick={() => navigate("/profile")} title="Edit Profile" className="dash-avatar flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 font-bold text-white shadow transition hover:scale-105 cursor-pointer">G</button>
            </div>
          </header>

          <div className="dash-rise" style={{ "--i": 1 }}>
            <HeroSection />
          </div>

          <div className="dash-rise mt-7" style={{ "--i": 2 }}>
            <DashboardStats />
          </div>

          <div className="dash-rise mt-7" style={{ "--i": 3 }}>
            <ProjectStatusDistribution />
          </div>

          <div className="dash-rise mt-7" style={{ "--i": 4 }}>
            <WorkflowSteps />
          </div>

          <div className="dash-rise mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]" style={{ "--i": 5 }}>
            <RecentProjects searchTerm={searchTerm} />
            <TestingImpact />
          </div>

          <footer className="mt-8 flex items-center justify-center gap-2 pb-3 text-xs text-[#958BAC]">
            <Sparkles size={14} />
            Spec2Test AI &middot; Intelligent Testing, Simplified
          </footer>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;



