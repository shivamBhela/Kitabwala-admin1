import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListVendorsQueryDto } from './dto/list-vendors-query.dto';
import type { VerifyKycDto } from './dto/verify-kyc.dto';
import type { UpdateCommissionDto } from './dto/update-commission.dto';
import type { UpdateBankDetailsDto } from './dto/update-bank-details.dto';
import type { VacationModeDto } from './dto/vacation-mode.dto';

/** Columns for the vendor list screen — denormalized aggregates + verification/status flags. */
const VENDOR_LIST_SELECT = {
  id: true,
  store_name: true,
  store_slug: true,
  phone: true,
  city: true,
  state: true,
  gstin: true,
  commission_rate: true,
  total_earnings: true,
  total_withdrawn: true,
  pending_balance: true,
  average_rating: true,
  total_reviews: true,
  total_orders: true,
  total_products: true,
  is_verified: true,
  is_active: true,
  vacation_mode: true,
  created_at: true,
} satisfies Prisma.VendorProfileSelect;

const RECENT_ORDER_ITEMS_LIMIT = 10;
const RECENT_WITHDRAWALS_LIMIT = 10;

@Injectable()
export class VendorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async getVendorOrThrow(id: number) {
    const vendor = await this.prisma.vendorProfile.findUnique({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor ${id} not found`);
    }
    return vendor;
  }

  /** Paginated, filterable vendor list for the admin portal's Vendor Management screen. */
  async findAll(query: ListVendorsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.VendorProfileWhereInput = {
      ...(query.is_verified !== undefined && { is_verified: query.is_verified }),
      ...(query.is_active !== undefined && { is_active: query.is_active }),
      ...(query.search && {
        OR: [
          { store_name: { contains: query.search, mode: 'insensitive' } },
          { gstin: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.vendorProfile.findMany({
        where,
        select: VENDOR_LIST_SELECT,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vendorProfile.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  /**
   * Full vendor detail: every VendorProfile column (including bank/KYC data an admin needs
   * to review or edit), plus a recent-activity summary — the vendor's slice of recent orders
   * (via VendorOrderItem, which carries the commission/earning/settlement breakdown per
   * order — richer than OrderItem for this purpose) and recent withdrawal requests.
   */
  async findOne(id: number) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, user_code: true, display_name: true, phone: true, email: true },
        },
      },
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor ${id} not found`);
    }

    const [recentOrders, recentWithdrawals] = await Promise.all([
      this.prisma.vendorOrderItem.findMany({
        where: { vendor_id: id },
        select: {
          id: true,
          order_id: true,
          order: { select: { order_number: true, status: true, created_at: true } },
          commission_rate: true,
          commission_amount: true,
          vendor_earning: true,
          status: true,
          settlement_status: true,
          settled_at: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        take: RECENT_ORDER_ITEMS_LIMIT,
      }),
      this.prisma.withdrawalRequest.findMany({
        where: { vendor_id: id },
        orderBy: { requested_at: 'desc' },
        take: RECENT_WITHDRAWALS_LIMIT,
      }),
    ]);

    return { ...vendor, recent_orders: recentOrders, recent_withdrawals: recentWithdrawals };
  }

  /** Sets is_verified=true and stores the (freeform) submitted KYC form data verbatim. */
  async verifyKyc(id: number, dto: VerifyKycDto, adminId: number) {
    const vendor = await this.getVendorOrThrow(id);

    const updated = await this.prisma.vendorProfile.update({
      where: { id },
      data: {
        is_verified: true,
        kyc_form_data: dto.kyc_form_data as Prisma.InputJsonValue,
      },
    });

    await this.audit.log(adminId, 'vendor_verify', {
      targetTable: 'vendor_profiles',
      targetId: String(id),
      description: `Verified KYC for vendor "${vendor.store_name}"`,
      oldData: { is_verified: vendor.is_verified, kyc_form_data: vendor.kyc_form_data as Prisma.InputJsonValue },
      newData: { is_verified: updated.is_verified, kyc_form_data: updated.kyc_form_data as Prisma.InputJsonValue },
    });

    return updated;
  }

  /** Per-vendor commission override (0-100%); schema default is 10 and only applies to new vendors. */
  async updateCommission(id: number, dto: UpdateCommissionDto, adminId: number) {
    const vendor = await this.getVendorOrThrow(id);

    const updated = await this.prisma.vendorProfile.update({
      where: { id },
      data: { commission_rate: new Prisma.Decimal(dto.commission_rate) },
    });

    await this.audit.log(adminId, 'vendor_commission_update', {
      targetTable: 'vendor_profiles',
      targetId: String(id),
      description: `Changed commission rate for vendor "${vendor.store_name}" from ${vendor.commission_rate.toString()}% to ${updated.commission_rate.toString()}%`,
      oldData: { commission_rate: vendor.commission_rate.toString() },
      newData: { commission_rate: updated.commission_rate.toString() },
    });

    return updated;
  }

