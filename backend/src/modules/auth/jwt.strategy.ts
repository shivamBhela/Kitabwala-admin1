import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { isDevBypassActive } from '../../common/utils/dev-bypass';
import type { JwtAccessPayload } from './jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
    });
  }

  async validate(payload: JwtAccessPayload & { purpose?: string; bypass?: boolean }): Promise<JwtAccessPayload> {
    if (payload.purpose) {
      // A "2fa_pending" (or any special-purpose) token must never authenticate a normal request.
      throw new UnauthorizedException('Invalid access token');
    }

    // DEV_BYPASS: trust the token as-is, skipping the ban/active/token-version DB check
    // that every other request goes through. Temporary, while no real DATABASE_URL exists.
    if (isDevBypassActive() && payload.bypass) {
      return { sub: payload.sub, role: payload.role, adminRole: payload.adminRole, tokenVersion: payload.tokenVersion };
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.is_banned || !user.is_active) {
      throw new UnauthorizedException('Account is no longer active');
    }
    if (user.token_version !== payload.tokenVersion) {
      throw new UnauthorizedException('Session invalidated — please log in again');
    }

    return { sub: payload.sub, role: payload.role, adminRole: payload.adminRole, tokenVersion: payload.tokenVersion };
  }
}
