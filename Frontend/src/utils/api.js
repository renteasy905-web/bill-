// src/utils/api.js
import axios from "axios";

const api = axios.create({
  // IMPORTANT: Base URL is root domain ONLY – do NOT add /api here!
  baseURL: "https://bill-inventory-backend.onrender.com",
  
  // For local dev – uncomment when testing
  // baseURL: "http://localhost:3000",
  
  timeout: 60000, // 60 seconds – good for Render cold starts
  
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token automatically if present (future-proof)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized – token invalid or expired");
      // Optional: localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
