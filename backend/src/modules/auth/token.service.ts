import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomUUID, createHash } from 'crypto';
import { AdminRole, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { JwtAccessPayload } from './jwt-payload.type';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

@Injectable()
export class TokenService {
  private readonly refreshTtlMs: number;

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {
    const days = Number(process.env.JWT_REFRESH_TTL_DAYS ?? 30);
    this.refreshTtlMs = days * 24 * 60 * 60 * 1000;
  }

  signAccessToken(user: { id: number; role: UserRole; token_version: number; admin_profile?: { admin_role: AdminRole } | null }): string {
    const payload: JwtAccessPayload = {
      sub: user.id,
      role: user.role,
      adminRole: user.admin_profile?.admin_role ?? null,
      tokenVersion: user.token_version,
    };
    return this.jwt.sign(payload as unknown as Record<string, unknown>, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: (process.env.JWT_ACCESS_TTL ?? '15m') as never,
    });
  }

  async issueRefreshToken(userId: number, meta: RequestMeta, familyId?: string): Promise<string> {
    const raw = randomBytes(48).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        user_id: userId,
        token_hash: hashToken(raw),
        family_id: familyId ?? randomUUID(),
        expires_at: new Date(Date.now() + this.refreshTtlMs),
        ip_address: meta.ipAddress,
        user_agent: meta.userAgent,
      },
    });
    return raw;
  }

  async issueTokenPair(
    user: { id: number; role: UserRole; token_version: number; admin_profile?: { admin_role: AdminRole } | null },
    meta: RequestMeta,
  ): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      Promise.resolve(this.signAccessToken(user)),
      this.issueRefreshToken(user.id, meta),
    ]);
    return { accessToken, refreshToken };
  }

  /** Rotates a refresh token on use; detects and punishes replay of an already-rotated token. */
  async rotateRefreshToken(rawToken: string, meta: RequestMeta): Promise<TokenPair> {
    const tokenHash = hashToken(rawToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { token_hash: tokenHash },
      include: { user: { include: { admin_profile: true } } },
    });

    if (!record || record.expires_at < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (record.is_revoked) {
      // Reuse of a token that was already rotated away — likely theft. Kill the whole chain.
      await this.prisma.refreshToken.updateMany({
        where: { family_id: record.family_id },
        data: { is_revoked: true },
      });
      await this.audit.log(record.user_id, 'refresh_token_reuse_detected', {
        targetTable: 'refresh_tokens',
        targetId: String(record.id),
        description: 'Revoked refresh token was reused — entire token family revoked',
      });
      throw new UnauthorizedException('Session revoked — please log in again');
    }

    const newRawToken = randomBytes(48).toString('hex');
    const newRecord = await this.prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({
        data: {
          user_id: record.user_id,
          token_hash: hashToken(newRawToken),
          family_id: record.family_id,
          expires_at: new Date(Date.now() + this.refreshTtlMs),
          ip_address: meta.ipAddress,
          user_agent: meta.userAgent,
        },
      });
      await tx.refreshToken.update({
        where: { id: record.id },
        data: { is_revoked: true, replaced_by_id: created.id },
      });
      return created;
    });
    void newRecord;

    return {
      accessToken: this.signAccessToken(record.user),
      refreshToken: newRawToken,
    };
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token_hash: hashToken(rawToken) },
      data: { is_revoked: true },
    });
  }
}
