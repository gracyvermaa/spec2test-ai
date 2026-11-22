import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
