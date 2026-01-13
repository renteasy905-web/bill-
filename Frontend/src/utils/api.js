// src/utils/api.js
import axios from 'axios';

// Base URL setup - uses environment variable first, falls back to production URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bill-inventory-backend.onrender.com';

// Create Axios instance with /api appended to baseURL
// This makes frontend calls clean: api.get('/allproducts') → hits /api/allproducts automatically
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000, // 60 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds Bearer token if available
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

// Response interceptor - handles common errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized - token might be invalid or expired');
      // Optional future improvement: redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
