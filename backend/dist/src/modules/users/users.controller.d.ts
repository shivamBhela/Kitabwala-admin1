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
            wallet_balance: import("@prisma/client/runtime/library").Decimal;
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
            total: import("@prisma/client/runtime/library").Decimal;
            order_number: string;
            status: import("@prisma/client").$Enums.OrderStatus;
        }[];
        wallet_transactions: {
            type: import("@prisma/client").$Enums.WalletTransactionType;
            description: string | null;
            created_at: Date;
            id: number;
            user_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            source: import("@prisma/client").$Enums.WalletTransactionSource;
            balance_after: import("@prisma/client/runtime/library").Decimal;
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
            total_earnings: import("@prisma/client/runtime/library").Decimal;
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
        wallet_balance: import("@prisma/client/runtime/library").Decimal;
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
            type: import("@prisma/client").$Enums.WalletTransactionType;
            description: string | null;
            created_at: Date;
            id: number;
            user_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            source: import("@prisma/client").$Enums.WalletTransactionSource;
            balance_after: import("@prisma/client/runtime/library").Decimal;
            order_id: number | null;
            transaction_id: string | null;
        };
    }>;
}
