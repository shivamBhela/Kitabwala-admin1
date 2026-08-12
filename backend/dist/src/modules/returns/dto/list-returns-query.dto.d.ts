import { ReturnReason, ReturnRequestStatus } from '@prisma/client';
export declare class ListReturnsQueryDto {
    status?: ReturnRequestStatus;
    reason?: ReturnReason;
    dateFrom?: string;
    dateTo?: string;
    vendor_id?: number;
    page: number;
    limit: number;
}
