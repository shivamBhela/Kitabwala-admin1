import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  OrderItemStatus,
  OrderStatus,
  PaymentStatus,
  Prisma,
  RefundMethod,
  ReturnRequestStatus,
  WalletTransactionSource,
  WalletTransactionType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListReturnsQueryDto } from './dto/list-returns-query.dto';
import type { ApproveReturnDto } from './dto/approve-return.dto';
import type { RejectReturnDto } from './dto/reject-return.dto';
import type { RefundReturnDto } from './dto/refund-return.dto';

/** Fallback used only when AppSetting has no return_window_days row yet (not seeded). */
const DEFAULT_RETURN_WINDOW_DAYS = 7;

/** Fields an admin needs to triage a return from the list view, per module. */
const LIST_INCLUDE = {
  order: { select: { id: true, order_number: true } },
  order_item: { select: { id: true, product_name: true, total_price: true, vendor_id: true } },
  user: { select: { id: true, display_name: true, phone: true } },
} satisfies Prisma.ReturnRequestInclude;

/** Full relations needed for the detail view and for every mutating action's validations. */
const DETAIL_INCLUDE = {
  order: true,
  order_item: true,
  user: { select: { id: true, display_name: true, phone: true, email: true, wallet_balance: true } },
} satisfies Prisma.ReturnRequestInclude;

@Injectable()
export class ReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: ListReturnsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ReturnRequestWhereInput = {
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

  async findOne(id: number) {
    return this.getReturnOrThrow(id);
  }

