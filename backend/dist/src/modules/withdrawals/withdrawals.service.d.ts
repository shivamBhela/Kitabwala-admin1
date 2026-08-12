import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListWithdrawalsQueryDto } from './dto/list-withdrawals-query.dto';
import type { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import type { CompleteWithdrawalDto } from './dto/complete-withdrawal.dto';
export declare class WithdrawalsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(query: ListWithdrawalsQueryDto): Promise<{
        data: ({
            vendor: {
                id: number;
                store_name: string;
                bank_account_number: string | null;
                bank_ifsc: string | null;
                bank_account_name: string | null;
                upi_id: string | null;
                pending_balance: Prisma.Decimal;
            };
        } & {
            id: number;
            wp_id: number | null;
            created_at: Date;
            updated_at: Date;
            amount: Prisma.Decimal;
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
            pending_balance: Prisma.Decimal;
        };
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        amount: Prisma.Decimal;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        vendor_id: number;
        requested_at: Date;
        processed_at: Date | null;
        admin_note: string | null;
        payment_reference: string | null;
    }>;
    private getWithdrawalOrThrow;
    approve(id: number, adminId: number): Promise<{
        vendor: {
            id: number;
            store_name: string;
            bank_account_number: string | null;
            bank_ifsc: string | null;
            bank_account_name: string | null;
            upi_id: string | null;
            pending_balance: Prisma.Decimal;
        };
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        amount: Prisma.Decimal;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        vendor_id: number;
        requested_at: Date;
        processed_at: Date | null;
        admin_note: string | null;
        payment_reference: string | null;
    }>;
    reject(id: number, dto: RejectWithdrawalDto, adminId: number): Promise<{
        vendor: {
            id: number;
            store_name: string;
            bank_account_number: string | null;
            bank_ifsc: string | null;
            bank_account_name: string | null;
            upi_id: string | null;
            pending_balance: Prisma.Decimal;
        };
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        amount: Prisma.Decimal;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        vendor_id: number;
        requested_at: Date;
        processed_at: Date | null;
        admin_note: string | null;
        payment_reference: string | null;
    }>;
    complete(id: number, dto: CompleteWithdrawalDto, adminId: number): Promise<{
        vendor: {
            id: number;
            store_name: string;
            bank_account_number: string | null;
            bank_ifsc: string | null;
            bank_account_name: string | null;
            upi_id: string | null;
            pending_balance: Prisma.Decimal;
        };
    } & {
        id: number;
        wp_id: number | null;
        created_at: Date;
        updated_at: Date;
        amount: Prisma.Decimal;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        vendor_id: number;
        requested_at: Date;
        processed_at: Date | null;
        admin_note: string | null;
        payment_reference: string | null;
    }>;
}
