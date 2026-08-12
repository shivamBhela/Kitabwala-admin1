/**
 * services/authService.ts
 * Axios calls for the real auth endpoints (kitabwalah-api /auth/*).
 * Every response body is wrapped as ApiResponse<T> by the backend's global
 * interceptor, so each call unwraps `.data.data`.
 */

import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { LoginResponse } from "@/types/auth";

export async function login(identifier: string, password: string): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<ApiResponse<LoginResponse>>("/auth/login", {
    identifier,
    password,
  });
  return data.data;
}

export async function verify2FALogin(pendingToken: string, code: string): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<ApiResponse<LoginResponse>>("/auth/2fa/verify-login", {
    pendingToken,
    code,
  });
  return data.data;
}

export async function logout(): Promise<void> {
  await axiosInstance.post("/auth/logout");
}
