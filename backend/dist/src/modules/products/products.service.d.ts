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
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<any>;
    private getProductOrThrow;
    private priceBoundCondition;
    private assertCategoriesExist;
    create(dto: CreateProductDto, adminId: number): Promise<any>;
    update(id: number, dto: UpdateProductDto, adminId: number): Promise<any>;
    remove(id: number, adminId: number): Promise<{
        success: boolean;
    }>;
    private mapWriteError;
    approve(id: number, adminId: number): Promise<any>;
    reject(id: number, dto: RejectProductDto, adminId: number): Promise<any>;
    bulkApprove(dto: BulkProductIdsDto, adminId: number): Promise<{
        approved: any;
        ids: number[];
    }>;
    bulkDeactivate(dto: BulkProductIdsDto, adminId: number): Promise<{
        deactivated: any;
        ids: number[];
    }>;
    feature(id: number, dto: FeatureProductDto, adminId: number): Promise<any>;
    unfeature(id: number, adminId: number): Promise<any>;
    listCityPrices(productId: number): Promise<any>;
    upsertCityPrice(productId: number, cityId: number, dto: UpsertCityPriceDto, adminId: number): Promise<any>;
}
