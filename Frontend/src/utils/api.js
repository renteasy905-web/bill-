// src/utils/api.js
import axios from 'axios';

// Use environment variable for flexibility (local vs production)
// Fallback to your backend URL if env var is not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bill-inventory-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add Authorization header if token exists
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

// Response interceptor - handle common errors (like 401 unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can add more error handling here in the future
    if (error.response?.status === 401) {
      console.warn('Unauthorized - token might be invalid or expired');
      // Optional: redirect to login page
      // window.location.href = '/login';
    }

    // Always reject the promise so the catch block can handle it
    return Promise.reject(error);
  }
);

export default api;
