import axios from "axios";

// Use VITE_API_URL if available, otherwise fallback to default
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

// Create axios instance - export both named and default for consistency
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK" || !error.response) {
      console.error("Backend connection error:", error.message);
    }
    
    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      // 🚨 FIX: Define all public paths where a 401 error should NOT trigger a redirect.
      const publicPaths = ['/', '/register', '/forgot-password'];
      const currentPath = window.location.pathname;

      // 🛑 Only redirect if the current page is a PROTECTED page.
      if (!publicPaths.includes(currentPath)) {
        console.log(`401 Unauthorized on protected path (${currentPath}). Redirecting.`);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Use window.location.replace to prevent back navigation to the error page
        window.location.replace("/login");
      } else {
        // Log the error but allow the public page to continue loading.
        console.warn(`401 Unauthorized caught on public path (${currentPath}). Preventing global redirect.`);
      }
    }
    return Promise.reject(error);
  }
);

// Export default for backward compatibility
export default api;