import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * Shared Axios instance.
 * - Uses cookie-based auth
 * - Points to the explicit API URL
 * - Handles session refresh via interceptors
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

const PUBLIC_PATH_PREFIXES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function isPublicPath(pathname: string) {
  return PUBLIC_PATH_PREFIXES.some((prefix) =>
    prefix === "/" ? pathname === prefix : pathname.startsWith(prefix),
  );
}

function processQueue(error: unknown) {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
      return;
    }

    request.resolve();
  });

  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const shouldRefresh =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/auth/refresh" &&
      originalRequest.url !== "/api/auth/login";

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((refreshError) => Promise.reject(refreshError));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await axios.post(`${api.defaults.baseURL}/api/auth/refresh`, undefined, {
        withCredentials: true,
      });

      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);

      if (!isPublicPath(window.location.pathname)) {
        window.location.href = "/sign-in";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
