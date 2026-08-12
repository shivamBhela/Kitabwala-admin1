/**
 * types/auth.ts
 * Response shapes for the real auth endpoints (kitabwalah-api /auth/*).
 */

export interface AuthUser {
  id: number;
  userCode: string;
  displayName: string;
  phone: string | null;
  email: string | null;
  role: string;
  adminRole: string | null;
}

export type LoginResponse =
  | { requires2FA: true; pendingToken: string }
  | { requires2FA: false; accessToken: string; user: AuthUser };
