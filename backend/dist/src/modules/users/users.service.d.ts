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
            created_at: Date;
            id: number;
            wp_id: number | null;
            user_code: string;
            phone: string | null;
            phone_verified: boolean;
            email: string | null;
            email_verified: boolean;
            password_hash: string | null;
            auth_provider: import("@prisma/client").$Enums.AuthProvider;
            google_id: string | null;
            display_name: string;
            first_name: string | null;
            last_name: string | null;
            profile_picture: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            referral_code: string | null;
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
            updated_at: Date;
        };
        adminProfile: {
            created_at: Date;
            id: number;
            user_id: number;
            updated_at: Date;
            admin_role: import("@prisma/client").$Enums.AdminRole;
        };
    }>;
    findAll(query: ListUsersQueryDto): Promise<{
        items: {
            created_at: Date;
            id: number;
            user_code: string;
            phone: string | null;
            phone_verified: boolean;
            email: string | null;
            email_verified: boolean;
            display_name: string;
            first_name: string | null;
            last_name: string | null;
            profile_picture: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            referral_code: string | null;
            detected_city_id: number | null;
            wallet_balance: Prisma.Decimal;
            is_active: boolean;
            is_banned: boolean;
            ban_reason: string | null;
            is_migrated: boolean;
            migration_login_done: boolean;
            last_login_at: Date | null;
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        orders: {
            created_at: Date;
            id: number;
            total: Prisma.Decimal;
            order_number: string;
            status: import("@prisma/client").$Enums.OrderStatus;
        }[];
        wallet_transactions: {
            type: import("@prisma/client").$Enums.WalletTransactionType;
            description: string | null;
            created_at: Date;
            id: number;
            user_id: number;
            amount: Prisma.Decimal;
            source: import("@prisma/client").$Enums.WalletTransactionSource;
            balance_after: Prisma.Decimal;
            order_id: number | null;
            transaction_id: string | null;
        }[];
        reseller: {
            created_at: Date;
            id: number;
            user_id: number;
            referral_code: string;
            is_active: boolean;
            updated_at: Date;
            total_referrals: number;
            total_earnings: Prisma.Decimal;
        } | null;
        created_at: Date;
        id: number;
        user_code: string;
        phone: string | null;
        phone_verified: boolean;
        email: string | null;
        email_verified: boolean;
        display_name: string;
        first_name: string | null;
        last_name: string | null;
        profile_picture: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        referral_code: string | null;
        detected_city_id: number | null;
        wallet_balance: Prisma.Decimal;
        is_active: boolean;
        is_banned: boolean;
        ban_reason: string | null;
        is_migrated: boolean;
        migration_login_done: boolean;
        last_login_at: Date | null;
        saved_addresses: {
            city: string;
            pincode: string;
            created_at: Date;
            id: number;
            user_id: number;
            phone: string | null;
            first_name: string | null;
            last_name: string | null;
            updated_at: Date;
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
            type: import("@prisma/client").$Enums.WalletTransactionType;
            description: string | null;
            created_at: Date;
            id: number;
            user_id: number;
            amount: Prisma.Decimal;
            source: import("@prisma/client").$Enums.WalletTransactionSource;
            balance_after: Prisma.Decimal;
            order_id: number | null;
            transaction_id: string | null;
        };
    }>;
}
