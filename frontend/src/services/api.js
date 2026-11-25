import axios from "axios";

// Configured through VITE_API_BASE_URL (see frontend/.env.example).
// In `npm run dev` it falls back to the local FastAPI backend.
const configuredUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:8000" : "");

export const API_BASE_URL = configuredUrl.trim().replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

function describeError(error) {
  if (error.response) {
    const { status, data } = error.response;

    if (status === 422) {
      return "The backend rejected this project's title or description. Please check them and try again.";
    }

    if (typeof data?.detail === "string" && data.detail) {
      return `The backend reported an error (${status}): ${data.detail}`;
    }

    return `The backend returned an unexpected error (${status}). Please try again.`;
  }

  if (error.code === "ECONNABORTED") {
    return "The backend took too long to respond. Please try again.";
  }

  return `Cannot reach the backend at ${API_BASE_URL}. Check that it is running and that its CORS settings allow this site.`;
}

// Fail clearly (instead of calling the frontend's own origin) when a
// production build has no backend URL configured.
api.interceptors.request.use((config) => {
  if (!API_BASE_URL) {
    const error = new Error("VITE_API_BASE_URL is not configured.");
    error.userMessage =
      "The backend URL is not configured for this deployment (VITE_API_BASE_URL).";
    return Promise.reject(error);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = error.userMessage || describeError(error);
    return Promise.reject(error);
  }
);

export const checkBackendHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

export const analyzeRequirement = async (project) => {
  const response = await api.post("/requirements/analyze", {
    title: project.requirementTitle,
    description: project.description,
  });
  return response.data;
};

export const generateTestCases = async (project) => {
  const response = await api.post("/test-cases/generate", {
    title: project.requirementTitle,
    description: project.description,
  });
  return response.data;
};

export const assessRisks = async (project) => {
  const response = await api.post("/risks/assess", {
    title: project.requirementTitle,
    description: project.description,
  });
  return response.data;
};

export const runWorkflow = async (project) => {
  const response = await api.post("/workflow/run", {
    title: project.requirementTitle,
    description: project.description,
  });
  return response.data;
};

export default api;
