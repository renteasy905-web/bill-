// src/utils/api.js
import axios from 'axios';

// Use environment variable for flexibility (local vs production)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bill-inventory-backend.onrender.com';

// Add /api to baseURL so frontend calls can be clean (api.get('/allproducts'))
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,  // ← FIXED: Add /api here
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add token if exists)
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

// Response interceptor (handle common errors like 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized - token might be invalid or expired');
      // Optional: You can redirect to login here later
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
