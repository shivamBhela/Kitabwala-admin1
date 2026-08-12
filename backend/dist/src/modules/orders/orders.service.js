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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const ORDER_LIST_SELECT = {
    id: true,
    order_number: true,
    status: true,
    payment_status: true,
    payment_method: true,
    delivery_type: true,
    is_cod: true,
    city_id: true,
    pincode: true,
    subtotal: true,
    total: true,
    refund_amount: true,
    created_at: true,
    delivered_at: true,
    cancelled_at: true,
    user: { select: { id: true, display_name: true, phone: true, email: true } },
    city: { select: { id: true, name: true } },
    _count: { select: { order_items: true } },
};
const ALLOWED_TRANSITIONS = {
    [client_1.OrderStatus.pending]: [client_1.OrderStatus.confirmed, client_1.OrderStatus.cancelled],
    [client_1.OrderStatus.confirmed]: [client_1.OrderStatus.processing, client_1.OrderStatus.cancelled],
    [client_1.OrderStatus.processing]: [client_1.OrderStatus.shipped, client_1.OrderStatus.cancelled],
    [client_1.OrderStatus.shipped]: [client_1.OrderStatus.out_for_delivery, client_1.OrderStatus.cancelled],
    [client_1.OrderStatus.out_for_delivery]: [
        client_1.OrderStatus.delivered,
        client_1.OrderStatus.cancelled,
    ],
    [client_1.OrderStatus.delivered]: [client_1.OrderStatus.return_requested],
    [client_1.OrderStatus.return_requested]: [client_1.OrderStatus.returned],
    [client_1.OrderStatus.cancelled]: [],
    [client_1.OrderStatus.returned]: [],
};
let OrdersService = class OrdersService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const createdAtFilter = {};
        if (query.dateFrom)
            createdAtFilter.gte = new Date(query.dateFrom);
        if (query.dateTo)
            createdAtFilter.lte = new Date(query.dateTo);
        const where = {
            ...(query.status && { status: query.status }),
            ...(query.payment_status && { payment_status: query.payment_status }),
            ...(query.payment_method && { payment_method: query.payment_method }),
            ...(query.delivery_type && { delivery_type: query.delivery_type }),
            ...(query.city_id !== undefined && { city_id: query.city_id }),
            ...(query.vendor_id !== undefined && {
                order_items: { some: { vendor_id: query.vendor_id } },
            }),
            ...(Object.keys(createdAtFilter).length > 0 && {
                created_at: createdAtFilter,
            }),
            ...(query.search && {
                OR: [
                    { order_number: { contains: query.search, mode: 'insensitive' } },
                    {
                        user: {
                            display_name: { contains: query.search, mode: 'insensitive' },
                        },
                    },
                    { user: { phone: { contains: query.search, mode: 'insensitive' } } },
                    { user: { email: { contains: query.search, mode: 'insensitive' } } },
                ],
            }),
        };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                select: ORDER_LIST_SELECT,
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);
        const items = rows.map(({ _count, ...order }) => ({
            ...order,
            item_count: _count.order_items,
        }));
        return {
            items,
            page,
            limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        user_code: true,
                        display_name: true,
                        phone: true,
                        email: true,
                    },
                },
                city: { select: { id: true, name: true } },
                coupon: true,
                order_items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                sku: true,
                                author: true,
                            },
                        },
                        vendor: {
                            select: { id: true, store_name: true, store_slug: true },
                        },
                    },
                },
                order_addresses: true,
                vendor_order_items: {
                    include: {
                        vendor: { select: { id: true, store_name: true } },
                        order_item: { select: { id: true, product_name: true } },
                    },
                },
                shipments: {
                    include: {
                        delivery_person: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                                vehicle_type: true,
                                vehicle_number: true,
                            },
                        },
                    },
                },
                wallet_transactions: true,
                coupon_usages: {
                    include: {
                        coupon: {
                            select: { id: true, code: true, type: true, value: true },
                        },
                    },
                },
                return_requests: {
                    include: { order_item: { select: { id: true, product_name: true } } },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${id} not found`);
        }
        const timeline = [
            { label: 'Order Placed', at: order.created_at },
        ];
        if (order.delivered_at)
            timeline.push({ label: 'Delivered', at: order.delivered_at });
        if (order.cancelled_at)
            timeline.push({ label: 'Cancelled', at: order.cancelled_at });
        if (order.refunded_at)
            timeline.push({ label: 'Refunded', at: order.refunded_at });
        timeline.sort((a, b) => a.at.getTime() - b.at.getTime());
        return { ...order, timeline };
    }
    async updateStatus(id, dto, adminId) {
        if (dto.status === client_1.OrderStatus.cancelled) {
            throw new common_1.BadRequestException('Use PATCH /orders/:id/cancel to cancel an order — it requires a cancellation reason and correctly triggers any owed refund. This endpoint does not.');
        }
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${id} not found`);
        }
        const allowedNext = ALLOWED_TRANSITIONS[order.status] ?? [];
        if (!allowedNext.includes(dto.status)) {
            throw new common_1.BadRequestException(allowedNext.length > 0
                ? `Cannot change order status from "${order.status}" to "${dto.status}". Allowed next status(es): ${allowedNext.join(', ')}.`
                : `Order ${id} is in a terminal status ("${order.status}") and its status can no longer be changed.`);
        }
        const data = { status: dto.status };
        if (dto.status === client_1.OrderStatus.delivered && !order.delivered_at) {
            data.delivered_at = new Date();
        }
        const updated = await this.prisma.order.update({ where: { id }, data });
        await this.audit.log(adminId, 'order_status_update', {
            targetTable: 'orders',
            targetId: String(id),
            description: `Order ${order.order_number} status changed from "${order.status}" to "${updated.status}"`,
            oldData: { status: order.status },
            newData: {
                status: updated.status,
                delivered_at: updated.delivered_at,
                cancelled_at: updated.cancelled_at,
            },
        });
        return updated;
    }
    async refund(id, dto, adminId) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${id} not found`);
        }
        const amount = new client_1.Prisma.Decimal(dto.amount);
        const previousRefundAmount = order.refund_amount ?? new client_1.Prisma.Decimal(0);
        const previousPaymentStatus = order.payment_status;
        const updatedOrder = await this.prisma.$transaction((tx) => this.applyRefundInTx(tx, order, amount, dto.method));
        await this.audit.log(adminId, 'order_refund', {
            targetTable: 'orders',
            targetId: String(id),
            description: dto.reason ??
                `Refund of ${dto.amount} for order ${order.order_number} via ${dto.method}`,
            oldData: {
                refund_amount: previousRefundAmount.toString(),
                payment_status: previousPaymentStatus,
            },
            newData: {
                amount: dto.amount,
                method: dto.method,
                reason: dto.reason,
                refund_amount: updatedOrder.refund_amount?.toString(),
                payment_status: updatedOrder.payment_status,
            },
        });
        return updatedOrder;
    }
    async cancel(id, dto, adminId) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${id} not found`);
        }
        const allowedNext = ALLOWED_TRANSITIONS[order.status] ?? [];
        if (!allowedNext.includes(client_1.OrderStatus.cancelled)) {
            throw new common_1.BadRequestException(`Order ${id} cannot be cancelled from its current status ("${order.status}").`);
        }
        const previousRefundAmount = order.refund_amount ?? new client_1.Prisma.Decimal(0);
        const previousPaymentStatus = order.payment_status;
        const remainingRefundable = order.total.minus(previousRefundAmount);
        const wasPaid = order.payment_status === client_1.PaymentStatus.paid ||
            order.payment_status === client_1.PaymentStatus.partially_refunded;
        const shouldAutoRefund = wasPaid && remainingRefundable.greaterThan(0);
        const { finalOrder, refunded } = await this.prisma.$transaction(async (tx) => {
            const cancelledOrder = await tx.order.update({
                where: { id },
                data: {
                    status: client_1.OrderStatus.cancelled,
                    cancellation_reason: dto.cancellation_reason,
                    cancelled_at: order.cancelled_at ?? new Date(),
                },
            });
            if (!shouldAutoRefund) {
                return { finalOrder: cancelledOrder, refunded: false };
            }
            const refundedOrder = await this.applyRefundInTx(tx, order, remainingRefundable, client_1.RefundMethod.original_payment);
            return { finalOrder: refundedOrder, refunded: true };
        });
        await this.audit.log(adminId, 'order_cancel', {
            targetTable: 'orders',
            targetId: String(id),
            description: dto.cancellation_reason,
            oldData: { status: order.status, payment_status: previousPaymentStatus },
            newData: {
                status: finalOrder.status,
                cancellation_reason: finalOrder.cancellation_reason,
                cancelled_at: finalOrder.cancelled_at,
            },
        });
        if (refunded) {
            await this.audit.log(adminId, 'order_refund', {
                targetTable: 'orders',
                targetId: String(id),
                description: `Auto-refund triggered by cancellation of order ${order.order_number}: ${dto.cancellation_reason}`,
                oldData: {
                    refund_amount: previousRefundAmount.toString(),
                    payment_status: previousPaymentStatus,
                },
                newData: {
                    amount: remainingRefundable.toString(),
                    method: client_1.RefundMethod.original_payment,
                    refund_amount: finalOrder.refund_amount?.toString(),
                    payment_status: finalOrder.payment_status,
                },
            });
        }
        return finalOrder;
    }
    async getInvoiceNumber(id, adminId) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            select: {
                id: true,
                order_number: true,
                invoice_number: true,
                payment_status: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${id} not found`);
        }
        if (order.invoice_number) {
            return { invoice_number: order.invoice_number };
        }
        if (order.payment_status !== client_1.PaymentStatus.paid) {
            throw new common_1.BadRequestException(`Order ${id} has no invoice number yet and cannot be invoiced until it is paid (current payment status: "${order.payment_status}").`);
        }
        const invoiceNumber = `INV-${order.order_number}`;
        const updated = await this.prisma.order.update({
            where: { id },
            data: { invoice_number: invoiceNumber },
            select: { invoice_number: true },
        });
        await this.audit.log(adminId, 'order_invoice_generated', {
            targetTable: 'orders',
            targetId: String(id),
            description: `Generated invoice number for order ${order.order_number}`,
            newData: { invoice_number: updated.invoice_number },
        });
        return { invoice_number: updated.invoice_number };
    }
    async applyRefundInTx(tx, order, amount, method) {
        const refundablePaymentStatuses = [
            client_1.PaymentStatus.paid,
            client_1.PaymentStatus.partially_refunded,
        ];
        if (!refundablePaymentStatuses.includes(order.payment_status)) {
            throw new common_1.BadRequestException(`Order ${order.id} cannot be refunded — its payment_status is "${order.payment_status}", meaning no payment has been collected (or it's already fully refunded).`);
        }
        const alreadyRefunded = order.refund_amount ?? new client_1.Prisma.Decimal(0);
        const remaining = order.total.minus(alreadyRefunded);
        if (amount.greaterThan(remaining)) {
            throw new common_1.BadRequestException(`Refund amount (${amount.toString()}) exceeds the maximum refundable amount of ${remaining.toString()} ` +
                `(order total ${order.total.toString()} minus ${alreadyRefunded.toString()} already refunded).`);
        }
        const newRefundTotal = alreadyRefunded.plus(amount);
        const newPaymentStatus = newRefundTotal.greaterThanOrEqualTo(order.total)
            ? client_1.PaymentStatus.refunded
            : client_1.PaymentStatus.partially_refunded;
        const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: {
                refund_amount: newRefundTotal,
                payment_status: newPaymentStatus,
                refunded_at: new Date(),
            },
        });
        if (method === client_1.RefundMethod.wallet) {
            const user = await tx.user.findUnique({ where: { id: order.user_id } });
            if (!user) {
                throw new common_1.NotFoundException(`User ${order.user_id} not found`);
            }
            const newBalance = user.wallet_balance.plus(amount);
            await tx.user.update({
                where: { id: order.user_id },
                data: { wallet_balance: newBalance },
            });
            await tx.walletTransaction.create({
                data: {
                    user_id: order.user_id,
                    type: client_1.WalletTransactionType.credit,
                    source: client_1.WalletTransactionSource.order_refund,
                    amount,
                    balance_after: newBalance,
                    order_id: order.id,
                    description: `Refund credited to wallet for order ${order.id}`,
                },
            });
        }
        return updatedOrder;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map