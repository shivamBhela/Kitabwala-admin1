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
exports.VendorsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
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
};
const RECENT_ORDER_ITEMS_LIMIT = 10;
const RECENT_WITHDRAWALS_LIMIT = 10;
let VendorsService = class VendorsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async getVendorOrThrow(id) {
        const vendor = await this.prisma.vendorProfile.findUnique({ where: { id } });
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor ${id} not found`);
        }
        return vendor;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
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
    async findOne(id) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, user_code: true, display_name: true, phone: true, email: true },
                },
            },
        });
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor ${id} not found`);
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
    async verifyKyc(id, dto, adminId) {
        const vendor = await this.getVendorOrThrow(id);
        const updated = await this.prisma.vendorProfile.update({
            where: { id },
            data: {
                is_verified: true,
                kyc_form_data: dto.kyc_form_data,
            },
        });
        await this.audit.log(adminId, 'vendor_verify', {
            targetTable: 'vendor_profiles',
            targetId: String(id),
            description: `Verified KYC for vendor "${vendor.store_name}"`,
            oldData: { is_verified: vendor.is_verified, kyc_form_data: vendor.kyc_form_data },
            newData: { is_verified: updated.is_verified, kyc_form_data: updated.kyc_form_data },
        });
        return updated;
    }
    async updateCommission(id, dto, adminId) {
        const vendor = await this.getVendorOrThrow(id);
        const updated = await this.prisma.vendorProfile.update({
            where: { id },
            data: { commission_rate: new client_1.Prisma.Decimal(dto.commission_rate) },
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
    async suspend(id, adminId) {
        const vendor = await this.getVendorOrThrow(id);
        if (!vendor.is_active) {
            throw new common_1.BadRequestException(`Vendor ${id} is already suspended.`);
        }
        const { updatedVendor, deactivatedProductIds } = await this.prisma.$transaction(async (tx) => {
            const activeProducts = await tx.product.findMany({
                where: { vendor_id: id, status: client_1.ProductStatus.active },
                select: { id: true },
            });
            if (activeProducts.length > 0) {
                await tx.product.updateMany({
                    where: { id: { in: activeProducts.map((p) => p.id) } },
                    data: { status: client_1.ProductStatus.inactive },
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
    async reactivate(id, adminId) {
        const vendor = await this.getVendorOrThrow(id);
        if (vendor.is_active) {
            throw new common_1.BadRequestException(`Vendor ${id} is already active.`);
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
    async updateBankDetails(id, dto, adminId) {
        if (dto.bank_account_number === undefined &&
            dto.bank_ifsc === undefined &&
            dto.bank_account_name === undefined &&
            dto.upi_id === undefined) {
            throw new common_1.BadRequestException('At least one of bank_account_number, bank_ifsc, bank_account_name, upi_id must be provided.');
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
    async setVacationMode(id, dto, adminId) {
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
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, audit_service_1.AuditService])
], VendorsService);
//# sourceMappingURL=vendors.service.js.map