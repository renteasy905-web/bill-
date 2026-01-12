// src/utils/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://bill-inventory-backend.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header if token exists
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

// Handle common response errors (like 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can add more cases later (403, 429, network errors, etc.)
    if (error.response?.status === 401) {
      console.warn("Unauthorized → token might be invalid or expired");
      // Optional: you could redirect to login here in the future
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
