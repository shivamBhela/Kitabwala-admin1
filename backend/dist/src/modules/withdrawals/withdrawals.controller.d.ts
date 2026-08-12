import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { WithdrawalsService } from './withdrawals.service';
import { ListWithdrawalsQueryDto } from './dto/list-withdrawals-query.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { CompleteWithdrawalDto } from './dto/complete-withdrawal.dto';
export declare class WithdrawalsController {
    private readonly withdrawalsService;
    constructor(withdrawalsService: WithdrawalsService);
    findAll(query: ListWithdrawalsQueryDto): Promise<{
        data: ({
            vendor: {
                id: number;
                store_name: string;
                bank_account_number: string | null;
                bank_ifsc: string | null;
                bank_account_name: string | null;
                upi_id: string | null;
                pending_balance: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            wp_id: number | null;
            created_at: Date;
            updated_at: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            status: import("@prisma/client").$Enums.WithdrawalStatus;
            vendor_id: number;
            requested_at: Date;
            processed_at: Date | null;
            admin_note: string | null;
            payment_reference: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        vendor: {
            id: number;
            store_name: string;
            bank_account_number: string | null;
            bank_ifsc: string | null;
            bank_account_name: string | null;
            upi_id: string | null;
            pending_balance: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        vendor_id: number;
        requested_at: Date;
        processed_at: Date | null;
        admin_note: string | null;
        payment_reference: string | null;
    }>;
    approve(id: number, user: AuthenticatedUser): Promise<{
        vendor: {
            id: number;
            store_name: string;
            bank_account_number: string | null;
            bank_ifsc: string | null;
            bank_account_name: string | null;
            upi_id: string | null;
            pending_balance: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        vendor_id: number;
        requested_at: Date;
        processed_at: Date | null;
        admin_note: string | null;
        payment_reference: string | null;
    }>;
    reject(id: number, dto: RejectWithdrawalDto, user: AuthenticatedUser): Promise<{
        vendor: {
            id: number;
            store_name: string;
            bank_account_number: string | null;
            bank_ifsc: string | null;
            bank_account_name: string | null;
            upi_id: string | null;
            pending_balance: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        vendor_id: number;
        requested_at: Date;
        processed_at: Date | null;
        admin_note: string | null;
        payment_reference: string | null;
    }>;
    complete(id: number, dto: CompleteWithdrawalDto, user: AuthenticatedUser): Promise<{
        vendor: {
            id: number;
            store_name: string;
            bank_account_number: string | null;
            bank_ifsc: string | null;
            bank_account_name: string | null;
            upi_id: string | null;
            pending_balance: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        vendor_id: number;
        requested_at: Date;
        processed_at: Date | null;
        admin_note: string | null;
        payment_reference: string | null;
    }>;
}