  /**
   * Suspends a vendor (is_active=false) and, in the same transaction, deactivates every
   * currently-`active` product they have (leaving draft/pending_review/inactive/rejected
   * products untouched). The affected product ids are recorded on the audit log so a later
   * per-product reactivation decision (reactivate is deliberately NOT automatic) has
   * something concrete to act on.
   */
  async suspend(id: number, adminId: number) {
    const vendor = await this.getVendorOrThrow(id);

    if (!vendor.is_active) {
      throw new BadRequestException(`Vendor ${id} is already suspended.`);
    }

    const { updatedVendor, deactivatedProductIds } = await this.prisma.$transaction(async (tx) => {
      const activeProducts = await tx.product.findMany({
        where: { vendor_id: id, status: ProductStatus.active },
        select: { id: true },
      });

      if (activeProducts.length > 0) {
        await tx.product.updateMany({
          where: { id: { in: activeProducts.map((p) => p.id) } },
          data: { status: ProductStatus.inactive },
        });
      }

      const updated = await tx.vendorProfile.update({
        where: { id },
        data: { is_active: false },
      });

      return { updatedVendor: updated, deactivatedProductIds: activeProducts.map((p) => p.id) };
    });

    await this.audit.log(adminId, 'vendor_suspend', {
      targetTable: 'vendor_profiles',
      targetId: String(id),
      description: `Suspended vendor "${vendor.store_name}"; auto-deactivated ${deactivatedProductIds.length} active product(s).`,
      oldData: { is_active: vendor.is_active },
      newData: { is_active: updatedVendor.is_active, deactivated_product_ids: deactivatedProductIds },
    });

    return { ...updatedVendor, deactivated_product_ids: deactivatedProductIds };
  }

  /**
   * Reactivates a suspended vendor (is_active=true only). Deliberately does NOT touch any
   * products — re-enabling a product is a separate, per-product admin decision.
   */
  async reactivate(id: number, adminId: number) {
    const vendor = await this.getVendorOrThrow(id);

    if (vendor.is_active) {
      throw new BadRequestException(`Vendor ${id} is already active.`);
    }

    const updated = await this.prisma.vendorProfile.update({
      where: { id },
      data: { is_active: true },
    });

    await this.audit.log(adminId, 'vendor_reactivate', {
      targetTable: 'vendor_profiles',
      targetId: String(id),
      description: `Reactivated vendor "${vendor.store_name}" (products were not auto-reactivated)`,
      oldData: { is_active: vendor.is_active },
      newData: { is_active: updated.is_active },
    });

    return updated;
  }

  /** Partial bank-detail update — every field is individually optional but at least one must be given. */
  async updateBankDetails(id: number, dto: UpdateBankDetailsDto, adminId: number) {
    if (
      dto.bank_account_number === undefined &&
      dto.bank_ifsc === undefined &&
      dto.bank_account_name === undefined &&
      dto.upi_id === undefined
    ) {
      throw new BadRequestException(
        'At least one of bank_account_number, bank_ifsc, bank_account_name, upi_id must be provided.',
      );
    }

    const vendor = await this.getVendorOrThrow(id);

    const updated = await this.prisma.vendorProfile.update({
      where: { id },
      data: {
        ...(dto.bank_account_number !== undefined && { bank_account_number: dto.bank_account_number }),
        ...(dto.bank_ifsc !== undefined && { bank_ifsc: dto.bank_ifsc }),
        ...(dto.bank_account_name !== undefined && { bank_account_name: dto.bank_account_name }),
        ...(dto.upi_id !== undefined && { upi_id: dto.upi_id }),
      },
    });

    await this.audit.log(adminId, 'vendor_bank_update', {
      targetTable: 'vendor_profiles',
      targetId: String(id),
      description: `Updated bank details for vendor "${vendor.store_name}"`,
      oldData: {
        bank_account_number: vendor.bank_account_number,
        bank_ifsc: vendor.bank_ifsc,
        bank_account_name: vendor.bank_account_name,
        upi_id: vendor.upi_id,
      },
      newData: {
        bank_account_number: updated.bank_account_number,
        bank_ifsc: updated.bank_ifsc,
        bank_account_name: updated.bank_account_name,
        upi_id: updated.upi_id,
      },
    });

    return updated;
  }

  /**
   * Toggles vacation mode. Turning it off always clears any stored message (it no longer
   * applies); turning it on stores whatever message was supplied (or clears it, if none was
   * given in this call) — the message is never carried over from a previous, unrelated call.
   */
  async setVacationMode(id: number, dto: VacationModeDto, adminId: number) {
    const vendor = await this.getVendorOrThrow(id);

    const updated = await this.prisma.vendorProfile.update({
      where: { id },
      data: {
        vacation_mode: dto.vacation_mode,
        vacation_message: dto.vacation_mode ? (dto.vacation_message ?? null) : null,
      },
    });

    await this.audit.log(adminId, 'vendor_vacation_mode', {
      targetTable: 'vendor_profiles',
      targetId: String(id),
      description: `${dto.vacation_mode ? 'Enabled' : 'Disabled'} vacation mode for vendor "${vendor.store_name}"`,
      oldData: { vacation_mode: vendor.vacation_mode, vacation_message: vendor.vacation_message },
      newData: { vacation_mode: updated.vacation_mode, vacation_message: updated.vacation_message },
    });

    return updated;
  }
}
