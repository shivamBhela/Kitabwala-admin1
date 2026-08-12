"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_service_1 = require("./auth.service");
const two_factor_service_1 = require("./two-factor.service");
const login_dto_1 = require("./dto/login.dto");
const verify_2fa_login_dto_1 = require("./dto/verify-2fa-login.dto");
const verify_2fa_setup_dto_1 = require("./dto/verify-2fa-setup.dto");
const REFRESH_COOKIE_NAME = 'kw_refresh_token';
const REFRESH_COOKIE_PATH = '/api/auth';
function requestMeta(req) {
    return { ipAddress: req.ip, userAgent: req.get('user-agent') ?? undefined };
}
function setRefreshCookie(res, token) {
    const days = Number(process.env.JWT_REFRESH_TTL_DAYS ?? 30);
    res.cookie(REFRESH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: REFRESH_COOKIE_PATH,
        maxAge: days * 24 * 60 * 60 * 1000,
    });
}
let AuthController = class AuthController {
    authService;
    twoFactor;
    constructor(authService, twoFactor) {
        this.authService = authService;
        this.twoFactor = twoFactor;
    }
    async login(dto, req, res) {
        const result = await this.authService.login(dto.identifier, dto.password, requestMeta(req));
        if (!result.requires2FA) {
            setRefreshCookie(res, result.refreshToken);
            return { requires2FA: false, accessToken: result.accessToken, user: result.user };
        }
        return result;
    }
    async verify2FALogin(dto, req, res) {
        const result = await this.authService.verify2FALogin(dto.pendingToken, dto.code, requestMeta(req));
        if (!result.requires2FA) {
            setRefreshCookie(res, result.refreshToken);
            return { requires2FA: false, accessToken: result.accessToken, user: result.user };
        }
        return result;
    }
    async refresh(req, res) {
        const raw = req.cookies?.[REFRESH_COOKIE_NAME];
        if (!raw)
            throw new common_1.UnauthorizedException('No refresh token provided');
        const pair = await this.authService.refresh(raw, requestMeta(req));
        setRefreshCookie(res, pair.refreshToken);
        return { accessToken: pair.accessToken };
    }
    async logout(user, req, res) {
        await this.authService.logout(user.sub, req.cookies?.[REFRESH_COOKIE_NAME]);
        res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
        return { loggedOut: true };
    }
    async setup2FA(user) {
        return this.twoFactor.setup(user.sub, String(user.sub));
    }
    async verifySetup2FA(user, dto) {
        return this.twoFactor.verifySetup(user.sub, dto.code);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: (0, throttler_1.seconds)(60) } }),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: (0, throttler_1.minutes)(5) } }),
    (0, common_1.Post)('2fa/verify-login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_2fa_login_dto_1.Verify2FALoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2FALogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('2fa/setup'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setup2FA", null);
__decorate([
    (0, common_1.Post)('2fa/verify-setup'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, verify_2fa_setup_dto_1.Verify2FASetupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifySetup2FA", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        two_factor_service_1.TwoFactorService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map