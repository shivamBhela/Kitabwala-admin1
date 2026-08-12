import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminRole, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { isDevBypassActive } from '../../common/utils/dev-bypass';
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

export type LoginResult =
  | { requires2FA: true; pendingToken: string }
  | ({ requires2FA: false; user: PublicUserView } & TokenPair);

function toPublicUser(user: {
  id: number;
  user_code: string;
  display_name: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
  admin_profile?: { admin_role: AdminRole } | null;
}): PublicUserView {
  return {
    id: user.id,
    userCode: user.user_code,
    displayName: user.display_name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    adminRole: user.admin_profile?.admin_role ?? null,
  };
}

const PENDING_2FA_TTL = '5m';
// Sentinel value devBypassLogin() issues in place of a real refresh token — used to
// scope refresh()/logout() bypass behavior to actual bypass sessions only (see below),
// never to a real session that happens to be active while the flag is on.
const DEV_BYPASS_REFRESH_TOKEN = 'dev-bypass-no-persisted-refresh-token';
const DEV_BYPASS = isDevBypassActive;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly tokens: TokenService,
    private readonly twoFactor: TwoFactorService,
    private readonly audit: AuditService,
  ) {}

  async login(identifier: string, password: string, meta: RequestMeta): Promise<LoginResult> {
    // DEV_BYPASS: accepts ANY identifier/password and skips the database entirely.
    // Temporary, while no real DATABASE_URL exists — remove once one does.
    if (DEV_BYPASS()) {
      return this.devBypassLogin();
    }

    const user = await this.prisma.user.findFirst({
      where: {
        role: 'admin',
        OR: [{ phone: identifier }, { email: identifier }],
      },
      include: { admin_profile: true, two_factor_auth: true },
    });

    if (!user || !user.password_hash || user.is_banned || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.two_factor_auth?.is_enabled) {
      const pendingToken = this.jwt.sign(
        { sub: user.id, purpose: '2fa_pending' },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: PENDING_2FA_TTL },
      );
      return { requires2FA: true, pendingToken };
    }

    return this.completeLogin(user, meta);
  }

  async verify2FALogin(pendingToken: string, code: string, meta: RequestMeta): Promise<LoginResult> {
    let payload: { sub: number; purpose?: string };
    try {
      payload = this.jwt.verify(pendingToken, { secret: process.env.JWT_ACCESS_SECRET });
    } catch {
      throw new UnauthorizedException('2FA session expired — please log in again');
    }
    if (payload.purpose !== '2fa_pending') {
      throw new UnauthorizedException('Invalid pending token');
    }

    const codeValid = await this.twoFactor.verifyLoginCode(payload.sub, code);
    if (!codeValid) {
      throw new UnauthorizedException('Invalid authenticator or backup code');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: payload.sub },
      include: { admin_profile: true },
    });
    return this.completeLogin(user, meta);
  }

  private async completeLogin(
    user: Parameters<typeof toPublicUser>[0] & { id: number; role: UserRole; token_version: number },
    meta: RequestMeta,
  ): Promise<LoginResult> {
    const tokenPair = await this.tokens.issueTokenPair(user, meta);
    await this.prisma.user.update({ where: { id: user.id }, data: { last_login_at: new Date() } });
    await this.audit.log(user.id, 'login', { targetTable: 'users', targetId: String(user.id) });

    return { requires2FA: false, user: toPublicUser(user), ...tokenPair };
  }

  async refresh(rawRefreshToken: string, meta: RequestMeta): Promise<TokenPair> {
    // Only short-circuit when THIS request is presenting the bypass session's own
    // sentinel token — never for a real caller's refresh cookie, even while the flag
    // is on. Without this check, any real session's refresh() call would have been
    // silently swapped for a synthetic super_admin session instead of rotating its
    // own token.
    if (DEV_BYPASS() && rawRefreshToken === DEV_BYPASS_REFRESH_TOKEN) {
      const bypass = this.devBypassLogin();
      if (!bypass.requires2FA) return bypass;
    }
    return this.tokens.rotateRefreshToken(rawRefreshToken, meta);
  }

  async logout(userId: number, rawRefreshToken: string | undefined): Promise<void> {
    // userId 0 is the bypass session's synthetic id (no real user with that id can
    // exist — Prisma autoincrement starts at 1). Only THAT caller's logout no-ops;
    // a real user's logout always revokes their token and gets audit-logged, even
    // while the flag happens to be on.
    if (DEV_BYPASS() && userId === 0) return; // nothing was persisted to revoke
    if (rawRefreshToken) {
      await this.tokens.revokeRefreshToken(rawRefreshToken);
    }
    await this.audit.log(userId, 'logout', { targetTable: 'users', targetId: String(userId) });
  }

  /** DEV_BYPASS ONLY: issues a valid super_admin session without touching the database. */
  private devBypassLogin(): LoginResult {
    const accessToken = this.jwt.sign(
      { sub: 0, role: 'admin' as UserRole, adminRole: 'super_admin' as AdminRole, tokenVersion: 0, bypass: true },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: (process.env.JWT_ACCESS_TTL ?? '15m') as never },
    );
    return {
      requires2FA: false,
      accessToken,
      refreshToken: 'dev-bypass-no-persisted-refresh-token',
      user: {
        id: 0,
        userCode: 'ADM000000',
        displayName: 'Dev Bypass Admin (no DB)',
        phone: null,
        email: null,
        role: 'admin',
        adminRole: 'super_admin',
      },
    };
  }
}
