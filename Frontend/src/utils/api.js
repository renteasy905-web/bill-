// src/utils/api.js
import axios from 'axios';

// Base URL: Use Vite env var first, fallback to your live Render backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bill-inventory-backend.onrender.com';

// Create Axios instance with /api prefix (all calls become /api/...)
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000, // 60 seconds timeout (good for slow networks)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Automatically add Bearer token from localStorage if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle common errors globally (e.g. 401 unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 401 → token invalid/expired → clear it
      if (error.response.status === 401) {
        console.warn('Unauthorized - token cleared');
        localStorage.removeItem('token');
        // Optional: redirect to login if you add real auth later
        // window.location.href = '/';
      }

      // Log full error for debugging
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        message: error.message,
      });
    } else if (error.request) {
      // No response (network/server down)
      console.error('No response from server:', error.request);
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
