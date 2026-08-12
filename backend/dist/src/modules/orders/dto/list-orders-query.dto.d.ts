import { DeliveryType, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
export declare class ListOrdersQueryDto {
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    payment_method?: PaymentMethod;
    delivery_type?: DeliveryType;
    city_id?: number;
    vendor_id?: number;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page: number;
    limit: number;
}
