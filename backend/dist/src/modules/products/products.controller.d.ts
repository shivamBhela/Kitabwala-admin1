import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { ProductsService } from './products.service';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RejectProductDto } from './dto/reject-product.dto';
import { BulkProductIdsDto } from './dto/bulk-product-ids.dto';
import { FeatureProductDto } from './dto/feature-product.dto';
import { UpsertCityPriceDto } from './dto/upsert-city-price.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: ListProductsQueryDto): Promise<{
        data: ({
            vendor: {
                id: number;
                store_name: string;
            };
            images: {
                id: number;
                wp_id: number | null;
                created_at: Date;
                updated_at: Date;
                display_order: number;
                is_primary: boolean;
                product_id: number;
                image_versions: import("@prisma/client/runtime/library").JsonValue;
            }[];
        } & {
            id: number;
            wp_id: number | null;
            created_at: Date;
            updated_at: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.ProductStatus;
            vendor_id: number;
            slug: string;
            title: string;
            short_description: string | null;
            regular_price: import("@prisma/client/runtime/library").Decimal;
            sale_price: import("@prisma/client/runtime/library").Decimal | null;
            base_price: import("@prisma/client/runtime/library").Decimal | null;
            gst_rate: import("@prisma/client/runtime/library").Decimal;
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
            weight: import("@prisma/client/runtime/library").Decimal | null;
            dimensions: import("@prisma/client/runtime/library").JsonValue | null;
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
            commission_rate: import("@prisma/client/runtime/library").Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                id: number;
                wp_id: number | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                description: string | null;
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
            id: number;
            wp_id: number | null;
            created_at: Date;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: import("@prisma/client/runtime/library").JsonValue;
        }[];
        attributes: {
            id: number;
            created_at: Date;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                id: number;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                slug: string;
            };
        } & {
            id: number;
            created_at: Date;
            updated_at: Date;
            city_id: number;
            price: import("@prisma/client/runtime/library").Decimal;
            product_id: number;
        })[];
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: import("@prisma/client/runtime/library").Decimal;
        sale_price: import("@prisma/client/runtime/library").Decimal | null;
        base_price: import("@prisma/client/runtime/library").Decimal | null;
        gst_rate: import("@prisma/client/runtime/library").Decimal;
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
        weight: import("@prisma/client/runtime/library").Decimal | null;
        dimensions: import("@prisma/client/runtime/library").JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    create(dto: CreateProductDto, user: AuthenticatedUser): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: import("@prisma/client/runtime/library").Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                id: number;
                wp_id: number | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                description: string | null;
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
            id: number;
            wp_id: number | null;
            created_at: Date;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: import("@prisma/client/runtime/library").JsonValue;
        }[];
        attributes: {
            id: number;
            created_at: Date;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                id: number;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                slug: string;
            };
        } & {
            id: number;
            created_at: Date;
            updated_at: Date;
            city_id: number;
            price: import("@prisma/client/runtime/library").Decimal;
            product_id: number;
        })[];
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: import("@prisma/client/runtime/library").Decimal;
        sale_price: import("@prisma/client/runtime/library").Decimal | null;
        base_price: import("@prisma/client/runtime/library").Decimal | null;
        gst_rate: import("@prisma/client/runtime/library").Decimal;
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
        weight: import("@prisma/client/runtime/library").Decimal | null;
        dimensions: import("@prisma/client/runtime/library").JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    update(id: number, dto: UpdateProductDto, user: AuthenticatedUser): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: import("@prisma/client/runtime/library").Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                id: number;
                wp_id: number | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                description: string | null;
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
            id: number;
            wp_id: number | null;
            created_at: Date;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: import("@prisma/client/runtime/library").JsonValue;
        }[];
        attributes: {
            id: number;
            created_at: Date;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                id: number;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                slug: string;
            };
        } & {
            id: number;
            created_at: Date;
            updated_at: Date;
            city_id: number;
            price: import("@prisma/client/runtime/library").Decimal;
            product_id: number;
        })[];
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: import("@prisma/client/runtime/library").Decimal;
        sale_price: import("@prisma/client/runtime/library").Decimal | null;
        base_price: import("@prisma/client/runtime/library").Decimal | null;
        gst_rate: import("@prisma/client/runtime/library").Decimal;
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
        weight: import("@prisma/client/runtime/library").Decimal | null;
        dimensions: import("@prisma/client/runtime/library").JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        success: boolean;
    }>;
    approve(id: number, user: AuthenticatedUser): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: import("@prisma/client/runtime/library").Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                id: number;
                wp_id: number | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                description: string | null;
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
            id: number;
            wp_id: number | null;
            created_at: Date;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: import("@prisma/client/runtime/library").JsonValue;
        }[];
        attributes: {
            id: number;
            created_at: Date;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                id: number;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                slug: string;
            };
        } & {
            id: number;
            created_at: Date;
            updated_at: Date;
            city_id: number;
            price: import("@prisma/client/runtime/library").Decimal;
            product_id: number;
        })[];
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: import("@prisma/client/runtime/library").Decimal;
        sale_price: import("@prisma/client/runtime/library").Decimal | null;
        base_price: import("@prisma/client/runtime/library").Decimal | null;
        gst_rate: import("@prisma/client/runtime/library").Decimal;
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
        weight: import("@prisma/client/runtime/library").Decimal | null;
        dimensions: import("@prisma/client/runtime/library").JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    reject(id: number, dto: RejectProductDto, user: AuthenticatedUser): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: import("@prisma/client/runtime/library").Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                id: number;
                wp_id: number | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                description: string | null;
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
            id: number;
            wp_id: number | null;
            created_at: Date;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: import("@prisma/client/runtime/library").JsonValue;
        }[];
        attributes: {
            id: number;
            created_at: Date;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                id: number;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                slug: string;
            };
        } & {
            id: number;
            created_at: Date;
            updated_at: Date;
            city_id: number;
            price: import("@prisma/client/runtime/library").Decimal;
            product_id: number;
        })[];
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: import("@prisma/client/runtime/library").Decimal;
        sale_price: import("@prisma/client/runtime/library").Decimal | null;
        base_price: import("@prisma/client/runtime/library").Decimal | null;
        gst_rate: import("@prisma/client/runtime/library").Decimal;
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
        weight: import("@prisma/client/runtime/library").Decimal | null;
        dimensions: import("@prisma/client/runtime/library").JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    bulkApprove(dto: BulkProductIdsDto, user: AuthenticatedUser): Promise<{
        approved: number;
        ids: number[];
    }>;
    bulkDeactivate(dto: BulkProductIdsDto, user: AuthenticatedUser): Promise<{
        deactivated: number;
        ids: number[];
    }>;
    feature(id: number, dto: FeatureProductDto, user: AuthenticatedUser): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: import("@prisma/client/runtime/library").Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                id: number;
                wp_id: number | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                description: string | null;
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
            id: number;
            wp_id: number | null;
            created_at: Date;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: import("@prisma/client/runtime/library").JsonValue;
        }[];
        attributes: {
            id: number;
            created_at: Date;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                id: number;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                slug: string;
            };
        } & {
            id: number;
            created_at: Date;
            updated_at: Date;
            city_id: number;
            price: import("@prisma/client/runtime/library").Decimal;
            product_id: number;
        })[];
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: import("@prisma/client/runtime/library").Decimal;
        sale_price: import("@prisma/client/runtime/library").Decimal | null;
        base_price: import("@prisma/client/runtime/library").Decimal | null;
        gst_rate: import("@prisma/client/runtime/library").Decimal;
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
        weight: import("@prisma/client/runtime/library").Decimal | null;
        dimensions: import("@prisma/client/runtime/library").JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    unfeature(id: number, user: AuthenticatedUser): Promise<{
        vendor: {
            id: number;
            is_active: boolean;
            commission_rate: import("@prisma/client/runtime/library").Decimal;
            is_verified: boolean;
            store_name: string;
            store_slug: string;
        };
        product_categories: ({
            category: {
                id: number;
                wp_id: number | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                description: string | null;
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
            id: number;
            wp_id: number | null;
            created_at: Date;
            updated_at: Date;
            display_order: number;
            is_primary: boolean;
            product_id: number;
            image_versions: import("@prisma/client/runtime/library").JsonValue;
        }[];
        attributes: {
            id: number;
            created_at: Date;
            updated_at: Date;
            product_id: number;
            attribute_name: string;
            attribute_value: string;
        }[];
        city_prices: ({
            city: {
                id: number;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                name: string;
                slug: string;
            };
        } & {
            id: number;
            created_at: Date;
            updated_at: Date;
            city_id: number;
            price: import("@prisma/client/runtime/library").Decimal;
            product_id: number;
        })[];
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: import("@prisma/client").$Enums.ProductStatus;
        vendor_id: number;
        slug: string;
        title: string;
        short_description: string | null;
        regular_price: import("@prisma/client/runtime/library").Decimal;
        sale_price: import("@prisma/client/runtime/library").Decimal | null;
        base_price: import("@prisma/client/runtime/library").Decimal | null;
        gst_rate: import("@prisma/client/runtime/library").Decimal;
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
        weight: import("@prisma/client/runtime/library").Decimal | null;
        dimensions: import("@prisma/client/runtime/library").JsonValue | null;
        meta_title: string | null;
        meta_description: string | null;
        rejection_reason: string | null;
        featured_until: Date | null;
        sold_count: number;
        approved_by_id: number | null;
        approved_at: Date | null;
    }>;
    listCityPrices(id: number): Promise<({
        city: {
            id: number;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            name: string;
            slug: string;
        };
    } & {
        id: number;
        created_at: Date;
        updated_at: Date;
        city_id: number;
        price: import("@prisma/client/runtime/library").Decimal;
        product_id: number;
    })[]>;
    upsertCityPrice(id: number, cityId: number, dto: UpsertCityPriceDto, user: AuthenticatedUser): Promise<{
        city: {
            id: number;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            name: string;
            slug: string;
        };
    } & {
        id: number;
        created_at: Date;
        updated_at: Date;
        city_id: number;
        price: import("@prisma/client/runtime/library").Decimal;
        product_id: number;
    }>;
}
