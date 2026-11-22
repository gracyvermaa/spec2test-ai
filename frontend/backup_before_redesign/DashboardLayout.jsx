import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../pages/Execution.css";
import "../pages/ProjectDetails.css";
import "../pages/Reports.css";
import "../pages/TestCases.css";
import "../pages/HelpSupport.css";

function DashboardLayout({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-[#F8F6FF]">
      <Sidebar />

      {/* data-page lets page-specific themes (Execution.css, Reports.css, HelpSupport.css...) scope themselves safely */}
      <main data-page={pathname} className="min-w-0 flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
