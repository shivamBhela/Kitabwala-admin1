import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListProductsQueryDto } from './dto/list-products-query.dto';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import type { RejectProductDto } from './dto/reject-product.dto';
import type { BulkProductIdsDto } from './dto/bulk-product-ids.dto';
import type { FeatureProductDto } from './dto/feature-product.dto';
import type { UpsertCityPriceDto } from './dto/upsert-city-price.dto';

/** Vendor fields useful in the product list — kept narrow for list performance. */
const VENDOR_LIST_SELECT = {
  id: true,
  store_name: true,
} satisfies Prisma.VendorProfileSelect;

/** Fuller vendor context for the product detail view. */
const VENDOR_DETAIL_SELECT = {
  id: true,
  store_name: true,
  store_slug: true,
  is_verified: true,
  is_active: true,
  commission_rate: true,
} satisfies Prisma.VendorProfileSelect;

const PRODUCT_LIST_INCLUDE = {
  vendor: { select: VENDOR_LIST_SELECT },
  images: { where: { is_primary: true }, take: 1 },
} satisfies Prisma.ProductInclude;

const PRODUCT_DETAIL_INCLUDE = {
  vendor: { select: VENDOR_DETAIL_SELECT },
  images: { orderBy: { display_order: 'asc' } },
  attributes: true,
  city_prices: { include: { city: true } },
  product_categories: { include: { category: true } },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  async findAll(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    if (query.minPrice !== undefined && query.maxPrice !== undefined && query.maxPrice < query.minPrice) {
      throw new BadRequestException('maxPrice must be greater than or equal to minPrice');
    }

    const priceFilters: Prisma.ProductWhereInput[] = [];
    if (query.minPrice !== undefined) priceFilters.push(this.priceBoundCondition('gte', query.minPrice));
    if (query.maxPrice !== undefined) priceFilters.push(this.priceBoundCondition('lte', query.maxPrice));

    const where: Prisma.ProductWhereInput = {
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

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: PRODUCT_DETAIL_INCLUDE,
    });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  private async getProductOrThrow(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  /**
   * A product's effective, customer-facing price is sale_price when set, else
   * regular_price. Expressed as an OR of two mutually-exclusive branches so the min/max
   * price filters apply to the price a customer would actually see, not just regular_price.
   */
  private priceBoundCondition(op: 'gte' | 'lte', value: number): Prisma.ProductWhereInput {
    const bound = op === 'gte' ? { gte: value } : { lte: value };
    return {
      OR: [{ sale_price: { not: null, ...bound } }, { sale_price: null, regular_price: { ...bound } }],
    };
  }

  private async assertCategoriesExist(ids: number[]): Promise<void> {
    const unique = Array.from(new Set(ids));
    const found = await this.prisma.category.findMany({ where: { id: { in: unique } }, select: { id: true } });
    const foundIds = new Set(found.map((c) => c.id));
    const missing = unique.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new BadRequestException(`Category id(s) not found: ${missing.join(', ')}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Create / update
  // ---------------------------------------------------------------------------

  async create(dto: CreateProductDto, adminId: number) {
    const vendor = await this.prisma.vendorProfile.findUnique({ where: { id: dto.vendor_id } });
    if (!vendor) {
      throw new BadRequestException(`Vendor ${dto.vendor_id} does not exist`);
    }

    if (dto.category_ids && dto.category_ids.length > 0) {
      await this.assertCategoriesExist(dto.category_ids);
    }

    let created: { id: number; title: string; slug: string; vendor_id: number; status: ProductStatus };
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
            dimensions: dto.dimensions as Prisma.InputJsonValue | undefined,
            // Always created pending_review — status is not a CreateProductDto field
            // specifically so nothing can bypass the approve/reject audit trail.
            status: ProductStatus.pending_review,
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
    } catch (err) {
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

  async update(id: number, dto: UpdateProductDto, adminId: number) {
    const existing = await this.getProductOrThrow(id);

    if (dto.vendor_id !== undefined) {
      const vendor = await this.prisma.vendorProfile.findUnique({ where: { id: dto.vendor_id } });
      if (!vendor) {
        throw new BadRequestException(`Vendor ${dto.vendor_id} does not exist`);
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
            dimensions: dto.dimensions as Prisma.InputJsonValue | undefined,
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
    } catch (err) {
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

  private mapWriteError(err: unknown, slug?: string, sku?: string): unknown {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const conflicting = [slug && `slug "${slug}"`, sku && `sku "${sku}"`].filter(Boolean).join(' or ');
      return new ConflictException(`Product with ${conflicting || 'the given unique field(s)'} already exists`);
    }
    return err;
  }

  // ---------------------------------------------------------------------------
  // Approve / reject / bulk actions
  // ---------------------------------------------------------------------------

  async approve(id: number, adminId: number) {
    const existing = await this.getProductOrThrow(id);

    if (existing.status !== ProductStatus.pending_review) {
      throw new BadRequestException(
        `Cannot approve a product in "${existing.status}" status — only "pending_review" listings can be approved.`,
      );
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.active,
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

  async reject(id: number, dto: RejectProductDto, adminId: number) {
    const existing = await this.getProductOrThrow(id);

    if (existing.status !== ProductStatus.pending_review) {
      throw new BadRequestException(
        `Cannot reject a product in "${existing.status}" status — only "pending_review" listings can be rejected.`,
      );
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.rejected,
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

  async bulkApprove(dto: BulkProductIdsDto, adminId: number) {
    const ids = Array.from(new Set(dto.ids));

    const approvedCount = await this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: ids } }, select: { id: true, status: true } });

      const foundIds = new Set(products.map((p) => p.id));
      const missing = ids.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        throw new NotFoundException(`Product id(s) not found: ${missing.join(', ')}`);
      }

      const notPending = products.filter((p) => p.status !== ProductStatus.pending_review);
      if (notPending.length > 0) {
        throw new BadRequestException(
          `Cannot bulk-approve — the following product id(s) are not in "pending_review" status: ${notPending
            .map((p) => `${p.id} (${p.status})`)
            .join(', ')}`,
        );
      }

      const result = await tx.product.updateMany({
        where: { id: { in: ids } },
        data: {
          status: ProductStatus.active,
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
      newData: { ids, status: ProductStatus.active },
    });

    return { approved: approvedCount, ids };
  }

  async bulkDeactivate(dto: BulkProductIdsDto, adminId: number) {
    const ids = Array.from(new Set(dto.ids));

    const deactivatedCount = await this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: ids } }, select: { id: true } });
      const foundIds = new Set(products.map((p) => p.id));
      const missing = ids.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        throw new NotFoundException(`Product id(s) not found: ${missing.join(', ')}`);
      }

      const result = await tx.product.updateMany({
        where: { id: { in: ids } },
        data: { status: ProductStatus.inactive },
      });
      return result.count;
    });

    await this.audit.log(adminId, 'product_bulk_deactivate', {
      targetTable: 'products',
      description: `Bulk-deactivated ${deactivatedCount} product(s): ids ${ids.join(', ')}`,
      newData: { ids, status: ProductStatus.inactive },
    });

    return { deactivated: deactivatedCount, ids };
  }

  // ---------------------------------------------------------------------------
  // Featured status
  // ---------------------------------------------------------------------------

  async feature(id: number, dto: FeatureProductDto, adminId: number) {
    const existing = await this.getProductOrThrow(id);

    const featuredUntil = new Date(dto.featured_until);
    if (Number.isNaN(featuredUntil.getTime())) {
      throw new BadRequestException(`featured_until "${dto.featured_until}" is not a valid date`);
    }
    if (featuredUntil.getTime() <= Date.now()) {
      throw new BadRequestException('featured_until must be a date in the future');
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

  async unfeature(id: number, adminId: number) {
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

  // ---------------------------------------------------------------------------
  // City-wise prices
  // ---------------------------------------------------------------------------

  async listCityPrices(productId: number) {
    await this.getProductOrThrow(productId);
    return this.prisma.productCityPrice.findMany({
      where: { product_id: productId },
      include: { city: true },
      orderBy: { city: { name: 'asc' } },
    });
  }

  async upsertCityPrice(productId: number, cityId: number, dto: UpsertCityPriceDto, adminId: number) {
    await this.getProductOrThrow(productId);

    const city = await this.prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      throw new BadRequestException(`City ${cityId} does not exist`);
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
}
