import { WithdrawalStatus } from '@prisma/client';
export declare class ListWithdrawalsQueryDto {
    status?: WithdrawalStatus;
    vendor_id?: number;
    page: number;
    limit: number;
}
