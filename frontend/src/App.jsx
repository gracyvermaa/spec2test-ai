import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import ProjectDetails from "./pages/ProjectDetails";
import Projects from "./pages/Projects";
import Reports from "./pages/Reports";
import Execution from "./pages/Execution";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-project" element={<NewProject />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/execution" element={<Execution />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


