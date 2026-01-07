import axios from "axios";

const api = axios.create({
  baseURL: "https://bill-inventory-backend.onrender.com/api",
  timeout: 60000,  // ← Change from 10000 to 60000 (60 seconds)
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
