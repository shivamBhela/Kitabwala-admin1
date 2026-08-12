import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Throttle, minutes, seconds } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from './jwt-payload.type';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';
import { LoginDto } from './dto/login.dto';
import { Verify2FALoginDto } from './dto/verify-2fa-login.dto';
import { Verify2FASetupDto } from './dto/verify-2fa-setup.dto';

const REFRESH_COOKIE_NAME = 'kw_refresh_token';
const REFRESH_COOKIE_PATH = '/api/auth';

function requestMeta(req: Request) {
  return { ipAddress: req.ip, userAgent: req.get('user-agent') ?? undefined };
}

function setRefreshCookie(res: Response, token: string) {
  const days = Number(process.env.JWT_REFRESH_TTL_DAYS ?? 30);
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
    maxAge: days * 24 * 60 * 60 * 1000,
  });
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactor: TwoFactorService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: seconds(60) } }) // password-guessing protection
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto.identifier, dto.password, requestMeta(req));
    if (!result.requires2FA) {
      setRefreshCookie(res, result.refreshToken);
      return { requires2FA: false, accessToken: result.accessToken, user: result.user };
    }
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: minutes(5) } }) // TOTP/backup-code brute-force protection — stricter than login
  @Post('2fa/verify-login')
  async verify2FALogin(
    @Body() dto: Verify2FALoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verify2FALogin(dto.pendingToken, dto.code, requestMeta(req));
    if (!result.requires2FA) {
      setRefreshCookie(res, result.refreshToken);
      return { requires2FA: false, accessToken: result.accessToken, user: result.user };
    }
    return result;
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!raw) throw new UnauthorizedException('No refresh token provided');

    const pair = await this.authService.refresh(raw, requestMeta(req));
    setRefreshCookie(res, pair.refreshToken);
    return { accessToken: pair.accessToken };
  }

  @Post('logout')
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sub, req.cookies?.[REFRESH_COOKIE_NAME]);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
    return { loggedOut: true };
  }

  @Post('2fa/setup')
  async setup2FA(@CurrentUser() user: AuthenticatedUser) {
    return this.twoFactor.setup(user.sub, String(user.sub));
  }

  @Post('2fa/verify-setup')
  async verifySetup2FA(@CurrentUser() user: AuthenticatedUser, @Body() dto: Verify2FASetupDto) {
    return this.twoFactor.verifySetup(user.sub, dto.code);
  }
}
