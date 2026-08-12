import { DeliveryType, ShipmentStatus } from '@prisma/client';
export declare class ListShipmentsQueryDto {
    status?: ShipmentStatus;
    delivery_type?: DeliveryType;
    delivery_person_id?: number;
    page: number;
    limit: number;
}
