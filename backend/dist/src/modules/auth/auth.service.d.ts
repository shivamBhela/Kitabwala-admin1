import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { TokenService, type RequestMeta, type TokenPair } from './token.service';
import { TwoFactorService } from './two-factor.service';
export interface PublicUserView {
    id: number;
    userCode: string;
    displayName: string;
    phone: string | null;
    email: string | null;
    role: UserRole;
    adminRole: string | null;
}
export type LoginResult = {
    requires2FA: true;
    pendingToken: string;
} | ({
    requires2FA: false;
    user: PublicUserView;
} & TokenPair);
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly tokens;
    private readonly twoFactor;
    private readonly audit;
    constructor(prisma: PrismaService, jwt: JwtService, tokens: TokenService, twoFactor: TwoFactorService, audit: AuditService);
    login(identifier: string, password: string, meta: RequestMeta): Promise<LoginResult>;
    verify2FALogin(pendingToken: string, code: string, meta: RequestMeta): Promise<LoginResult>;
    private completeLogin;
    refresh(rawRefreshToken: string, meta: RequestMeta): Promise<TokenPair>;
    logout(userId: number, rawRefreshToken: string | undefined): Promise<void>;
    private devBypassLogin;
}