  /** Loads a return request with the relations every mutating action needs to validate against. */
  private async getReturnOrThrow(id: number) {
    const returnRequest = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });
    if (!returnRequest) {
      throw new NotFoundException(`Return request ${id} not found`);
    }
    return returnRequest;
  }

  /**
   * "2026-08-01" (date-only, no time component) is widened to the end of that calendar
   * day so dateTo behaves inclusively; a full ISO datetime is used as-is.
   */
  private endOfFilterDay(dateTo: string): Date {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateTo) ? new Date(`${dateTo}T23:59:59.999Z`) : new Date(dateTo);
  }

  /** Reads the global return policy window, falling back cleanly if AppSetting isn't seeded. */
  private async getReturnWindowDays(): Promise<number> {
    const setting = await this.prisma.appSetting.findUnique({ where: { key: 'return_window_days' } });
    if (!setting) return DEFAULT_RETURN_WINDOW_DAYS;
    const parsed = Number.parseInt(setting.value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_RETURN_WINDOW_DAYS;
  }

  /**
   * Enforces the "return must be requested within N days of delivery" policy. Skipped
   * entirely when the order has no delivered_at yet — nothing to measure the window from.
   */
  private async assertWithinReturnWindow(returnRequest: {
    created_at: Date;
    order: { delivered_at: Date | null };
  }): Promise<void> {
    if (!returnRequest.order.delivered_at) return;

    const windowDays = await this.getReturnWindowDays();
    const deadline = new Date(returnRequest.order.delivered_at);
    deadline.setDate(deadline.getDate() + windowDays);

    if (returnRequest.created_at.getTime() > deadline.getTime()) {
      throw new BadRequestException(
        `Return window has expired — the order was delivered on ${returnRequest.order.delivered_at.toISOString()} and this return was requested on ${returnRequest.created_at.toISOString()}, more than the allowed ${windowDays} day(s) later.`,
      );
    }
  }

  async approve(id: number, dto: ApproveReturnDto, adminId: number) {
    const existing = await this.getReturnOrThrow(id);

    if (existing.status !== ReturnRequestStatus.pending) {
      throw new BadRequestException(
        `Cannot approve a return request in "${existing.status}" status — only "pending" requests can be approved.`,
      );
    }

    await this.assertWithinReturnWindow(existing);

    const updated = await this.prisma.returnRequest.update({
      where: { id },
      data: {
        status: ReturnRequestStatus.approved,
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

  async reject(id: number, dto: RejectReturnDto, adminId: number) {
    const existing = await this.getReturnOrThrow(id);

    if (existing.status !== ReturnRequestStatus.pending) {
      throw new BadRequestException(
        `Cannot reject a return request in "${existing.status}" status — only "pending" requests can be rejected.`,
      );
    }

    const updated = await this.prisma.returnRequest.update({
      where: { id },
      data: {
        status: ReturnRequestStatus.rejected,
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

  /**
   * Sets the refund amount/method and advances the return to refund_initiated. Runs
   * entirely inside one transaction (re-checking status against a fresh row) so a
   * concurrent call can never double-refund; the wallet credit (if any), the new
   * WalletTransaction row, and the ReturnRequest update either all land or none do.
   */
  async refund(id: number, dto: RefundReturnDto, adminId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const returnRequest = await tx.returnRequest.findUnique({
        where: { id },
        include: DETAIL_INCLUDE,
      });
      if (!returnRequest) {
        throw new NotFoundException(`Return request ${id} not found`);
      }
      if (returnRequest.status !== ReturnRequestStatus.approved) {
        throw new BadRequestException(
          `Cannot refund a return request in "${returnRequest.status}" status — only "approved" requests can be refunded.`,
        );
      }

      const refundAmount = new Prisma.Decimal(dto.refund_amount);

      // Cap cumulatively against every OTHER return request on this same order item that
      // has already reached refund_initiated/completed — capping only against the item's
      // total_price on every call would let two separate approved return requests on the
      // same item each be refunded up to the full total_price independently, over-refunding it.
      const alreadyRefundedForItem = await tx.returnRequest.aggregate({
        where: {
          order_item_id: returnRequest.order_item_id,
          id: { not: id },
          status: { in: [ReturnRequestStatus.refund_initiated, ReturnRequestStatus.completed] },
        },
        _sum: { refund_amount: true },
      });
      const alreadyRefundedElsewhere = alreadyRefundedForItem._sum.refund_amount ?? new Prisma.Decimal(0);
      const cap = returnRequest.order_item.total_price.minus(alreadyRefundedElsewhere);
      if (refundAmount.greaterThan(cap)) {
        throw new BadRequestException(
          `refund_amount (${refundAmount.toString()}) exceeds the remaining refundable amount for this item ` +
            `(${cap.toString()} — order item total ${returnRequest.order_item.total_price.toString()} minus ` +
            `${alreadyRefundedElsewhere.toString()} already refunded via other return requests on this item).`,
        );
      }

      // Sync the parent Order's own refund ledger in the same transaction. Without this,
      // OrdersService's refund()/cancel() compute their cap as order.total - order.refund_amount
      // with no idea a return-driven refund already happened — a later order-level refund or
      // cancellation could then refund the same money a second time.
      const order = await tx.order.findUnique({
        where: { id: returnRequest.order_id },
        select: { id: true, total: true, refund_amount: true, payment_status: true },
      });
      if (!order) {
        throw new NotFoundException(`Order ${returnRequest.order_id} not found`);
      }
      // Same gate as OrdersService.applyRefundInTx — never credit a refund for money that
      // was never actually collected (an order still pending/failed payment, or one that's
      // already been refunded in full).
      const refundableOrderPaymentStatuses: PaymentStatus[] = [
        PaymentStatus.paid,
        PaymentStatus.partially_refunded,
      ];
      if (!refundableOrderPaymentStatuses.includes(order.payment_status)) {
        throw new BadRequestException(
          `Order ${order.id} cannot be refunded — its payment_status is "${order.payment_status}", meaning no payment has been collected (or it's already fully refunded).`,
        );
      }
      const previousOrderRefund = order.refund_amount ?? new Prisma.Decimal(0);
      const newOrderRefundTotal = previousOrderRefund.plus(refundAmount);
      if (newOrderRefundTotal.greaterThan(order.total)) {
        // Should be unreachable if item totals sum to the order total, but guard anyway
        // rather than silently let the order-level ledger exceed the order's own total.
        throw new BadRequestException(
          `Refunding ${refundAmount.toString()} for this item would bring the order's total refunded ` +
            `amount to ${newOrderRefundTotal.toString()}, which exceeds the order total of ${order.total.toString()}.`,
        );
      }
      const newOrderPaymentStatus = newOrderRefundTotal.greaterThanOrEqualTo(order.total)
        ? PaymentStatus.refunded
        : PaymentStatus.partially_refunded;
      await tx.order.update({
        where: { id: order.id },
        data: {
          refund_amount: newOrderRefundTotal,
          payment_status: newOrderPaymentStatus,
          refunded_at: new Date(),
        },
      });

      let walletTransaction: { id: number } | null = null;
      if (dto.refund_method === RefundMethod.wallet) {
        const newBalance = returnRequest.user.wallet_balance.plus(refundAmount);
        await tx.user.update({
          where: { id: returnRequest.user_id },
          data: { wallet_balance: newBalance },
        });
        walletTransaction = await tx.walletTransaction.create({
          data: {
            user_id: returnRequest.user_id,
            type: WalletTransactionType.credit,
            source: WalletTransactionSource.order_refund,
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
          status: ReturnRequestStatus.refund_initiated,
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

  async complete(id: number, adminId: number) {
    const existing = await this.getReturnOrThrow(id);

    if (
      existing.status !== ReturnRequestStatus.refund_initiated &&
      existing.status !== ReturnRequestStatus.picked_up
    ) {
      throw new BadRequestException(
        `Cannot complete a return request in "${existing.status}" status — only "refund_initiated" or "picked_up" requests can be completed.`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedReturn = await tx.returnRequest.update({
        where: { id },
        data: { status: ReturnRequestStatus.completed },
        include: DETAIL_INCLUDE,
      });

      // Advance the underlying OrderItem/Order status too — the schema's
      // return_requested -> returned transitions exist specifically for this, but nothing
      // else in the codebase drives them; without this, Order/OrderItem rows are left
      // exactly as they were (e.g. still 'delivered') forever after a return completes.
      await tx.orderItem.update({
        where: { id: existing.order_item_id },
        data: { status: OrderItemStatus.returned },
      });

      const remainingActiveItems = await tx.orderItem.count({
        where: { order_id: existing.order_id, status: { not: OrderItemStatus.returned } },
      });
      if (remainingActiveItems === 0) {
        // Every item on this order has now been returned — advance the order itself.
        // A partial return (some items still active) deliberately leaves Order.status alone.
        await tx.order.update({
          where: { id: existing.order_id },
          data: { status: OrderStatus.returned },
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
}
