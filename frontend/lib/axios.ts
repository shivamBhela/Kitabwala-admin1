/**
 * lib/axios.ts
 * Configured Axios instance with request/response interceptors.
 * - Attaches Bearer token from localStorage on every request
 * - Normalizes API errors to ApiError class
 * - On 401: attempts one silent refresh (via the httpOnly refresh cookie) and
 *   retries the original request; only clears token + redirects to login if
 *   the refresh itself fails
 */

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiError, type ApiResponse } from "@/types/api";
import { AUTH_COOKIE_NAME, BASE_URL } from "@/constants/app";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // sends the httpOnly refresh-token cookie
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Separate, interceptor-free client for the refresh call itself — reusing
// axiosInstance would recurse back into this same 401 handler.
const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ─── Request Interceptor ─────────────────────────────────────────────────────

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(AUTH_COOKIE_NAME);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ─── Silent Refresh (deduped — concurrent 401s share one refresh call) ──────

let refreshInFlight: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = refreshClient
      .post<ApiResponse<{ accessToken: string }>>("/auth/refresh")
      .then((res) => {
        const token = res.data.data.accessToken;
        localStorage.setItem(AUTH_COOKIE_NAME, token);
        return token;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

// ─── Response Interceptor ─────────────────────────────────────────────────────

interface RetryableConfig extends AxiosRequestConfig {
  _retried?: boolean;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status ?? 500;
    const originalConfig = error.config as RetryableConfig | undefined;

    const isRefreshCall = originalConfig?.url?.includes("/auth/refresh");
    if (status === 401 && originalConfig && !originalConfig._retried && !isRefreshCall) {
      originalConfig._retried = true;
      try {
        const newToken = await refreshAccessToken();
        originalConfig.headers = { ...originalConfig.headers, Authorization: `Bearer ${newToken}` };
        return axiosInstance(originalConfig);
      } catch {
        // Refresh failed — fall through to the clear+redirect below.
      }
    }

    const message =
      error.response?.data?.message ?? error.message ?? "An unexpected error occurred";
    const errors = error.response?.data?.errors;

    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(AUTH_COOKIE_NAME);
      window.location.href = '/'; // LoginPage renders inside app/page.tsx — '/login' is not a real route
    }

    return Promise.reject(new ApiError(message, status, errors));
  }
);

export default axiosInstance;
