import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WithdrawalStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListWithdrawalsQueryDto } from './dto/list-withdrawals-query.dto';
import type { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import type { CompleteWithdrawalDto } from './dto/complete-withdrawal.dto';

/** Vendor fields an admin needs visible to actually process a payout. */
const VENDOR_SELECT = {
  id: true,
  store_name: true,
  bank_account_number: true,
  bank_ifsc: true,
  bank_account_name: true,
  upi_id: true,
  pending_balance: true,
} satisfies Prisma.VendorProfileSelect;

@Injectable()
export class WithdrawalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: ListWithdrawalsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.WithdrawalRequestWhereInput = {
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

  async findOne(id: number) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id },
      include: { vendor: { select: VENDOR_SELECT } },
    });
    if (!withdrawal) {
      throw new NotFoundException(`Withdrawal request ${id} not found`);
    }
    return withdrawal;
  }

  /** Loads the withdrawal with its full vendor record (needed for the balance check on approve). */
  private async getWithdrawalOrThrow(id: number) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id },
      include: { vendor: true },
    });
    if (!withdrawal) {
      throw new NotFoundException(`Withdrawal request ${id} not found`);
    }
    return withdrawal;
  }

  async approve(id: number, adminId: number) {
    const withdrawal = await this.getWithdrawalOrThrow(id);

    if (withdrawal.status !== WithdrawalStatus.pending) {
      throw new BadRequestException(
        `Cannot approve a withdrawal in "${withdrawal.status}" status — only "pending" requests can be approved.`,
      );
    }

    if (withdrawal.vendor.pending_balance.lessThan(withdrawal.amount)) {
      throw new BadRequestException(
        `Vendor's pending balance (${withdrawal.vendor.pending_balance.toString()}) is insufficient to cover this withdrawal amount (${withdrawal.amount.toString()}).`,
      );
    }

    const updated = await this.prisma.withdrawalRequest.update({
      where: { id },
      data: { status: WithdrawalStatus.approved, processed_at: new Date() },
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

  async reject(id: number, dto: RejectWithdrawalDto, adminId: number) {
    const withdrawal = await this.getWithdrawalOrThrow(id);

    if (withdrawal.status !== WithdrawalStatus.pending && withdrawal.status !== WithdrawalStatus.approved) {
      throw new BadRequestException(
        `Cannot reject a withdrawal in "${withdrawal.status}" status — only "pending" or "approved" requests can be rejected.`,
      );
    }

    const updated = await this.prisma.withdrawalRequest.update({
      where: { id },
      data: {
        status: WithdrawalStatus.rejected,
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

  /**
   * Marks a withdrawal completed and settles the vendor's ledger atomically.
   *
   * `dto.payment_reference` is the real UTR/bank reference the admin manually typed into
   * the request body — `CompleteWithdrawalDto` rejects blank/placeholder values. This
   * method (and nothing else in this module) must never generate, default, or fabricate
   * that value; it is only ever persisted verbatim from admin input.
   */
  async complete(id: number, dto: CompleteWithdrawalDto, adminId: number) {
    const withdrawal = await this.getWithdrawalOrThrow(id);

    if (withdrawal.status !== WithdrawalStatus.approved) {
      throw new BadRequestException(
        `Cannot complete a withdrawal that hasn't been approved yet (current status: "${withdrawal.status}").`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const completedWithdrawal = await tx.withdrawalRequest.update({
        where: { id },
        data: {
          status: WithdrawalStatus.completed,
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
}
