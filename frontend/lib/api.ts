import axios from "axios";

const logoutUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (!window.location.pathname.startsWith("/auth")) {
      window.location.href = "/auth/login";
    }
  }
};

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  timeout: 20000,
});

api.interceptors.request.use((config: any) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Only Next.js internal API routes override
  if (config.url === "/api/auth/refresh") {
    config.baseURL = ""; // Next.js API
  } else {
    config.baseURL = BACKEND_URL; // External backend
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) logoutUser();
    return Promise.reject(err);
  }
);

export default api;
