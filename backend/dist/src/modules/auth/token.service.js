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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
function hashToken(raw) {
    return (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
}
let TokenService = class TokenService {
    jwt;
    prisma;
    audit;
    refreshTtlMs;
    constructor(jwt, prisma, audit) {
        this.jwt = jwt;
        this.prisma = prisma;
        this.audit = audit;
        const days = Number(process.env.JWT_REFRESH_TTL_DAYS ?? 30);
        this.refreshTtlMs = days * 24 * 60 * 60 * 1000;
    }
    signAccessToken(user) {
        const payload = {
            sub: user.id,
            role: user.role,
            adminRole: user.admin_profile?.admin_role ?? null,
            tokenVersion: user.token_version,
        };
        return this.jwt.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: (process.env.JWT_ACCESS_TTL ?? '15m'),
        });
    }
    async issueRefreshToken(userId, meta, familyId) {
        const raw = (0, crypto_1.randomBytes)(48).toString('hex');
        await this.prisma.refreshToken.create({
            data: {
                user_id: userId,
                token_hash: hashToken(raw),
                family_id: familyId ?? (0, crypto_1.randomUUID)(),
                expires_at: new Date(Date.now() + this.refreshTtlMs),
                ip_address: meta.ipAddress,
                user_agent: meta.userAgent,
            },
        });
        return raw;
    }
    async issueTokenPair(user, meta) {
        const [accessToken, refreshToken] = await Promise.all([
            Promise.resolve(this.signAccessToken(user)),
            this.issueRefreshToken(user.id, meta),
        ]);
        return { accessToken, refreshToken };
    }
    async rotateRefreshToken(rawToken, meta) {
        const tokenHash = hashToken(rawToken);
        const record = await this.prisma.refreshToken.findUnique({
            where: { token_hash: tokenHash },
            include: { user: { include: { admin_profile: true } } },
        });
        if (!record || record.expires_at < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        if (record.is_revoked) {
            await this.prisma.refreshToken.updateMany({
                where: { family_id: record.family_id },
                data: { is_revoked: true },
            });
            await this.audit.log(record.user_id, 'refresh_token_reuse_detected', {
                targetTable: 'refresh_tokens',
                targetId: String(record.id),
                description: 'Revoked refresh token was reused — entire token family revoked',
            });
            throw new common_1.UnauthorizedException('Session revoked — please log in again');
        }
        const newRawToken = (0, crypto_1.randomBytes)(48).toString('hex');
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
    async revokeRefreshToken(rawToken) {
        await this.prisma.refreshToken.updateMany({
            where: { token_hash: hashToken(rawToken) },
            data: { is_revoked: true },
        });
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, audit_service_1.AuditService])
], TokenService);
//# sourceMappingURL=token.service.js.map