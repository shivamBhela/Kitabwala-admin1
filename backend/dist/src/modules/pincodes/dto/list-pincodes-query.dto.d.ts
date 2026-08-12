import { DeliveryZone } from '@prisma/client';
export declare class ListPincodesQueryDto {
    page?: number;
    pageSize?: number;
    city_id?: number;
    delivery_zone?: DeliveryZone;
    search?: string;
}
