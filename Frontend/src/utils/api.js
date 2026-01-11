// src/utils/api.js

import axios from "axios";

const api = axios.create({
  baseURL: "https://bill-inventory-backend.onrender.com", // ← IMPORTANT: NO /api at the end!
  timeout: 60000, // 60 seconds - good for slow networks
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add request interceptor for auth token (if you add login later)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or your auth storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global errors here (e.g., 401 logout)
    if (error.response?.status === 401) {
      console.warn("Unauthorized - redirect to login if needed");
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
