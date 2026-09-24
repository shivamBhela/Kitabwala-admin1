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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const VENDOR_SELECT = {
    id: true,
    store_name: true,
    bank_account_number: true,
    bank_ifsc: true,
    bank_account_name: true,
    upi_id: true,
    pending_balance: true,
};
let WithdrawalsService = class WithdrawalsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
            ...(query.status ? { status: query.status } : {}),
            ...(query.vendor_id ? { vendor_id: query.vendor_id } : {}),
        };
        const [total, data] = await Promise.all([
            this.prisma.withdrawalRequest.count({ where }),
            this.prisma.withdrawalRequest.findMany({
                where,
                include: { vendor: { select: VENDOR_SELECT } },
                orderBy: { requested_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
        };
    }
    async findOne(id) {
        const withdrawal = await this.prisma.withdrawalRequest.findUnique({
            where: { id },
            include: { vendor: { select: VENDOR_SELECT } },
        });
        if (!withdrawal) {
            throw new common_1.NotFoundException(`Withdrawal request ${id} not found`);
        }
        return withdrawal;
    }
    async getWithdrawalOrThrow(id) {
        const withdrawal = await this.prisma.withdrawalRequest.findUnique({
            where: { id },
            include: { vendor: true },
        });
        if (!withdrawal) {
            throw new common_1.NotFoundException(`Withdrawal request ${id} not found`);
        }
        return withdrawal;
    }
    async approve(id, adminId) {
        const withdrawal = await this.getWithdrawalOrThrow(id);
        if (withdrawal.status !== client_1.WithdrawalStatus.pending) {
            throw new common_1.BadRequestException(`Cannot approve a withdrawal in "${withdrawal.status}" status — only "pending" requests can be approved.`);
        }
        if (withdrawal.vendor.pending_balance.lessThan(withdrawal.amount)) {
            throw new common_1.BadRequestException(`Vendor's pending balance (${withdrawal.vendor.pending_balance.toString()}) is insufficient to cover this withdrawal amount (${withdrawal.amount.toString()}).`);
        }
        const updated = await this.prisma.withdrawalRequest.update({
            where: { id },
            data: { status: client_1.WithdrawalStatus.approved, processed_at: new Date() },
            include: { vendor: { select: VENDOR_SELECT } },
        });
        await this.audit.log(adminId, 'withdrawal_approve', {
            targetTable: 'withdrawal_requests',
            targetId: String(id),
            oldData: { status: withdrawal.status },
            newData: { status: updated.status, processed_at: updated.processed_at },
        });
        return updated;
    }
    async reject(id, dto, adminId) {
        const withdrawal = await this.getWithdrawalOrThrow(id);
        if (withdrawal.status !== client_1.WithdrawalStatus.pending && withdrawal.status !== client_1.WithdrawalStatus.approved) {
            throw new common_1.BadRequestException(`Cannot reject a withdrawal in "${withdrawal.status}" status — only "pending" or "approved" requests can be rejected.`);
        }
        const updated = await this.prisma.withdrawalRequest.update({
            where: { id },
            data: {
                status: client_1.WithdrawalStatus.rejected,
                admin_note: dto.admin_note,
                processed_at: new Date(),
            },
            include: { vendor: { select: VENDOR_SELECT } },
        });
        await this.audit.log(adminId, 'withdrawal_reject', {
            targetTable: 'withdrawal_requests',
            targetId: String(id),
            oldData: { status: withdrawal.status },
            newData: { status: updated.status, admin_note: updated.admin_note },
        });
        return updated;
    }
    async complete(id, dto, adminId) {
        const withdrawal = await this.getWithdrawalOrThrow(id);
        if (withdrawal.status !== client_1.WithdrawalStatus.approved) {
            throw new common_1.BadRequestException(`Cannot complete a withdrawal that hasn't been approved yet (current status: "${withdrawal.status}").`);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const completedWithdrawal = await tx.withdrawalRequest.update({
                where: { id },
                data: {
                    status: client_1.WithdrawalStatus.completed,
                    payment_reference: dto.payment_reference,
                    admin_note: dto.admin_note,
                },
                include: { vendor: { select: VENDOR_SELECT } },
            });
            await tx.vendorProfile.update({
                where: { id: withdrawal.vendor_id },
                data: {
                    total_withdrawn: { increment: withdrawal.amount },
                    pending_balance: { decrement: withdrawal.amount },
                },
            });
            return completedWithdrawal;
        });
        await this.audit.log(adminId, 'withdrawal_complete', {
            targetTable: 'withdrawal_requests',
            targetId: String(id),
            oldData: { status: withdrawal.status },
            newData: { status: updated.status, payment_reference: updated.payment_reference },
        });
        return updated;
    }
};
exports.WithdrawalsService = WithdrawalsService;
exports.WithdrawalsService = WithdrawalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], WithdrawalsService);
//# sourceMappingURL=withdrawals.service.js.map