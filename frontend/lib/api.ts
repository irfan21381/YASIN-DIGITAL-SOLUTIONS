// frontend/lib/api.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://yasin-digital-solutions.onrender.com";

async function request(
  method: string,
  url: string,
  body?: any
) {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorMessage = "Request failed";
    try {
      const err = await res.json();
      errorMessage = err.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
}

const api = {
  get: (url: string) => request("GET", url),
  post: (url: string, body?: any) => request("POST", url, body),
  put: (url: string, body?: any) => request("PUT", url, body),
  patch: (url: string, body?: any) => request("PATCH", url, body),
  delete: (url: string) => request("DELETE", url),
};

export default api;
