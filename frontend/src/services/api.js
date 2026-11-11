export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3100").replace(/\/+$/, "");

export async function api(path, { method = "GET", token, body, signal } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${BACKEND_URL}/api${path}`, {
    method,
    headers,
    signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || data?.error || `Error HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}
