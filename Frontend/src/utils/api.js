// src/utils/api.js  ← must look like this
import axios from "axios";

const api = axios.create({
  baseURL: "https://bill-inventory-backend.onrender.com",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// rest of interceptors...
