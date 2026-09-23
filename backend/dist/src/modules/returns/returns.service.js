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
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const DEFAULT_RETURN_WINDOW_DAYS = 7;
const LIST_INCLUDE = {
    order: { select: { id: true, order_number: true } },
    order_item: { select: { id: true, product_name: true, total_price: true, vendor_id: true } },
    user: { select: { id: true, display_name: true, phone: true } },
};
const DETAIL_INCLUDE = {
    order: true,
    order_item: true,
    user: { select: { id: true, display_name: true, phone: true, email: true, wallet_balance: true } },
};
let ReturnsService = class ReturnsService {
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
            ...(query.reason ? { reason: query.reason } : {}),
            ...(query.vendor_id !== undefined ? { order_item: { vendor_id: query.vendor_id } } : {}),
        };
        if (query.dateFrom || query.dateTo) {
            where.created_at = {
                ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
                ...(query.dateTo ? { lte: this.endOfFilterDay(query.dateTo) } : {}),
            };
        }
        const [total, data] = await Promise.all([
            this.prisma.returnRequest.count({ where }),
            this.prisma.returnRequest.findMany({
                where,
                include: LIST_INCLUDE,
                orderBy: { created_at: 'desc' },
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
        return this.getReturnOrThrow(id);
    }
    async getReturnOrThrow(id) {
        const returnRequest = await this.prisma.returnRequest.findUnique({
            where: { id },
            include: DETAIL_INCLUDE,
        });
        if (!returnRequest) {
            throw new common_1.NotFoundException(`Return request ${id} not found`);
        }
        return returnRequest;
    }
    endOfFilterDay(dateTo) {
        return /^\d{4}-\d{2}-\d{2}$/.test(dateTo) ? new Date(`${dateTo}T23:59:59.999Z`) : new Date(dateTo);
    }
    async getReturnWindowDays() {
        const setting = await this.prisma.appSetting.findUnique({ where: { key: 'return_window_days' } });
        if (!setting)
            return DEFAULT_RETURN_WINDOW_DAYS;
        const parsed = Number.parseInt(setting.value, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_RETURN_WINDOW_DAYS;
    }
    async assertWithinReturnWindow(returnRequest) {
        if (!returnRequest.order.delivered_at)
            return;
        const windowDays = await this.getReturnWindowDays();
        const deadline = new Date(returnRequest.order.delivered_at);
        deadline.setDate(deadline.getDate() + windowDays);
        if (returnRequest.created_at.getTime() > deadline.getTime()) {
            throw new common_1.BadRequestException(`Return window has expired — the order was delivered on ${returnRequest.order.delivered_at.toISOString()} and this return was requested on ${returnRequest.created_at.toISOString()}, more than the allowed ${windowDays} day(s) later.`);
        }
    }
    async approve(id, dto, adminId) {
        const existing = await this.getReturnOrThrow(id);
        if (existing.status !== client_1.ReturnRequestStatus.pending) {
            throw new common_1.BadRequestException(`Cannot approve a return request in "${existing.status}" status — only "pending" requests can be approved.`);
        }
        await this.assertWithinReturnWindow(existing);
        const updated = await this.prisma.returnRequest.update({
            where: { id },
            data: {
                status: client_1.ReturnRequestStatus.approved,
                admin_note: dto.admin_note,
                reviewed_by_id: adminId,
                reviewed_at: new Date(),
            },
            include: DETAIL_INCLUDE,
        });
        await this.audit.log(adminId, 'order_refund', {
            targetTable: 'return_requests',
            targetId: String(id),
            description: `Return request #${id} approved${dto.admin_note ? `: ${dto.admin_note}` : ''}`,
            oldData: { status: existing.status },
            newData: { status: updated.status, reviewed_by_id: updated.reviewed_by_id, reviewed_at: updated.reviewed_at },
        });
        return updated;
    }
    async reject(id, dto, adminId) {
        const existing = await this.getReturnOrThrow(id);
        if (existing.status !== client_1.ReturnRequestStatus.pending) {
            throw new common_1.BadRequestException(`Cannot reject a return request in "${existing.status}" status — only "pending" requests can be rejected.`);
        }
        const updated = await this.prisma.returnRequest.update({
            where: { id },
            data: {
                status: client_1.ReturnRequestStatus.rejected,
                admin_note: dto.admin_note,
                reviewed_by_id: adminId,
                reviewed_at: new Date(),
            },
            include: DETAIL_INCLUDE,
        });
        await this.audit.log(adminId, 'order_refund', {
            targetTable: 'return_requests',
            targetId: String(id),
            description: `Return request #${id} rejected: ${dto.admin_note}`,
            oldData: { status: existing.status },
            newData: { status: updated.status, admin_note: updated.admin_note },
        });
        return updated;
    }
    async refund(id, dto, adminId) {
        const result = await this.prisma.$transaction(async (tx) => {
            const returnRequest = await tx.returnRequest.findUnique({
                where: { id },
                include: DETAIL_INCLUDE,
            });
            if (!returnRequest) {
                throw new common_1.NotFoundException(`Return request ${id} not found`);
            }
            if (returnRequest.status !== client_1.ReturnRequestStatus.approved) {
                throw new common_1.BadRequestException(`Cannot refund a return request in "${returnRequest.status}" status — only "approved" requests can be refunded.`);
            }
            const refundAmount = new client_1.Prisma.Decimal(dto.refund_amount);
            const alreadyRefundedForItem = await tx.returnRequest.aggregate({
                where: {
                    order_item_id: returnRequest.order_item_id,
                    id: { not: id },
                    status: { in: [client_1.ReturnRequestStatus.refund_initiated, client_1.ReturnRequestStatus.completed] },
                },
                _sum: { refund_amount: true },
            });
            const alreadyRefundedElsewhere = alreadyRefundedForItem._sum.refund_amount ?? new client_1.Prisma.Decimal(0);
            const cap = returnRequest.order_item.total_price.minus(alreadyRefundedElsewhere);
            if (refundAmount.greaterThan(cap)) {
                throw new common_1.BadRequestException(`refund_amount (${refundAmount.toString()}) exceeds the remaining refundable amount for this item ` +
                    `(${cap.toString()} — order item total ${returnRequest.order_item.total_price.toString()} minus ` +
                    `${alreadyRefundedElsewhere.toString()} already refunded via other return requests on this item).`);
            }
            const order = await tx.order.findUnique({
                where: { id: returnRequest.order_id },
                select: { id: true, total: true, refund_amount: true, payment_status: true },
            });
            if (!order) {
                throw new common_1.NotFoundException(`Order ${returnRequest.order_id} not found`);
            }
            const refundableOrderPaymentStatuses = [
                client_1.PaymentStatus.paid,
                client_1.PaymentStatus.partially_refunded,
            ];
            if (!refundableOrderPaymentStatuses.includes(order.payment_status)) {
                throw new common_1.BadRequestException(`Order ${order.id} cannot be refunded — its payment_status is "${order.payment_status}", meaning no payment has been collected (or it's already fully refunded).`);
            }
            const previousOrderRefund = order.refund_amount ?? new client_1.Prisma.Decimal(0);
            const newOrderRefundTotal = previousOrderRefund.plus(refundAmount);
            if (newOrderRefundTotal.greaterThan(order.total)) {
                throw new common_1.BadRequestException(`Refunding ${refundAmount.toString()} for this item would bring the order's total refunded ` +
                    `amount to ${newOrderRefundTotal.toString()}, which exceeds the order total of ${order.total.toString()}.`);
            }
            const newOrderPaymentStatus = newOrderRefundTotal.greaterThanOrEqualTo(order.total)
                ? client_1.PaymentStatus.refunded
                : client_1.PaymentStatus.partially_refunded;
            await tx.order.update({
                where: { id: order.id },
                data: {
                    refund_amount: newOrderRefundTotal,
                    payment_status: newOrderPaymentStatus,
                    refunded_at: new Date(),
                },
            });
            let walletTransaction = null;
            if (dto.refund_method === client_1.RefundMethod.wallet) {
                const newBalance = returnRequest.user.wallet_balance.plus(refundAmount);
                await tx.user.update({
                    where: { id: returnRequest.user_id },
                    data: { wallet_balance: newBalance },
                });
                walletTransaction = await tx.walletTransaction.create({
                    data: {
                        user_id: returnRequest.user_id,
                        type: client_1.WalletTransactionType.credit,
                        source: client_1.WalletTransactionSource.order_refund,
                        amount: refundAmount,
                        balance_after: newBalance,
                        order_id: returnRequest.order_id,
                        description: `Refund for return request #${id}`,
                    },
                });
            }
            const updated = await tx.returnRequest.update({
                where: { id },
                data: {
                    refund_amount: refundAmount,
                    refund_method: dto.refund_method,
                    status: client_1.ReturnRequestStatus.refund_initiated,
                },
                include: DETAIL_INCLUDE,
            });
            return { updated, walletTransaction, previousStatus: returnRequest.status };
        });
        await this.audit.log(adminId, 'order_refund', {
            targetTable: 'return_requests',
            targetId: String(id),
            description: `Return refund: request #${id} refunded ${dto.refund_amount} via ${dto.refund_method}`,
            oldData: { status: result.previousStatus },
            newData: {
                status: result.updated.status,
                refund_amount: result.updated.refund_amount,
                refund_method: result.updated.refund_method,
                wallet_transaction_id: result.walletTransaction?.id ?? null,
            },
        });
        return result.updated;
    }
    async complete(id, adminId) {
        const existing = await this.getReturnOrThrow(id);
        if (existing.status !== client_1.ReturnRequestStatus.refund_initiated &&
            existing.status !== client_1.ReturnRequestStatus.picked_up) {
            throw new common_1.BadRequestException(`Cannot complete a return request in "${existing.status}" status — only "refund_initiated" or "picked_up" requests can be completed.`);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const updatedReturn = await tx.returnRequest.update({
                where: { id },
                data: { status: client_1.ReturnRequestStatus.completed },
                include: DETAIL_INCLUDE,
            });
            await tx.orderItem.update({
                where: { id: existing.order_item_id },
                data: { status: client_1.OrderItemStatus.returned },
            });
            const remainingActiveItems = await tx.orderItem.count({
                where: { order_id: existing.order_id, status: { not: client_1.OrderItemStatus.returned } },
            });
            if (remainingActiveItems === 0) {
                await tx.order.update({
                    where: { id: existing.order_id },
                    data: { status: client_1.OrderStatus.returned },
                });
            }
            return updatedReturn;
        });
        await this.audit.log(adminId, 'order_refund', {
            targetTable: 'return_requests',
            targetId: String(id),
            description: `Return request #${id} marked completed`,
            oldData: { status: existing.status },
            newData: { status: updated.status },
        });
        return updated;
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, audit_service_1.AuditService])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map