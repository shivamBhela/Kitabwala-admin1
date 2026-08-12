import { JwtService } from '@nestjs/jwt';
import { AdminRole, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface RequestMeta {
    ipAddress?: string;
    userAgent?: string;
}
export declare class TokenService {
    private readonly jwt;
    private readonly prisma;
    private readonly audit;
    private readonly refreshTtlMs;
    constructor(jwt: JwtService, prisma: PrismaService, audit: AuditService);
    signAccessToken(user: {
        id: number;
        role: UserRole;
        token_version: number;
        admin_profile?: {
            admin_role: AdminRole;
        } | null;
    }): string;
    issueRefreshToken(userId: number, meta: RequestMeta, familyId?: string): Promise<string>;
    issueTokenPair(user: {
        id: number;
        role: UserRole;
        token_version: number;
        admin_profile?: {
            admin_role: AdminRole;
        } | null;
    }, meta: RequestMeta): Promise<TokenPair>;
    rotateRefreshToken(rawToken: string, meta: RequestMeta): Promise<TokenPair>;
    revokeRefreshToken(rawToken: string): Promise<void>;
}
