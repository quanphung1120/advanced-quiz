import axios from "axios";

/**
 * Shared Axios instance.
 * - Always sends cookies (withCredentials)
 * - Points to the Vite-proxied or explicit API URL
 * - Normalizes 401/403 to redirect to sign-in
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to sign-in page on auth failure
      if (window.location.pathname !== "/sign-in") {
        window.location.href = "/sign-in";
      }
    }
    return Promise.reject(error);
  },
);
