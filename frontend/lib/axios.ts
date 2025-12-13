// src/lib/axios.ts
import axios from "axios";
import { useAuthStore } from "@/lib/store";

/**
 * Single backend (Render)
 * Backend already serves /api/*
 * Do NOT auto-switch baseURL based on path
 */

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* --------------------------------------------------
   REQUEST INTERCEPTOR → Attach JWT
-------------------------------------------------- */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* --------------------------------------------------
   RESPONSE INTERCEPTOR → Handle auth expiry
-------------------------------------------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Token expired / invalid
      useAuthStore.getState().logout();

      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
