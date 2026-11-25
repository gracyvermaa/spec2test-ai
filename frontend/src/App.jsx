import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import ProjectDetails from "./pages/ProjectDetails";
import Projects from "./pages/Projects";
import Reports from "./pages/Reports";
import Execution from "./pages/Execution";
import TestCases from "./pages/TestCases";
import Profile from "./pages/Profile";
import HelpSupport from "./pages/HelpSupport";
import Settings from "./pages/Settings";
import { AccountBoundary, RequireAuth } from "./components/AccountGuards";

function App() {
  return (
    <BrowserRouter>
      <AccountBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/new-project" element={<RequireAuth><NewProject /></RequireAuth>} />
          <Route path="/project/:id" element={<RequireAuth><ProjectDetails /></RequireAuth>} />
          <Route path="/projects" element={<RequireAuth><Projects /></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
          <Route path="/execution" element={<RequireAuth><Execution /></RequireAuth>} />
          <Route path="/test-cases" element={<RequireAuth><TestCases /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/help-support" element={<RequireAuth><HelpSupport /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        </Routes>
      </AccountBoundary>
    </BrowserRouter>
  );
}

export default App;




