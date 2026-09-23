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
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<any>;
    create(dto: CreateProductDto, user: AuthenticatedUser): Promise<any>;
    update(id: number, dto: UpdateProductDto, user: AuthenticatedUser): Promise<any>;
    remove(id: number, user: AuthenticatedUser): Promise<{
        success: boolean;
    }>;
    approve(id: number, user: AuthenticatedUser): Promise<any>;
    reject(id: number, dto: RejectProductDto, user: AuthenticatedUser): Promise<any>;
    bulkApprove(dto: BulkProductIdsDto, user: AuthenticatedUser): Promise<{
        approved: any;
        ids: number[];
    }>;
    bulkDeactivate(dto: BulkProductIdsDto, user: AuthenticatedUser): Promise<{
        deactivated: any;
        ids: number[];
    }>;
    feature(id: number, dto: FeatureProductDto, user: AuthenticatedUser): Promise<any>;
    unfeature(id: number, user: AuthenticatedUser): Promise<any>;
    listCityPrices(id: number): Promise<any>;
    upsertCityPrice(id: number, cityId: number, dto: UpsertCityPriceDto, user: AuthenticatedUser): Promise<any>;
}
