// frontend/lib/api.ts

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
    let errorMessage = "Something went wrong";
    try {
      const data = await response.json();
      errorMessage = data?.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return response.json();
}

