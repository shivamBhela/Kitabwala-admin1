import { WalletTransactionType } from '@prisma/client';
export declare class WalletAdjustmentDto {
    type: WalletTransactionType;
    amount: number;
    description?: string;
}
