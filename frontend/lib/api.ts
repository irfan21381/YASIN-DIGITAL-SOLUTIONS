// src/lib/api.ts
import axios from "axios";
import { useAuthStore } from "@/lib/store";

/* --------------------------------------------------
   BACKEND URL
-------------------------------------------------- */
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* --------------------------------------------------
   REQUEST INTERCEPTOR
   → Attach JWT token
-------------------------------------------------- */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* --------------------------------------------------
   RESPONSE INTERCEPTOR
   → Auto logout on 401
-------------------------------------------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();

      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

