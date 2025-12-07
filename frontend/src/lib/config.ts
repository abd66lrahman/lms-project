// API Configuration
export const USE_MOCK_API = false; // Using real backend

// Your backend URL
export const API_BASE_URL = "http://localhost:3000";

// Helper to get the full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};
