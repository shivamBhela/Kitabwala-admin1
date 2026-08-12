import { CodType, DeliveryZone } from '@prisma/client';
export declare class CreatePincodeDto {
    pincode: string;
    city_id: number;
    delivery_zone: DeliveryZone;
    cod_type?: CodType;
    partial_cod_amount?: number;
    is_same_day_eligible?: boolean;
    is_delivery_available?: boolean;
}
