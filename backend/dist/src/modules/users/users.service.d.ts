import { AdminRole } from '@prisma/client';
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
    createAdmin(input: CreateAdminInput): Promise<any>;
    findAll(query: ListUsersQueryDto): Promise<{
        items: any;
        page: number;
        limit: number;
        total: any;
        totalPages: number;
    }>;
    findOne(id: number): Promise<any>;
    ban(id: number, dto: BanUserDto, adminId: number): Promise<{
        id: any;
        is_banned: any;
        ban_reason: any;
        token_version: any;
    }>;
    unban(id: number, adminId: number): Promise<{
        id: any;
        is_banned: any;
        ban_reason: any;
    }>;
    adjustWallet(id: number, dto: WalletAdjustmentDto, adminId: number): Promise<{
        userId: number;
        walletBalance: any;
        transaction: any;
    }>;
}
