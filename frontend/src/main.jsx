import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { getCurrentUser, migrateLegacyData } from "./utils/userStorage";

const currentUser = getCurrentUser();

if (currentUser?.email?.toLowerCase() === "gracyverma962@gmail.com") {
  const legacyProjects = JSON.parse(
    localStorage.getItem("spec2test_projects") || "[]"
  );

  const legacyKeys = [
    "spec2test_projects",
    "spec2test_read_notifications",
    "spec2test_execution_runs",
    "spec2test_defects",
    "spec2test_expanded_defects",
    "spec2test_profile",
    "spec2test_settings",
  ];

  legacyProjects.forEach((project) => {
    legacyKeys.push(`spec2test_status_${project.id}`);
  });

  migrateLegacyData(legacyKeys, currentUser.email);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
