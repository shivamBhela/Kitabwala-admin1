import { ProductStatus } from '@prisma/client';
export declare class ListProductsQueryDto {
    status?: ProductStatus;
    vendor_id?: number;
    category_id?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page: number;
    limit: number;
}
