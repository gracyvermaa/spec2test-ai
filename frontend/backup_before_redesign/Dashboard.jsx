import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

import HeroSection from "../components/HeroSection";
import WorkflowSteps from "../components/WorkflowSteps";
import RecentProjects from "../components/RecentProjects";
import TestingImpact from "../components/TestingImpact";
import DashboardStats from "../components/DashboardStats";
import ProjectStatusDistribution from "../components/ProjectStatusDistribution";

import {
  Bell,
  Search,
  Sparkles
} from "lucide-react";

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1600px] p-5 md:p-8">

        {/* Top navigation */}
        <header className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#81769F]">
              Welcome back,
            </p>
            <h1 className="text-2xl font-bold text-[#211A4B]">
              Gracy Verma âœ¨
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 md:flex">
              <Search size={17} className="text-purple-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40 bg-transparent text-sm outline-none"
              />
            </div>

            <button className="relative rounded-xl border border-purple-100 bg-white p-3 text-purple-600">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-pink-500" />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 font-bold text-white shadow">
              G
            </div>
          </div>
        </header>

        {/* Hero */}
        <HeroSection />

        {/* Dashboard Analytics */}
        <div className="mt-7">
          <DashboardStats />
        </div>

        {/* Project Status Chart */}
        <div className="mt-7">
          <ProjectStatusDistribution />
        </div>

        {/* Workflow */}
        <div className="mt-7">
          <WorkflowSteps />
        </div>

        {/* Projects and impact */}
        <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
          <RecentProjects searchTerm={searchTerm} />
          <TestingImpact />
        </div>

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-center gap-2 pb-3 text-xs text-[#958BAC]">
          <Sparkles size={14} />
          Spec2Test AI Â· Intelligent Testing, Simplified
        </footer>

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;

