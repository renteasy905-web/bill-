// src/utils/api.js
// This file creates a centralized axios instance for all API calls

import axios from "axios";

const api = axios.create({
  // IMPORTANT: Base URL should be the root domain ONLY – do NOT add /api here!
  baseURL: "https://bill-inventory-backend.onrender.com",
  
  // For local development – uncomment when testing locally
  // baseURL: "http://localhost:3000",
  
  timeout: 60000, // 60 seconds – gives enough time for slow Render cold starts
  
  headers: {
    "Content-Type": "application/json",
    // You can add common headers here if needed
    // "Accept": "application/json",
  },
});

// Request Interceptor – automatically adds Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or sessionStorage, cookies, etc.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors (rare)
    return Promise.reject(error);
  }
);

// Response Interceptor – global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors globally (e.g., 401 → logout, 404 → custom message)
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.warn("Unauthorized – token expired or invalid");
        // Optional: logout logic
        // localStorage.removeItem("token");
        // window.location.href = "/login";
      } else if (status === 404) {
        console.warn("Resource not found:", error.config.url);
      } else if (status >= 500) {
        console.error("Server error:", error.response.data);
      }
    } else if (error.request) {
      console.error("No response received – network issue or server down");
    } else {
      console.error("Request setup error:", error.message);
    }

    // Always reject so component can handle specific errors
    return Promise.reject(error);
  }
);

export default api;
