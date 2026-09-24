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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const user_code_service_1 = require("./user-code.service");
const USER_LIST_SELECT = {
    id: true,
    user_code: true,
    phone: true,
    phone_verified: true,
    email: true,
    email_verified: true,
    display_name: true,
    first_name: true,
    last_name: true,
    profile_picture: true,
    role: true,
    referral_code: true,
    detected_city_id: true,
    wallet_balance: true,
    is_active: true,
    is_banned: true,
    ban_reason: true,
    is_migrated: true,
    migration_login_done: true,
    last_login_at: true,
    created_at: true,
};
const RECENT_ORDERS_LIMIT = 10;
const RECENT_WALLET_TRANSACTIONS_LIMIT = 20;
let UsersService = class UsersService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async createAdmin(input) {
        const passwordHash = await bcrypt.hash(input.password, 12);
        return this.prisma.$transaction(async (tx) => {
            const userCode = await (0, user_code_service_1.generateUserCode)(tx, 'admin');
            const user = await tx.user.create({
                data: {
                    user_code: userCode,
                    display_name: input.displayName,
                    phone: input.phone,
                    email: input.email,
                    password_hash: passwordHash,
                    auth_provider: input.email ? 'email' : 'phone',
                    role: 'admin',
                    phone_verified: Boolean(input.phone),
                    email_verified: Boolean(input.email),
                },
            });
            const adminProfile = await tx.adminProfile.create({
                data: { user_id: user.id, admin_role: input.adminRole },
            });
            return { user, adminProfile };
        });
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
            ...(query.role && { role: query.role }),
            ...(query.is_banned !== undefined && { is_banned: query.is_banned }),
            ...(query.is_migrated !== undefined && {
                is_migrated: query.is_migrated,
            }),
            ...(query.city_id !== undefined && { detected_city_id: query.city_id }),
            ...(query.search && {
                OR: [
                    { display_name: { contains: query.search, mode: 'insensitive' } },
                    { phone: { contains: query.search, mode: 'insensitive' } },
                    { email: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                select: USER_LIST_SELECT,
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            items,
            page,
            limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                ...USER_LIST_SELECT,
                saved_addresses: true,
                reseller: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User ${id} not found`);
        }
        const [orders, walletTransactions] = await Promise.all([
            this.prisma.order.findMany({
                where: { user_id: id },
                select: {
                    id: true,
                    order_number: true,
                    status: true,
                    total: true,
                    created_at: true,
                },
                orderBy: { created_at: 'desc' },
                take: RECENT_ORDERS_LIMIT,
            }),
            this.prisma.walletTransaction.findMany({
                where: { user_id: id },
                orderBy: { created_at: 'desc' },
                take: RECENT_WALLET_TRANSACTIONS_LIMIT,
            }),
        ]);
        return { ...user, orders, wallet_transactions: walletTransactions };
    }
    async ban(id, dto, adminId) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`User ${id} not found`);
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                is_banned: true,
                ban_reason: dto.ban_reason,
                token_version: { increment: 1 },
            },
        });
        await this.audit.log(adminId, 'user_ban', {
            targetTable: 'users',
            targetId: String(id),
            description: `Banned user ${updated.user_code}`,
            oldData: {
                is_banned: existing.is_banned,
                ban_reason: existing.ban_reason,
            },
            newData: { is_banned: updated.is_banned, ban_reason: updated.ban_reason },
        });
        return {
            id: updated.id,
            is_banned: updated.is_banned,
            ban_reason: updated.ban_reason,
            token_version: updated.token_version,
        };
    }
    async unban(id, adminId) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`User ${id} not found`);
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                is_banned: false,
                ban_reason: null,
            },
        });
        await this.audit.log(adminId, 'user_unban', {
            targetTable: 'users',
            targetId: String(id),
            description: `Unbanned user ${updated.user_code}`,
            oldData: {
                is_banned: existing.is_banned,
                ban_reason: existing.ban_reason,
            },
            newData: { is_banned: updated.is_banned, ban_reason: updated.ban_reason },
        });
        return {
            id: updated.id,
            is_banned: updated.is_banned,
            ban_reason: updated.ban_reason,
        };
    }
    async adjustWallet(id, dto, adminId) {
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id } });
            if (!user) {
                throw new common_1.NotFoundException(`User ${id} not found`);
            }
            const amount = new client_1.Prisma.Decimal(dto.amount);
            const newBalance = dto.type === 'credit'
                ? user.wallet_balance.plus(amount)
                : user.wallet_balance.minus(amount);
            if (dto.type === 'debit' && newBalance.lessThan(0)) {
                throw new common_1.BadRequestException('Debit would take the wallet balance negative');
            }
            const source = dto.type === 'credit' ? 'admin_credit' : 'admin_debit';
            const updatedUser = await tx.user.update({
                where: { id },
                data: { wallet_balance: newBalance },
            });
            const transaction = await tx.walletTransaction.create({
                data: {
                    user_id: id,
                    type: dto.type,
                    source,
                    amount,
                    balance_after: newBalance,
                    description: dto.description,
                },
            });
            return { user, updatedUser, transaction };
        });
        await this.audit.log(adminId, 'wallet_adjustment', {
            targetTable: 'users',
            targetId: String(id),
            description: `${dto.type === 'credit' ? 'Credited' : 'Debited'} ${dto.amount} for user ${result.user.user_code}`,
            newData: {
                type: dto.type,
                amount: dto.amount,
                balanceAfter: result.updatedUser.wallet_balance.toString(),
            },
        });
        return {
            userId: id,
            walletBalance: result.updatedUser.wallet_balance,
            transaction: result.transaction,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map