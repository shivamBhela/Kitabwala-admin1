"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const dev_bypass_1 = require("../../common/utils/dev-bypass");
const token_service_1 = require("./token.service");
const two_factor_service_1 = require("./two-factor.service");
function toPublicUser(user) {
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
const DEV_BYPASS_REFRESH_TOKEN = 'dev-bypass-no-persisted-refresh-token';
const DEV_BYPASS = dev_bypass_1.isDevBypassActive;
let AuthService = class AuthService {
    prisma;
    jwt;
    tokens;
    twoFactor;
    audit;
    constructor(prisma, jwt, tokens, twoFactor, audit) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.tokens = tokens;
        this.twoFactor = twoFactor;
        this.audit = audit;
    }
    async login(identifier, password, meta) {
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
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.two_factor_auth?.is_enabled) {
            const pendingToken = this.jwt.sign({ sub: user.id, purpose: '2fa_pending' }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: PENDING_2FA_TTL });
            return { requires2FA: true, pendingToken };
        }
        return this.completeLogin(user, meta);
    }
    async verify2FALogin(pendingToken, code, meta) {
        let payload;
        try {
            payload = this.jwt.verify(pendingToken, { secret: process.env.JWT_ACCESS_SECRET });
        }
        catch {
            throw new common_1.UnauthorizedException('2FA session expired — please log in again');
        }
        if (payload.purpose !== '2fa_pending') {
            throw new common_1.UnauthorizedException('Invalid pending token');
        }
        const codeValid = await this.twoFactor.verifyLoginCode(payload.sub, code);
        if (!codeValid) {
            throw new common_1.UnauthorizedException('Invalid authenticator or backup code');
        }
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: payload.sub },
            include: { admin_profile: true },
        });
        return this.completeLogin(user, meta);
    }
    async completeLogin(user, meta) {
        const tokenPair = await this.tokens.issueTokenPair(user, meta);
        await this.prisma.user.update({ where: { id: user.id }, data: { last_login_at: new Date() } });
        await this.audit.log(user.id, 'login', { targetTable: 'users', targetId: String(user.id) });
        return { requires2FA: false, user: toPublicUser(user), ...tokenPair };
    }
    async refresh(rawRefreshToken, meta) {
        if (DEV_BYPASS() && rawRefreshToken === DEV_BYPASS_REFRESH_TOKEN) {
            const bypass = this.devBypassLogin();
            if (!bypass.requires2FA)
                return bypass;
        }
        return this.tokens.rotateRefreshToken(rawRefreshToken, meta);
    }
    async logout(userId, rawRefreshToken) {
        if (DEV_BYPASS() && userId === 0)
            return;
        if (rawRefreshToken) {
            await this.tokens.revokeRefreshToken(rawRefreshToken);
        }
        await this.audit.log(userId, 'logout', { targetTable: 'users', targetId: String(userId) });
    }
    devBypassLogin() {
        const accessToken = this.jwt.sign({ sub: 0, role: 'admin', adminRole: 'super_admin', tokenVersion: 0, bypass: true }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: (process.env.JWT_ACCESS_TTL ?? '15m') });
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        token_service_1.TokenService,
        two_factor_service_1.TwoFactorService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map