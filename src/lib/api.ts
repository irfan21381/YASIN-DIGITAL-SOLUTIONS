import axios from "axios";

/**
 * ✅ NEXT.JS + VERCEL COMPATIBLE
 * Backend example:
 * https://yds-backend.onrender.com
 * https://api.yds.in
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:10000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// ============================
// REQUEST INTERCEPTOR
// ============================
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================
// RESPONSE INTERCEPTOR
// ============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network / backend down
    if (!error.response) {
      console.error("❌ Backend not reachable:", error.message);
      return Promise.reject(error);
    }

    // 401 handling
    if (error.response.status === 401 && typeof window !== "undefined") {
      const publicPaths = ["/", "/login", "/courses"];
      const currentPath = window.location.pathname;

      if (!publicPaths.includes(currentPath)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
