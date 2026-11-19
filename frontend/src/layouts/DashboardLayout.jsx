
import Sidebar from "../components/Sidebar";

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8F6FF]">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
