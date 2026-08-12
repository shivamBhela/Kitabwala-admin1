import { AdminRole, UserRole } from '@prisma/client';

export interface JwtAccessPayload {
  sub: number;
  role: UserRole;
  adminRole: AdminRole | null;
  tokenVersion: number;
}

/** Shape attached to `request.user` after JwtStrategy validation. */
export type AuthenticatedUser = JwtAccessPayload;
