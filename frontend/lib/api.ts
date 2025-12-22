// frontend/lib/api.ts

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiOptions {
  method?: HttpMethod;
  body?: any;
  headers?: HeadersInit;
}

async function apiFetch(
  url: string,
  options: ApiOptions = {}
) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "/api";

  // Ensure /api prefix
  const finalUrl = url.startsWith("/")
    ? `${base}${url}`
    : `${base}/${url}`;

  const response = await fetch(finalUrl, {
    method: options.method || "GET",
    credentials: "include", // ✅ cookie auth support
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // 🔐 Auto logout on auth failure
  if (response.status === 401 && typeof window !== "undefined") {
    window.location.href = "/auth/login";
    throw new Error("Unauthorized");
  }

  // ❌ Handle API errors
  if (!response.ok) {
    let message = "Something went wrong";
    try {
      const data = await response.json();
      message = data?.message || message;
    } catch (_) {}
    throw new Error(message);
  }

  // ✅ Safe JSON parse
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                                API CLIENT                                  */
/* -------------------------------------------------------------------------- */

const api = {
  get: (url: string) => apiFetch(url),

  post: (url: string, body?: any) =>
    apiFetch(url, { method: "POST", body }),

  put: (url: string, body?: any) =>
    apiFetch(url, { method: "PUT", body }),

  patch: (url: string, body?: any) =>
    apiFetch(url, { method: "PATCH", body }),

  delete: (url: string) =>
    apiFetch(url, { method: "DELETE" }),
};

export default api;
