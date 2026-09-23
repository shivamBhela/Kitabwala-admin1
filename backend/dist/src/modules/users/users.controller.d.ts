import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { UsersService } from './users.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { WalletAdjustmentDto } from './dto/wallet-adjustment.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: ListUsersQueryDto): Promise<{
        items: any;
        page: number;
        limit: number;
        total: any;
        totalPages: number;
    }>;
    findOne(id: number): Promise<any>;
    ban(id: number, dto: BanUserDto, user: AuthenticatedUser): Promise<{
        id: any;
        is_banned: any;
        ban_reason: any;
        token_version: any;
    }>;
    unban(id: number, user: AuthenticatedUser): Promise<{
        id: any;
        is_banned: any;
        ban_reason: any;
    }>;
    adjustWallet(id: number, dto: WalletAdjustmentDto, user: AuthenticatedUser): Promise<{
        userId: number;
        walletBalance: any;
        transaction: any;
    }>;
}
