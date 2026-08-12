import { AdminRole, UserRole } from '@prisma/client';
export interface JwtAccessPayload {
    sub: number;
    role: UserRole;
    adminRole: AdminRole | null;
    tokenVersion: number;
}
export type AuthenticatedUser = JwtAccessPayload;
