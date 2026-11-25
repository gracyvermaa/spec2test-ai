import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Legacy (pre-accounts) data is migrated automatically and safely by
// utils/userStorage.js the first time an account's data is accessed.

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
