import axios from 'axios';

// Use Vite env variable or fallback to production Render URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bill-inventory-backend.onrender.com';

// Axios instance with /api prefix
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add Bearer token if exists
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

// Response interceptor: handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn('Unauthorized - clearing token');
        localStorage.removeItem('token');
      }
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        message: error.message,
      });
    } else if (error.request) {
      console.error('No response from server:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
