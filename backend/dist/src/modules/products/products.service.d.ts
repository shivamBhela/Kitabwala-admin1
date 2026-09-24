import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListProductsQueryDto } from './dto/list-products-query.dto';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import type { RejectProductDto } from './dto/reject-product.dto';
import type { BulkProductIdsDto } from './dto/bulk-product-ids.dto';
import type { FeatureProductDto } from './dto/feature-product.dto';
import type { UpsertCityPriceDto } from './dto/upsert-city-price.dto';
export declare class ProductsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(query: ListProductsQueryDto): Promise<{
        data: ({
            vendor: {
                id: number;
                store_name: string;
            };
            images: {
                created_at: Date;
                id: number;
                wp_id: number | null;
                updated_at: Date;
                display_order: number;
                is_primary: boolean;
                product_id: number;
                image_versions: Prisma.JsonValue;
            }[];
        } & {
            description: string | null;
            created_at: Date;
            id: number;
            wp_id: number | null;
            updated_at: Date;
            status: import("@prisma/client").$Enums.ProductStatus;
            vendor_id: number;
            slug: string;
            title: string;
            short_description: string | null;
            regular_price: Prisma.Decimal;
            sale_price: Prisma.Decimal | null;
            base_price: Prisma.Decimal | null;
            gst_rate: Prisma.Decimal;
            hsn_code: string | null;
            sku: string | null;
            isbn: string | null;
            author: string | null;
            publisher: string | null;
            edition: string | null;
            language: string | null;
            pages: number | null;
            binding: string | null;
            genre: string | null;
            book_format: import("@prisma/client").$Enums.BookFormat;
            condition: import("@prisma/client").$Enums.BookCondition;
            condition_description: string | null;
            stock_quantity: number;
            manage_stock: boolean;
            in_stock: boolean;
            weight: Prisma.Decimal | null;
            dimensions: Prisma.JsonValue | null;
            meta_title: string | null;
            meta_description: string | null;
            rejection_reason: string | null;
            featured_until: Date | null;
            sold_count: number;
            approved_by_id: number | null;
            approved_at: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: Prisma.Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                description: string | null;
                created_at: Date;
                id: number;
                name: string;
                wp_id: number | null;
                is_active: boolean;
                updated_at: Date;
                slug: string;
                parent_id: number | null;
                image_url: string | null;
                display_order: number;
            };
        } & {
            category_id: number;
            product_id: number;
        })[];
        images: {
            created_at: Date;
            id: number;
            wp_id: number | null;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: Prisma.JsonValue;
        }[];
        attributes: {
            created_at: Date;
            id: number;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                created_at: Date;
                id: number;
                name: string;
                is_active: boolean;
                updated_at: Date;
                slug: string;
            };
        } & {
            created_at: Date;
            id: number;
            updated_at: Date;
            city_id: number;
            price: Prisma.Decimal;
            product_id: number;
        })[];
    } & {
        description: string | null;
        created_at: Date;
        id: number;
        wp_id: number | null;
        updated_at: Date;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: Prisma.Decimal;
        sale_price: Prisma.Decimal | null;
        base_price: Prisma.Decimal | null;
        gst_rate: Prisma.Decimal;
        hsn_code: string | null;
        sku: string | null;
        isbn: string | null;
        author: string | null;
        publisher: string | null;
        edition: string | null;
        language: string | null;
        pages: number | null;
        binding: string | null;
        genre: string | null;
        book_format: import("@prisma/client").$Enums.BookFormat;
        condition: import("@prisma/client").$Enums.BookCondition;
        condition_description: string | null;
        stock_quantity: number;
        manage_stock: boolean;
        in_stock: boolean;
        weight: Prisma.Decimal | null;
        dimensions: Prisma.JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    private getProductOrThrow;
    private priceBoundCondition;
    private assertCategoriesExist;
    create(dto: CreateProductDto, adminId: number): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: Prisma.Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                description: string | null;
                created_at: Date;
                id: number;
                name: string;
                wp_id: number | null;
                is_active: boolean;
                updated_at: Date;
                slug: string;
                parent_id: number | null;
                image_url: string | null;
                display_order: number;
            };
        } & {
            category_id: number;
            product_id: number;
        })[];
        images: {
            created_at: Date;
            id: number;
            wp_id: number | null;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: Prisma.JsonValue;
        }[];
        attributes: {
            created_at: Date;
            id: number;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                created_at: Date;
                id: number;
                name: string;
                is_active: boolean;
                updated_at: Date;
                slug: string;
            };
        } & {
            created_at: Date;
            id: number;
            updated_at: Date;
            city_id: number;
            price: Prisma.Decimal;
            product_id: number;
        })[];
    } & {
        description: string | null;
        created_at: Date;
        id: number;
        wp_id: number | null;
        updated_at: Date;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: Prisma.Decimal;
        sale_price: Prisma.Decimal | null;
        base_price: Prisma.Decimal | null;
        gst_rate: Prisma.Decimal;
        hsn_code: string | null;
        sku: string | null;
        isbn: string | null;
        author: string | null;
        publisher: string | null;
        edition: string | null;
        language: string | null;
        pages: number | null;
        binding: string | null;
        genre: string | null;
        book_format: import("@prisma/client").$Enums.BookFormat;
        condition: import("@prisma/client").$Enums.BookCondition;
        condition_description: string | null;
        stock_quantity: number;
        manage_stock: boolean;
        in_stock: boolean;
        weight: Prisma.Decimal | null;
        dimensions: Prisma.JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    update(id: number, dto: UpdateProductDto, adminId: number): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: Prisma.Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                description: string | null;
                created_at: Date;
                id: number;
                name: string;
                wp_id: number | null;
                is_active: boolean;
                updated_at: Date;
                slug: string;
                parent_id: number | null;
                image_url: string | null;
                display_order: number;
            };
        } & {
            category_id: number;
            product_id: number;
        })[];
        images: {
            created_at: Date;
            id: number;
            wp_id: number | null;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: Prisma.JsonValue;
        }[];
        attributes: {
            created_at: Date;
            id: number;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                created_at: Date;
                id: number;
                name: string;
                is_active: boolean;
                updated_at: Date;
                slug: string;
            };
        } & {
            created_at: Date;
            id: number;
            updated_at: Date;
            city_id: number;
            price: Prisma.Decimal;
            product_id: number;
        })[];
    } & {
        description: string | null;
        created_at: Date;
        id: number;
        wp_id: number | null;
        updated_at: Date;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: Prisma.Decimal;
        sale_price: Prisma.Decimal | null;
        base_price: Prisma.Decimal | null;
        gst_rate: Prisma.Decimal;
        hsn_code: string | null;
        sku: string | null;
        isbn: string | null;
        author: string | null;
        publisher: string | null;
        edition: string | null;
        language: string | null;
        pages: number | null;
        binding: string | null;
        genre: string | null;
        book_format: import("@prisma/client").$Enums.BookFormat;
        condition: import("@prisma/client").$Enums.BookCondition;
        condition_description: string | null;
        stock_quantity: number;
        manage_stock: boolean;
        in_stock: boolean;
        weight: Prisma.Decimal | null;
        dimensions: Prisma.JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    remove(id: number, adminId: number): Promise<{
        success: boolean;
    }>;
    private mapWriteError;
    approve(id: number, adminId: number): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: Prisma.Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                description: string | null;
                created_at: Date;
                id: number;
                name: string;
                wp_id: number | null;
                is_active: boolean;
                updated_at: Date;
                slug: string;
                parent_id: number | null;
                image_url: string | null;
                display_order: number;
            };
        } & {
            category_id: number;
            product_id: number;
        })[];
        images: {
            created_at: Date;
            id: number;
            wp_id: number | null;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: Prisma.JsonValue;
        }[];
        attributes: {
            created_at: Date;
            id: number;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                created_at: Date;
                id: number;
                name: string;
                is_active: boolean;
                updated_at: Date;
                slug: string;
            };
        } & {
            created_at: Date;
            id: number;
            updated_at: Date;
            city_id: number;
            price: Prisma.Decimal;
            product_id: number;
        })[];
    } & {
        description: string | null;
        created_at: Date;
        id: number;
        wp_id: number | null;
        updated_at: Date;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: Prisma.Decimal;
        sale_price: Prisma.Decimal | null;
        base_price: Prisma.Decimal | null;
        gst_rate: Prisma.Decimal;
        hsn_code: string | null;
        sku: string | null;
        isbn: string | null;
        author: string | null;
        publisher: string | null;
        edition: string | null;
        language: string | null;
        pages: number | null;
        binding: string | null;
        genre: string | null;
        book_format: import("@prisma/client").$Enums.BookFormat;
        condition: import("@prisma/client").$Enums.BookCondition;
        condition_description: string | null;
        stock_quantity: number;
        manage_stock: boolean;
        in_stock: boolean;
        weight: Prisma.Decimal | null;
        dimensions: Prisma.JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    reject(id: number, dto: RejectProductDto, adminId: number): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: Prisma.Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                description: string | null;
                created_at: Date;
                id: number;
                name: string;
                wp_id: number | null;
                is_active: boolean;
                updated_at: Date;
                slug: string;
                parent_id: number | null;
                image_url: string | null;
                display_order: number;
            };
        } & {
            category_id: number;
            product_id: number;
        })[];
        images: {
            created_at: Date;
            id: number;
            wp_id: number | null;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: Prisma.JsonValue;
        }[];
        attributes: {
            created_at: Date;
            id: number;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                created_at: Date;
                id: number;
                name: string;
                is_active: boolean;
                updated_at: Date;
                slug: string;
            };
        } & {
            created_at: Date;
            id: number;
            updated_at: Date;
            city_id: number;
            price: Prisma.Decimal;
            product_id: number;
        })[];
    } & {
        description: string | null;
        created_at: Date;
        id: number;
        wp_id: number | null;
        updated_at: Date;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: Prisma.Decimal;
        sale_price: Prisma.Decimal | null;
        base_price: Prisma.Decimal | null;
        gst_rate: Prisma.Decimal;
        hsn_code: string | null;
        sku: string | null;
        isbn: string | null;
        author: string | null;
        publisher: string | null;
        edition: string | null;
        language: string | null;
        pages: number | null;
        binding: string | null;
        genre: string | null;
        book_format: import("@prisma/client").$Enums.BookFormat;
        condition: import("@prisma/client").$Enums.BookCondition;
        condition_description: string | null;
        stock_quantity: number;
        manage_stock: boolean;
        in_stock: boolean;
        weight: Prisma.Decimal | null;
        dimensions: Prisma.JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    bulkApprove(dto: BulkProductIdsDto, adminId: number): Promise<{
        approved: number;
        ids: number[];
    }>;
    bulkDeactivate(dto: BulkProductIdsDto, adminId: number): Promise<{
        deactivated: number;
        ids: number[];
    }>;
    feature(id: number, dto: FeatureProductDto, adminId: number): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: Prisma.Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                description: string | null;
                created_at: Date;
                id: number;
                name: string;
                wp_id: number | null;
                is_active: boolean;
                updated_at: Date;
                slug: string;
                parent_id: number | null;
                image_url: string | null;
                display_order: number;
            };
        } & {
            category_id: number;
            product_id: number;
        })[];
        images: {
            created_at: Date;
            id: number;
            wp_id: number | null;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: Prisma.JsonValue;
        }[];
        attributes: {
            created_at: Date;
            id: number;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                created_at: Date;
                id: number;
                name: string;
                is_active: boolean;
                updated_at: Date;
                slug: string;
            };
        } & {
            created_at: Date;
            id: number;
            updated_at: Date;
            city_id: number;
            price: Prisma.Decimal;
            product_id: number;
        })[];
    } & {
        description: string | null;
        created_at: Date;
        id: number;
        wp_id: number | null;
        updated_at: Date;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: Prisma.Decimal;
        sale_price: Prisma.Decimal | null;
        base_price: Prisma.Decimal | null;
        gst_rate: Prisma.Decimal;
        hsn_code: string | null;
        sku: string | null;
        isbn: string | null;
        author: string | null;
        publisher: string | null;
        edition: string | null;
        language: string | null;
        pages: number | null;
        binding: string | null;
        genre: string | null;
        book_format: import("@prisma/client").$Enums.BookFormat;
        condition: import("@prisma/client").$Enums.BookCondition;
        condition_description: string | null;
        stock_quantity: number;
        manage_stock: boolean;
        in_stock: boolean;
        weight: Prisma.Decimal | null;
        dimensions: Prisma.JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    unfeature(id: number, adminId: number): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: Prisma.Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                description: string | null;
                created_at: Date;
                id: number;
                name: string;
                wp_id: number | null;
                is_active: boolean;
                updated_at: Date;
                slug: string;
                parent_id: number | null;
                image_url: string | null;
                display_order: number;
            };
        } & {
            category_id: number;
            product_id: number;
        })[];
        images: {
            created_at: Date;
            id: number;
            wp_id: number | null;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: Prisma.JsonValue;
        }[];
        attributes: {
            created_at: Date;
            id: number;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                created_at: Date;
                id: number;
                name: string;
                is_active: boolean;
                updated_at: Date;
                slug: string;
            };
        } & {
            created_at: Date;
            id: number;
            updated_at: Date;
            city_id: number;
            price: Prisma.Decimal;
            product_id: number;
        })[];
    } & {
        description: string | null;
        created_at: Date;
        id: number;
        wp_id: number | null;
        updated_at: Date;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: Prisma.Decimal;
        sale_price: Prisma.Decimal | null;
        base_price: Prisma.Decimal | null;
        gst_rate: Prisma.Decimal;
        hsn_code: string | null;
        sku: string | null;
        isbn: string | null;
        author: string | null;
        publisher: string | null;
        edition: string | null;
        language: string | null;
        pages: number | null;
        binding: string | null;
        genre: string | null;
        book_format: import("@prisma/client").$Enums.BookFormat;
        condition: import("@prisma/client").$Enums.BookCondition;
        condition_description: string | null;
        stock_quantity: number;
        manage_stock: boolean;
        in_stock: boolean;
        weight: Prisma.Decimal | null;
        dimensions: Prisma.JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    listCityPrices(productId: number): Promise<({
        city: {
            created_at: Date;
            id: number;
            name: string;
            is_active: boolean;
            updated_at: Date;
            slug: string;
        };
    } & {
        created_at: Date;
        id: number;
        updated_at: Date;
        city_id: number;
        price: Prisma.Decimal;
        product_id: number;
    })[]>;
    upsertCityPrice(productId: number, cityId: number, dto: UpsertCityPriceDto, adminId: number): Promise<{
        city: {
            created_at: Date;
            id: number;
            name: string;
            is_active: boolean;
            updated_at: Date;
            slug: string;
        };
    } & {
        created_at: Date;
        id: number;
        updated_at: Date;
        city_id: number;
        price: Prisma.Decimal;
        product_id: number;
    }>;
}
