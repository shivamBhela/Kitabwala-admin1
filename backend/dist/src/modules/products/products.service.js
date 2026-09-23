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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const VENDOR_LIST_SELECT = {
    id: true,
    store_name: true,
};
const VENDOR_DETAIL_SELECT = {
    id: true,
    store_name: true,
    store_slug: true,
    is_verified: true,
    is_active: true,
    commission_rate: true,
};
const PRODUCT_LIST_INCLUDE = {
    vendor: { select: VENDOR_LIST_SELECT },
    images: { where: { is_primary: true }, take: 1 },
};
const PRODUCT_DETAIL_INCLUDE = {
    vendor: { select: VENDOR_DETAIL_SELECT },
    images: { orderBy: { display_order: 'asc' } },
    attributes: true,
    city_prices: { include: { city: true } },
    product_categories: { include: { category: true } },
};
let ProductsService = class ProductsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        if (query.minPrice !== undefined && query.maxPrice !== undefined && query.maxPrice < query.minPrice) {
            throw new common_1.BadRequestException('maxPrice must be greater than or equal to minPrice');
        }
        const priceFilters = [];
        if (query.minPrice !== undefined)
            priceFilters.push(this.priceBoundCondition('gte', query.minPrice));
        if (query.maxPrice !== undefined)
            priceFilters.push(this.priceBoundCondition('lte', query.maxPrice));
        const where = {
            ...(query.status && { status: query.status }),
            ...(query.vendor_id !== undefined && { vendor_id: query.vendor_id }),
            ...(query.category_id !== undefined && {
                product_categories: { some: { category_id: query.category_id } },
            }),
            ...(query.search && {
                OR: [
                    { title: { contains: query.search, mode: 'insensitive' } },
                    { sku: { contains: query.search, mode: 'insensitive' } },
                    { isbn: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
            ...(priceFilters.length > 0 && { AND: priceFilters }),
        };
        const [total, data] = await Promise.all([
            this.prisma.product.count({ where }),
            this.prisma.product.findMany({
                where,
                include: PRODUCT_LIST_INCLUDE,
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
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: PRODUCT_DETAIL_INCLUDE,
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product ${id} not found`);
        }
        return product;
    }
    async getProductOrThrow(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException(`Product ${id} not found`);
        }
        return product;
    }
    priceBoundCondition(op, value) {
        const bound = op === 'gte' ? { gte: value } : { lte: value };
        return {
            OR: [{ sale_price: { not: null, ...bound } }, { sale_price: null, regular_price: { ...bound } }],
        };
    }
    async assertCategoriesExist(ids) {
        const unique = Array.from(new Set(ids));
        const found = await this.prisma.category.findMany({ where: { id: { in: unique } }, select: { id: true } });
        const foundIds = new Set(found.map((c) => c.id));
        const missing = unique.filter((id) => !foundIds.has(id));
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`Category id(s) not found: ${missing.join(', ')}`);
        }
    }
    async create(dto, adminId) {
        const vendor = await this.prisma.vendorProfile.findUnique({ where: { id: dto.vendor_id } });
        if (!vendor) {
            throw new common_1.BadRequestException(`Vendor ${dto.vendor_id} does not exist`);
        }
        if (dto.category_ids && dto.category_ids.length > 0) {
            await this.assertCategoriesExist(dto.category_ids);
        }
        let created;
        try {
            created = await this.prisma.$transaction(async (tx) => {
                const product = await tx.product.create({
                    data: {
                        vendor_id: dto.vendor_id,
                        title: dto.title,
                        slug: dto.slug,
                        description: dto.description,
                        short_description: dto.short_description,
                        regular_price: dto.regular_price,
                        sale_price: dto.sale_price,
                        base_price: dto.base_price,
                        gst_rate: dto.gst_rate,
                        hsn_code: dto.hsn_code,
                        sku: dto.sku,
                        isbn: dto.isbn,
                        author: dto.author,
                        publisher: dto.publisher,
                        edition: dto.edition,
                        language: dto.language,
                        pages: dto.pages,
                        binding: dto.binding,
                        genre: dto.genre,
                        book_format: dto.book_format,
                        condition: dto.condition,
                        condition_description: dto.condition_description,
                        stock_quantity: dto.stock_quantity,
                        manage_stock: dto.manage_stock,
                        in_stock: dto.in_stock,
                        weight: dto.weight,
                        dimensions: dto.dimensions,
                        status: client_1.ProductStatus.pending_review,
                        meta_title: dto.meta_title,
                        meta_description: dto.meta_description,
                    },
                });
                if (dto.category_ids && dto.category_ids.length > 0) {
                    await tx.productCategory.createMany({
                        data: dto.category_ids.map((category_id) => ({ product_id: product.id, category_id })),
                    });
                }
                return product;
            });
        }
        catch (err) {
            throw this.mapWriteError(err, dto.slug, dto.sku);
        }
        await this.audit.log(adminId, 'product_create', {
            targetTable: 'products',
            targetId: String(created.id),
            description: `Created product "${created.title}" (${created.slug}) for vendor ${created.vendor_id}`,
            newData: { title: created.title, slug: created.slug, vendor_id: created.vendor_id, status: created.status },
        });
        return this.findOne(created.id);
    }
    async update(id, dto, adminId) {
        const existing = await this.getProductOrThrow(id);
        if (dto.vendor_id !== undefined) {
            const vendor = await this.prisma.vendorProfile.findUnique({ where: { id: dto.vendor_id } });
            if (!vendor) {
                throw new common_1.BadRequestException(`Vendor ${dto.vendor_id} does not exist`);
            }
        }
        if (dto.category_ids !== undefined && dto.category_ids.length > 0) {
            await this.assertCategoriesExist(dto.category_ids);
        }
        try {
            await this.prisma.$transaction(async (tx) => {
                await tx.product.update({
                    where: { id },
                    data: {
                        vendor_id: dto.vendor_id,
                        title: dto.title,
                        slug: dto.slug,
                        description: dto.description,
                        short_description: dto.short_description,
                        regular_price: dto.regular_price,
                        sale_price: dto.sale_price,
                        base_price: dto.base_price,
                        gst_rate: dto.gst_rate,
                        hsn_code: dto.hsn_code,
                        sku: dto.sku,
                        isbn: dto.isbn,
                        author: dto.author,
                        publisher: dto.publisher,
                        edition: dto.edition,
                        language: dto.language,
                        pages: dto.pages,
                        binding: dto.binding,
                        genre: dto.genre,
                        book_format: dto.book_format,
                        condition: dto.condition,
                        condition_description: dto.condition_description,
                        stock_quantity: dto.stock_quantity,
                        manage_stock: dto.manage_stock,
                        in_stock: dto.in_stock,
                        weight: dto.weight,
                        dimensions: dto.dimensions,
                        meta_title: dto.meta_title,
                        meta_description: dto.meta_description,
                    },
                });
                if (dto.category_ids !== undefined) {
                    await tx.productCategory.deleteMany({ where: { product_id: id } });
                    if (dto.category_ids.length > 0) {
                        await tx.productCategory.createMany({
                            data: dto.category_ids.map((category_id) => ({ product_id: id, category_id })),
                        });
                    }
                }
            });
        }
        catch (err) {
            throw this.mapWriteError(err, dto.slug, dto.sku);
        }
        const updated = await this.findOne(id);
        await this.audit.log(adminId, 'product_update', {
            targetTable: 'products',
            targetId: String(id),
            description: `Updated product "${existing.title}" (fields: ${Object.keys(dto).join(', ') || 'none'})`,
            oldData: JSON.parse(JSON.stringify(existing)),
            newData: JSON.parse(JSON.stringify(dto)),
        });
        return updated;
    }
    async remove(id, adminId) {
        const existing = await this.getProductOrThrow(id);
        try {
            await this.prisma.$transaction(async (tx) => {
                await tx.productCategory.deleteMany({ where: { product_id: id } });
                await tx.productCityPrice.deleteMany({ where: { product_id: id } });
                await tx.product.delete({ where: { id } });
            });
        }
        catch (err) {
            throw new common_1.BadRequestException(`Failed to delete product ${id}: ${err}`);
        }
        await this.audit.log(adminId, 'product_update', {
            targetTable: 'products',
            targetId: String(id),
            description: `Deleted product "${existing.title}"`,
            oldData: JSON.parse(JSON.stringify(existing)),
        });
        return { success: true };
    }
    mapWriteError(err, slug, sku) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            const conflicting = [slug && `slug "${slug}"`, sku && `sku "${sku}"`].filter(Boolean).join(' or ');
            return new common_1.ConflictException(`Product with ${conflicting || 'the given unique field(s)'} already exists`);
        }
        return err;
    }
    async approve(id, adminId) {
        const existing = await this.getProductOrThrow(id);
        if (existing.status !== client_1.ProductStatus.pending_review) {
            throw new common_1.BadRequestException(`Cannot approve a product in "${existing.status}" status — only "pending_review" listings can be approved.`);
        }
        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                status: client_1.ProductStatus.active,
                approved_by_id: adminId,
                approved_at: new Date(),
                rejection_reason: null,
            },
        });
        await this.audit.log(adminId, 'product_approve', {
            targetTable: 'products',
            targetId: String(id),
            description: `Approved product "${existing.title}"`,
            oldData: { status: existing.status },
            newData: {
                status: updated.status,
                approved_by_id: updated.approved_by_id,
                approved_at: updated.approved_at?.toISOString() ?? null,
            },
        });
        return this.findOne(id);
    }
    async reject(id, dto, adminId) {
        const existing = await this.getProductOrThrow(id);
        if (existing.status !== client_1.ProductStatus.pending_review) {
            throw new common_1.BadRequestException(`Cannot reject a product in "${existing.status}" status — only "pending_review" listings can be rejected.`);
        }
        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                status: client_1.ProductStatus.rejected,
                rejection_reason: dto.rejection_reason,
            },
        });
        await this.audit.log(adminId, 'product_reject', {
            targetTable: 'products',
            targetId: String(id),
            description: `Rejected product "${existing.title}": ${dto.rejection_reason}`,
            oldData: { status: existing.status },
            newData: { status: updated.status, rejection_reason: updated.rejection_reason },
        });
        return this.findOne(id);
    }
    async bulkApprove(dto, adminId) {
        const ids = Array.from(new Set(dto.ids));
        const approvedCount = await this.prisma.$transaction(async (tx) => {
            const products = await tx.product.findMany({ where: { id: { in: ids } }, select: { id: true, status: true } });
            const foundIds = new Set(products.map((p) => p.id));
            const missing = ids.filter((id) => !foundIds.has(id));
            if (missing.length > 0) {
                throw new common_1.NotFoundException(`Product id(s) not found: ${missing.join(', ')}`);
            }
            const notPending = products.filter((p) => p.status !== client_1.ProductStatus.pending_review);
            if (notPending.length > 0) {
                throw new common_1.BadRequestException(`Cannot bulk-approve — the following product id(s) are not in "pending_review" status: ${notPending
                    .map((p) => `${p.id} (${p.status})`)
                    .join(', ')}`);
            }
            const result = await tx.product.updateMany({
                where: { id: { in: ids } },
                data: {
                    status: client_1.ProductStatus.active,
                    approved_by_id: adminId,
                    approved_at: new Date(),
                    rejection_reason: null,
                },
            });
            return result.count;
        });
        await this.audit.log(adminId, 'product_approve', {
            targetTable: 'products',
            description: `Bulk-approved ${approvedCount} product(s): ids ${ids.join(', ')}`,
            newData: { ids, status: client_1.ProductStatus.active },
        });
        return { approved: approvedCount, ids };
    }
    async bulkDeactivate(dto, adminId) {
        const ids = Array.from(new Set(dto.ids));
        const deactivatedCount = await this.prisma.$transaction(async (tx) => {
            const products = await tx.product.findMany({ where: { id: { in: ids } }, select: { id: true } });
            const foundIds = new Set(products.map((p) => p.id));
            const missing = ids.filter((id) => !foundIds.has(id));
            if (missing.length > 0) {
                throw new common_1.NotFoundException(`Product id(s) not found: ${missing.join(', ')}`);
            }
            const result = await tx.product.updateMany({
                where: { id: { in: ids } },
                data: { status: client_1.ProductStatus.inactive },
            });
            return result.count;
        });
        await this.audit.log(adminId, 'product_bulk_deactivate', {
            targetTable: 'products',
            description: `Bulk-deactivated ${deactivatedCount} product(s): ids ${ids.join(', ')}`,
            newData: { ids, status: client_1.ProductStatus.inactive },
        });
        return { deactivated: deactivatedCount, ids };
    }
    async feature(id, dto, adminId) {
        const existing = await this.getProductOrThrow(id);
        const featuredUntil = new Date(dto.featured_until);
        if (Number.isNaN(featuredUntil.getTime())) {
            throw new common_1.BadRequestException(`featured_until "${dto.featured_until}" is not a valid date`);
        }
        if (featuredUntil.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('featured_until must be a date in the future');
        }
        const updated = await this.prisma.product.update({
            where: { id },
            data: { featured_until: featuredUntil },
        });
        await this.audit.log(adminId, 'product_update', {
            targetTable: 'products',
            targetId: String(id),
            description: `Set featured_until to ${featuredUntil.toISOString()} for product "${existing.title}"`,
            oldData: { featured_until: existing.featured_until?.toISOString() ?? null },
            newData: { featured_until: updated.featured_until?.toISOString() ?? null },
        });
        return this.findOne(id);
    }
    async unfeature(id, adminId) {
        const existing = await this.getProductOrThrow(id);
        await this.prisma.product.update({
            where: { id },
            data: { featured_until: null },
        });
        await this.audit.log(adminId, 'product_update', {
            targetTable: 'products',
            targetId: String(id),
            description: `Removed featured status for product "${existing.title}"`,
            oldData: { featured_until: existing.featured_until?.toISOString() ?? null },
            newData: { featured_until: null },
        });
        return this.findOne(id);
    }
    async listCityPrices(productId) {
        await this.getProductOrThrow(productId);
        return this.prisma.productCityPrice.findMany({
            where: { product_id: productId },
            include: { city: true },
            orderBy: { city: { name: 'asc' } },
        });
    }
    async upsertCityPrice(productId, cityId, dto, adminId) {
        await this.getProductOrThrow(productId);
        const city = await this.prisma.city.findUnique({ where: { id: cityId } });
        if (!city) {
            throw new common_1.BadRequestException(`City ${cityId} does not exist`);
        }
        const existing = await this.prisma.productCityPrice.findUnique({
            where: { product_id_city_id: { product_id: productId, city_id: cityId } },
        });
        const updated = await this.prisma.productCityPrice.upsert({
            where: { product_id_city_id: { product_id: productId, city_id: cityId } },
            create: { product_id: productId, city_id: cityId, price: dto.price },
            update: { price: dto.price },
            include: { city: true },
        });
        await this.audit.log(adminId, 'product_update', {
            targetTable: 'product_city_prices',
            targetId: String(updated.id),
            description: `Set city price for product ${productId} in city "${city.name}" to ${dto.price}`,
            oldData: { price: existing ? existing.price.toString() : null },
            newData: { price: updated.price.toString() },
        });
        return updated;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, audit_service_1.AuditService])
], ProductsService);
//# sourceMappingURL=products.service.js.map