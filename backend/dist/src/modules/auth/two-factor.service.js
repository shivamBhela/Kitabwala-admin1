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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorService = void 0;
const common_1 = require("@nestjs/common");
const otplib_1 = require("otplib");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const BACKUP_CODE_COUNT = 8;
const EPOCH_TOLERANCE_SECONDS = 30;
function encryptionKey() {
    return (0, crypto_1.createHash)('sha256').update(process.env.TOTP_ENCRYPTION_KEY).digest();
}
function encryptSecret(plain) {
    const iv = (0, crypto_1.randomBytes)(12);
    const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', encryptionKey(), iv);
    const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
}
function decryptSecret(encoded) {
    const buffer = Buffer.from(encoded, 'base64');
    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(12, 28);
    const ciphertext = buffer.subarray(28);
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', encryptionKey(), iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
let TwoFactorService = class TwoFactorService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async setup(userId, accountLabel) {
        const existing = await this.prisma.twoFactorAuth.findUnique({ where: { user_id: userId } });
        if (existing?.is_enabled) {
            throw new common_1.BadRequestException('Two-factor authentication is already enabled');
        }
        const secret = (0, otplib_1.generateSecret)();
        await this.prisma.twoFactorAuth.upsert({
            where: { user_id: userId },
            create: { user_id: userId, secret: encryptSecret(secret) },
            update: { secret: encryptSecret(secret), is_enabled: false },
        });
        const otpauthUrl = (0, otplib_1.generateURI)({ issuer: 'Kitabwalah Admin', label: accountLabel, secret });
        return { secret, otpauthUrl };
    }
    async verifySetup(userId, code) {
        const record = await this.prisma.twoFactorAuth.findUnique({ where: { user_id: userId } });
        if (!record)
            throw new common_1.BadRequestException('Call /auth/2fa/setup first');
        const secret = decryptSecret(record.secret);
        const { valid } = await (0, otplib_1.verify)({ token: code, secret, epochTolerance: EPOCH_TOLERANCE_SECONDS });
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid authenticator code');
        }
        const backupCodes = Array.from({ length: BACKUP_CODE_COUNT }, () => (0, crypto_1.randomBytes)(5).toString('hex'));
        const backupCodesHash = await Promise.all(backupCodes.map((c) => bcrypt.hash(c, 10)));
        await this.prisma.twoFactorAuth.update({
            where: { user_id: userId },
            data: { is_enabled: true, backup_codes_hash: backupCodesHash },
        });
        await this.audit.log(userId, 'two_factor_enabled', { targetTable: 'two_factor_auth', targetId: String(userId) });
        return { backupCodes };
    }
    async verifyLoginCode(userId, code) {
        const record = await this.prisma.twoFactorAuth.findUnique({ where: { user_id: userId } });
        if (!record?.is_enabled)
            return false;
        const secret = decryptSecret(record.secret);
        const { valid } = await (0, otplib_1.verify)({ token: code, secret, epochTolerance: EPOCH_TOLERANCE_SECONDS });
        if (valid) {
            await this.prisma.twoFactorAuth.update({
                where: { user_id: userId },
                data: { last_used_at: new Date() },
            });
            return true;
        }
        for (const hash of record.backup_codes_hash) {
            if (await bcrypt.compare(code, hash)) {
                await this.prisma.twoFactorAuth.update({
                    where: { user_id: userId },
                    data: {
                        backup_codes_hash: record.backup_codes_hash.filter((h) => h !== hash),
                        last_used_at: new Date(),
                    },
                });
                return true;
            }
        }
        return false;
    }
    async isEnabled(userId) {
        const record = await this.prisma.twoFactorAuth.findUnique({ where: { user_id: userId } });
        return record?.is_enabled ?? false;
    }
};
exports.TwoFactorService = TwoFactorService;
exports.TwoFactorService = TwoFactorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, audit_service_1.AuditService])
], TwoFactorService);
//# sourceMappingURL=two-factor.service.js.map