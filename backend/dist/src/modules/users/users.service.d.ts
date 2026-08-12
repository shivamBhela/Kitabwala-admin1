import { AdminRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListUsersQueryDto } from './dto/list-users-query.dto';
import type { BanUserDto } from './dto/ban-user.dto';
import type { WalletAdjustmentDto } from './dto/wallet-adjustment.dto';
export interface CreateAdminInput {
    displayName: string;
    phone?: string;
    email?: string;
    password: string;
    adminRole: AdminRole;
}
export declare class UsersService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    createAdmin(input: CreateAdminInput): Promise<{
        user: {
            id: number;
            user_code: string;
            phone: string | null;
            email: string | null;
            google_id: string | null;
            referral_code: string | null;
            wp_id: number | null;
            phone_verified: boolean;
            email_verified: boolean;
            password_hash: string | null;
            auth_provider: import("@prisma/client").$Enums.AuthProvider;
            display_name: string;
            first_name: string | null;
            last_name: string | null;
            profile_picture: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            referred_by_id: number | null;
            detected_city_id: number | null;
            detected_pincode: string | null;
            wallet_balance: Prisma.Decimal;
            is_active: boolean;
            is_banned: boolean;
            ban_reason: string | null;
            is_migrated: boolean;
            migration_login_done: boolean;
            token_version: number;
            last_login_at: Date | null;
            created_at: Date;
            updated_at: Date;
        };
        adminProfile: {
            id: number;
            created_at: Date;
            updated_at: Date;
            user_id: number;
            admin_role: import("@prisma/client").$Enums.AdminRole;
        };
    }>;
    findAll(query: ListUsersQueryDto): Promise<{
        items: {
            id: number;
            user_code: string;
            phone: string | null;
            email: string | null;
            referral_code: string | null;
            phone_verified: boolean;
            email_verified: boolean;
            display_name: string;
            first_name: string | null;
            last_name: string | null;
            profile_picture: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            detected_city_id: number | null;
            wallet_balance: Prisma.Decimal;
            is_active: boolean;
            is_banned: boolean;
            ban_reason: string | null;
            is_migrated: boolean;
            migration_login_done: boolean;
            last_login_at: Date | null;
            created_at: Date;
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        orders: {
            id: number;
            created_at: Date;
            total: Prisma.Decimal;
            order_number: string;
            status: import("@prisma/client").$Enums.OrderStatus;
        }[];
        wallet_transactions: {
            id: number;
            created_at: Date;
            type: import("@prisma/client").$Enums.WalletTransactionType;
            description: string | null;
            user_id: number;
            amount: Prisma.Decimal;
            source: import("@prisma/client").$Enums.WalletTransactionSource;
            balance_after: Prisma.Decimal;
            order_id: number | null;
            transaction_id: string | null;
        }[];
        id: number;
        user_code: string;
        phone: string | null;
        email: string | null;
        referral_code: string | null;
        phone_verified: boolean;
        email_verified: boolean;
        display_name: string;
        first_name: string | null;
        last_name: string | null;
        profile_picture: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        detected_city_id: number | null;
        wallet_balance: Prisma.Decimal;
        is_active: boolean;
        is_banned: boolean;
        ban_reason: string | null;
        is_migrated: boolean;
        migration_login_done: boolean;
        last_login_at: Date | null;
        created_at: Date;
        reseller: {
            id: number;
            referral_code: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            user_id: number;
            total_referrals: number;
            total_earnings: Prisma.Decimal;
        } | null;
        saved_addresses: {
            id: number;
            phone: string | null;
            first_name: string | null;
            last_name: string | null;
            created_at: Date;
            updated_at: Date;
            city: string;
            pincode: string;
            user_id: number;
            label: string;
            address_1: string;
            address_2: string | null;
            state: string;
            country: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            is_default: boolean;
        }[];
    }>;
    ban(id: number, dto: BanUserDto, adminId: number): Promise<{
        id: number;
        is_banned: boolean;
        ban_reason: string | null;
        token_version: number;
    }>;
    unban(id: number, adminId: number): Promise<{
        id: number;
        is_banned: boolean;
        ban_reason: string | null;
    }>;
    adjustWallet(id: number, dto: WalletAdjustmentDto, adminId: number): Promise<{
        userId: number;
        walletBalance: Prisma.Decimal;
        transaction: {
            id: number;
            created_at: Date;
            type: import("@prisma/client").$Enums.WalletTransactionType;
            description: string | null;
            user_id: number;
            amount: Prisma.Decimal;
            source: import("@prisma/client").$Enums.WalletTransactionSource;
            balance_after: Prisma.Decimal;
            order_id: number | null;
            transaction_id: string | null;
        };
    }>;
}
