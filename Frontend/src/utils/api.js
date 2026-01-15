import axios from "axios";

/*
  Priority:
  1. VITE_API_BASE_URL (local dev)
  2. Render production URL (fallback)
*/

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://bill-inventory-backend.onrender.com";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */
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

/* ---------------- RESPONSE INTERCEPTOR ---------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API ERROR:", {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
      });

      if (error.response.status === 401) {
        console.warn("Unauthorized → token removed");
        localStorage.removeItem("token");
      }
    } else if (error.request) {
      console.error("NO RESPONSE FROM SERVER", error.request);
    } else {
      console.error("REQUEST ERROR", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
