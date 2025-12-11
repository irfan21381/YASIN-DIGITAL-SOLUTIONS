import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // external backend URL
});

// Interceptor to auto-switch between external backend & Next.js API
api.interceptors.request.use((config) => {
  // If request starts with '/api/', use Next.js API
  if (config.url?.startsWith("/api/")) {
    config.baseURL = "";  // Next.js API (same server)
  } else {
    config.baseURL = process.env.NEXT_PUBLIC_API_URL; // external backend
  }

  return config;
});

export default api;
