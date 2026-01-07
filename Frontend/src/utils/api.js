import axios from "axios";

const api = axios.create({
  baseURL: "https://bill-inventory-backend.onrender.com/api", // ← Fixed: added /api
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;