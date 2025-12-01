import { auth } from "@clerk/nextjs/server";

const API_BASE_URL = process.env.API_URL || "http://localhost:8080";

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function fetchWithAuth<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { getToken, userId } = await auth();
  const token = await getToken();

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log("[API] User ID:", userId);
    console.log("[API] Token exists:", !!token);
    console.log("[API] Request URL:", `${API_BASE_URL}${endpoint}`);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("[API] Request failed:", response.status, error);
    throw new Error(
      error.errorMessage ||
        error.message ||
        `Request failed: ${response.status}`
    );
  }

  return response.json();
}

// Client-side fetch with token
export async function clientFetchWithAuth<T>(
  endpoint: string,
  token: string | null,
  options: FetchOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.errorMessage || `Request failed: ${response.status}`);
  }

  return response.json();
}
