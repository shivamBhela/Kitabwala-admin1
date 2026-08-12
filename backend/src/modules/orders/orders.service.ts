import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  RefundMethod,
  WalletTransactionSource,
  WalletTransactionType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import type { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import type { RefundOrderDto } from './dto/refund-order.dto';
import type { CancelOrderDto } from './dto/cancel-order.dto';

/** Fields the order list screen needs — kept lean, the full record is only fetched in findOne(). */
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
} satisfies Prisma.OrderSelect;

/**
 * Simple forward-only lifecycle state machine. Maps each status to the set of statuses it
 * may move to next — used by both PATCH /orders/:id/status (generic manual override) and
 * PATCH /orders/:id/cancel (which additionally requires a reason and may trigger a refund).
 * No entry (or an empty array) means the status is terminal.
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.pending]: [OrderStatus.confirmed, OrderStatus.cancelled],
  [OrderStatus.confirmed]: [OrderStatus.processing, OrderStatus.cancelled],
  [OrderStatus.processing]: [OrderStatus.shipped, OrderStatus.cancelled],
  [OrderStatus.shipped]: [OrderStatus.out_for_delivery, OrderStatus.cancelled],
  [OrderStatus.out_for_delivery]: [
    OrderStatus.delivered,
    OrderStatus.cancelled,
  ],
  [OrderStatus.delivered]: [OrderStatus.return_requested],
  [OrderStatus.return_requested]: [OrderStatus.returned],
  [OrderStatus.cancelled]: [],
  [OrderStatus.returned]: [],
};

/** Minimal shape applyRefundInTx needs — callers pass either a freshly-fetched Order or a subset of it. */
interface RefundableOrder {
  id: number;
  total: Prisma.Decimal;
  refund_amount: Prisma.Decimal | null;
  payment_status: PaymentStatus;
  user_id: number;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Paginated, filterable order list for the admin portal's Order Management screen. */
  async findAll(query: ListOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const createdAtFilter: Prisma.DateTimeFilter = {};
    if (query.dateFrom) createdAtFilter.gte = new Date(query.dateFrom);
    if (query.dateTo) createdAtFilter.lte = new Date(query.dateTo);

    const where: Prisma.OrderWhereInput = {
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

  /**
   * Full order detail: every Order column, item/address/vendor-split/shipment/wallet/coupon/
   * return-request breakdown, and a plain chronological timeline built only from the
   * Order-level timestamp fields that actually exist and are set (created_at always; delivered_at/
   * cancelled_at/refunded_at only if set) — never a fabricated or inferred timestamp.
   */
  async findOne(id: number) {
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
      throw new NotFoundException(`Order ${id} not found`);
    }

    const timeline: { label: string; at: Date }[] = [
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

  /**
   * Manual lifecycle status change. Only allows moves that ALLOWED_TRANSITIONS says are valid
   * from the order's current status — no backward jumps (e.g. delivered -> pending) and no
   * skipping straight past cancelled/return_requested-only branches. Auto-stamps delivered_at/
   * cancelled_at the first time the order enters those statuses.
   */
  async updateStatus(id: number, dto: UpdateOrderStatusDto, adminId: number) {
    // Cancelling must always go through PATCH /orders/:id/cancel, which requires a reason
    // and correctly triggers any owed refund via applyRefundInTx. ALLOWED_TRANSITIONS lists
    // `cancelled` as reachable from several statuses (it's shared with cancel()'s own
    // from-state check), but this generic endpoint must never honor it directly — otherwise
    // an order could be silently cancelled with no reason recorded and no refund issued.
    if (dto.status === OrderStatus.cancelled) {
      throw new BadRequestException(
        'Use PATCH /orders/:id/cancel to cancel an order — it requires a cancellation reason and correctly triggers any owed refund. This endpoint does not.',
      );
    }

    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    const allowedNext = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowedNext.includes(dto.status)) {
      throw new BadRequestException(
        allowedNext.length > 0
          ? `Cannot change order status from "${order.status}" to "${dto.status}". Allowed next status(es): ${allowedNext.join(', ')}.`
          : `Order ${id} is in a terminal status ("${order.status}") and its status can no longer be changed.`,
      );
    }

    // dto.status can never be 'cancelled' here — the guard at the top of this method
    // rejects that and requires PATCH /orders/:id/cancel instead, which stamps
    // cancelled_at itself.
    const data: Prisma.OrderUpdateInput = { status: dto.status };
    if (dto.status === OrderStatus.delivered && !order.delivered_at) {
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

  /**
   * Processes a refund (full or partial), enforcing the non-negotiable cap: the requested
   * amount can never exceed (order.total - amount already refunded so far). Over-refund
   * requests are rejected with the maximum refundable amount stated explicitly — never clamped.
   */
  async refund(id: number, dto: RefundOrderDto, adminId: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    const amount = new Prisma.Decimal(dto.amount);
    const previousRefundAmount = order.refund_amount ?? new Prisma.Decimal(0);
    const previousPaymentStatus = order.payment_status;

    const updatedOrder = await this.prisma.$transaction((tx) =>
      this.applyRefundInTx(tx, order, amount, dto.method),
    );

    await this.audit.log(adminId, 'order_refund', {
      targetTable: 'orders',
      targetId: String(id),
      description:
        dto.reason ??
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

  /**
   * Cancels an order with a mandatory reason. If the order's payment had already gone through
   * (payment_status === 'paid' — not merely 'pending', as on an unpaid COD order), automatically
   * refunds the full remaining refundable amount via the original payment method, reusing
   * applyRefundInTx rather than duplicating the cap/wallet/payment-status logic.
   */
  async cancel(id: number, dto: CancelOrderDto, adminId: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    const allowedNext = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowedNext.includes(OrderStatus.cancelled)) {
      throw new BadRequestException(
        `Order ${id} cannot be cancelled from its current status ("${order.status}").`,
      );
    }

    const previousRefundAmount = order.refund_amount ?? new Prisma.Decimal(0);
    const previousPaymentStatus = order.payment_status;
    const remainingRefundable = order.total.minus(previousRefundAmount);
    // Money was actually collected if payment_status is 'paid' OR 'partially_refunded' —
    // checking only '=== paid' meant an order that had already received one partial refund
    // (which flips payment_status to 'partially_refunded') would never auto-refund its
    // remaining balance on cancellation. 'pending'/'failed' orders never collected payment
    // in the first place, so they correctly still don't trigger a refund here.
    const wasPaid =
      order.payment_status === PaymentStatus.paid ||
      order.payment_status === PaymentStatus.partially_refunded;
    const shouldAutoRefund = wasPaid && remainingRefundable.greaterThan(0);

    const { finalOrder, refunded } = await this.prisma.$transaction(
      async (tx) => {
        const cancelledOrder = await tx.order.update({
          where: { id },
          data: {
            status: OrderStatus.cancelled,
            cancellation_reason: dto.cancellation_reason,
            cancelled_at: order.cancelled_at ?? new Date(),
          },
        });

        if (!shouldAutoRefund) {
          return { finalOrder: cancelledOrder, refunded: false };
        }

        const refundedOrder = await this.applyRefundInTx(
          tx,
          order,
          remainingRefundable,
          RefundMethod.original_payment,
        );
        return { finalOrder: refundedOrder, refunded: true };
      },
    );

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
          method: RefundMethod.original_payment,
          refund_amount: finalOrder.refund_amount?.toString(),
          payment_status: finalOrder.payment_status,
        },
      });
    }

    return finalOrder;
  }

  /**
   * Returns the order's persisted invoice number, generating and persisting one (format
   * `INV-{order_number}`) on first request if the order has been paid. Never fabricates an
   * invoice number for an order that hasn't actually been paid.
   */
  async getInvoiceNumber(id: number, adminId: number) {
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
      throw new NotFoundException(`Order ${id} not found`);
    }

    if (order.invoice_number) {
      return { invoice_number: order.invoice_number };
    }

    if (order.payment_status !== PaymentStatus.paid) {
      throw new BadRequestException(
        `Order ${id} has no invoice number yet and cannot be invoiced until it is paid (current payment status: "${order.payment_status}").`,
      );
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

  /**
   * Shared refund core used by both refund() and cancel(). Enforces the refund cap, updates
   * order.refund_amount/payment_status/refunded_at, and — for wallet refunds — credits the
   * user's wallet_balance and records a WalletTransaction, all within the caller's transaction.
   * Never audit-logs itself; callers log after their transaction commits (matching this
   * codebase's established convention of logging outside the $transaction).
   */
  private async applyRefundInTx(
    tx: Prisma.TransactionClient,
    order: RefundableOrder,
    amount: Prisma.Decimal,
    method: RefundMethod,
  ) {
    // Never credit a refund for money that was never actually collected. Without this,
    // POST /orders/:id/refund could be called on a still-pending (unpaid COD) or failed
    // order and would happily credit the customer's wallet — fabricating money for a
    // transaction that never happened.
    const refundablePaymentStatuses: PaymentStatus[] = [
      PaymentStatus.paid,
      PaymentStatus.partially_refunded,
    ];
    if (!refundablePaymentStatuses.includes(order.payment_status)) {
      throw new BadRequestException(
        `Order ${order.id} cannot be refunded — its payment_status is "${order.payment_status}", meaning no payment has been collected (or it's already fully refunded).`,
      );
    }

    const alreadyRefunded = order.refund_amount ?? new Prisma.Decimal(0);
    const remaining = order.total.minus(alreadyRefunded);

    if (amount.greaterThan(remaining)) {
      throw new BadRequestException(
        `Refund amount (${amount.toString()}) exceeds the maximum refundable amount of ${remaining.toString()} ` +
          `(order total ${order.total.toString()} minus ${alreadyRefunded.toString()} already refunded).`,
      );
    }

    const newRefundTotal = alreadyRefunded.plus(amount);
    const newPaymentStatus = newRefundTotal.greaterThanOrEqualTo(order.total)
      ? PaymentStatus.refunded
      : PaymentStatus.partially_refunded;

    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        refund_amount: newRefundTotal,
        payment_status: newPaymentStatus,
        refunded_at: new Date(),
      },
    });

    if (method === RefundMethod.wallet) {
      const user = await tx.user.findUnique({ where: { id: order.user_id } });
      if (!user) {
        throw new NotFoundException(`User ${order.user_id} not found`);
      }

      const newBalance = user.wallet_balance.plus(amount);
      await tx.user.update({
        where: { id: order.user_id },
        data: { wallet_balance: newBalance },
      });
      await tx.walletTransaction.create({
        data: {
          user_id: order.user_id,
          type: WalletTransactionType.credit,
          source: WalletTransactionSource.order_refund,
          amount,
          balance_after: newBalance,
          order_id: order.id,
          description: `Refund credited to wallet for order ${order.id}`,
        },
      });
    }

    return updatedOrder;
  }
}
