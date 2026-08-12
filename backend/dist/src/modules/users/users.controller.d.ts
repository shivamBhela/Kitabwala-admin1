import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { UsersService } from './users.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { WalletAdjustmentDto } from './dto/wallet-adjustment.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
            wallet_balance: import("@prisma/client/runtime/library").Decimal;
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
            total: import("@prisma/client/runtime/library").Decimal;
            order_number: string;
            status: import("@prisma/client").$Enums.OrderStatus;
        }[];
        wallet_transactions: {
            id: number;
            created_at: Date;
            type: import("@prisma/client").$Enums.WalletTransactionType;
            description: string | null;
            user_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            source: import("@prisma/client").$Enums.WalletTransactionSource;
            balance_after: import("@prisma/client/runtime/library").Decimal;
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
        wallet_balance: import("@prisma/client/runtime/library").Decimal;
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
            total_earnings: import("@prisma/client/runtime/library").Decimal;
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
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            is_default: boolean;
        }[];
    }>;
    ban(id: number, dto: BanUserDto, user: AuthenticatedUser): Promise<{
        id: number;
        is_banned: boolean;
        ban_reason: string | null;
        token_version: number;
    }>;
    unban(id: number, user: AuthenticatedUser): Promise<{
        id: number;
        is_banned: boolean;
        ban_reason: string | null;
    }>;
    adjustWallet(id: number, dto: WalletAdjustmentDto, user: AuthenticatedUser): Promise<{
        userId: number;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
        transaction: {
            id: number;
            created_at: Date;
            type: import("@prisma/client").$Enums.WalletTransactionType;
            description: string | null;
            user_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            source: import("@prisma/client").$Enums.WalletTransactionSource;
            balance_after: import("@prisma/client/runtime/library").Decimal;
            order_id: number | null;
            transaction_id: string | null;
        };
    }>;
}
