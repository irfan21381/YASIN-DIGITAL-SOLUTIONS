// src/lib/api.ts

export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "/api";

  // Ensure URL is always /api/...
  const finalUrl = url.startsWith("/")
    ? `${base}${url}`
    : `${base}/${url}`;

  const response = await fetch(finalUrl, {
    ...options,
    credentials: "include", // 🔥 REQUIRED for cookie auth
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // 🔐 Auto logout on auth failure
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    throw new Error("Unauthorized");
  }

  // ❌ Handle API errors
  if (!response.ok) {
    let errorMessage = "Something went wrong";
    try {
      const data = await response.json();
      errorMessage = data?.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  // ✅ Return JSON
  return response.json();
}
