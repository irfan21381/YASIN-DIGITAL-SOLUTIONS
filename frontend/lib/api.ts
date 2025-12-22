export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "/api";

  const finalUrl = url.startsWith("/")
    ? `${base}${url}`
    : `${base}/${url}`;

  const response = await fetch(finalUrl, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || "API Error");
  }

  return response.json();
}

/* 🔥 ADD THIS */
const api = {
  get: (url: string) => apiFetch(url),
  post: (url: string, body?: any) =>
    apiFetch(url, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: (url: string, body?: any) =>
    apiFetch(url, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (url: string) =>
    apiFetch(url, { method: "DELETE" }),
};

export default api;
