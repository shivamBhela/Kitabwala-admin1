import type { Request, Response } from 'express';
import type { AuthenticatedUser } from './jwt-payload.type';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';
import { LoginDto } from './dto/login.dto';
import { Verify2FALoginDto } from './dto/verify-2fa-login.dto';
import { Verify2FASetupDto } from './dto/verify-2fa-setup.dto';
export declare class AuthController {
    private readonly authService;
    private readonly twoFactor;
    constructor(authService: AuthService, twoFactor: TwoFactorService);
    login(dto: LoginDto, req: Request, res: Response): Promise<{
        requires2FA: true;
        pendingToken: string;
    } | {
        requires2FA: boolean;
        accessToken: string;
        user: import("./auth.service").PublicUserView;
    }>;
    verify2FALogin(dto: Verify2FALoginDto, req: Request, res: Response): Promise<{
        requires2FA: true;
        pendingToken: string;
    } | {
        requires2FA: boolean;
        accessToken: string;
        user: import("./auth.service").PublicUserView;
    }>;
    refresh(req: Request, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(user: AuthenticatedUser, req: Request, res: Response): Promise<{
        loggedOut: boolean;
    }>;
    setup2FA(user: AuthenticatedUser): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    verifySetup2FA(user: AuthenticatedUser, dto: Verify2FASetupDto): Promise<{
        backupCodes: string[];
    }>;
}
