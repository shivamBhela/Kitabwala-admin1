import { RefundMethod } from '@prisma/client';
export declare class RefundOrderDto {
    amount: number;
    method: RefundMethod;
    reason?: string;
}
