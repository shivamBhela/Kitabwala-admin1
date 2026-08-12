import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { generateUserCode } from './user-code.service';
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

/** Fields safe to return to the admin portal — excludes password_hash, google_id, etc. */
const USER_LIST_SELECT = {
  id: true,
  user_code: true,
  phone: true,
  phone_verified: true,
  email: true,
  email_verified: true,
  display_name: true,
  first_name: true,
  last_name: true,
  profile_picture: true,
  role: true,
  referral_code: true,
  detected_city_id: true,
  wallet_balance: true,
  is_active: true,
  is_banned: true,
  ban_reason: true,
  is_migrated: true,
  migration_login_done: true,
  last_login_at: true,
  created_at: true,
} satisfies Prisma.UserSelect;

const RECENT_ORDERS_LIMIT = 10;
const RECENT_WALLET_TRANSACTIONS_LIMIT = 20;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createAdmin(input: CreateAdminInput) {
    const passwordHash = await bcrypt.hash(input.password, 12);

    return this.prisma.$transaction(async (tx) => {
      const userCode = await generateUserCode(tx, 'admin');
      const user = await tx.user.create({
        data: {
          user_code: userCode,
          display_name: input.displayName,
          phone: input.phone,
          email: input.email,
          password_hash: passwordHash,
          auth_provider: input.email ? 'email' : 'phone',
          role: 'admin',
          phone_verified: Boolean(input.phone),
          email_verified: Boolean(input.email),
        },
      });
      const adminProfile = await tx.adminProfile.create({
        data: { user_id: user.id, admin_role: input.adminRole },
      });
      return { user, adminProfile };
    });
  }

  /** Paginated, filterable user list for the admin portal's User Management screen. */
  async findAll(query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.UserWhereInput = {
      ...(query.role && { role: query.role }),
      ...(query.is_banned !== undefined && { is_banned: query.is_banned }),
      ...(query.is_migrated !== undefined && {
        is_migrated: query.is_migrated,
      }),
      ...(query.city_id !== undefined && { detected_city_id: query.city_id }),
      ...(query.search && {
        OR: [
          { display_name: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: USER_LIST_SELECT,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  /** Full profile view: user fields + saved addresses, recent orders/wallet activity, reseller info. */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...USER_LIST_SELECT,
        saved_addresses: true,
        reseller: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const [orders, walletTransactions] = await Promise.all([
      this.prisma.order.findMany({
        where: { user_id: id },
        select: {
          id: true,
          order_number: true,
          status: true,
          total: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        take: RECENT_ORDERS_LIMIT,
      }),
      this.prisma.walletTransaction.findMany({
        where: { user_id: id },
        orderBy: { created_at: 'desc' },
        take: RECENT_WALLET_TRANSACTIONS_LIMIT,
      }),
    ]);

    return { ...user, orders, wallet_transactions: walletTransactions };
  }

  /** Bans a user and bumps token_version so every live access token they hold is rejected on next use. */
  async ban(id: number, dto: BanUserDto, adminId: number) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        is_banned: true,
        ban_reason: dto.ban_reason,
        token_version: { increment: 1 },
      },
    });

    await this.audit.log(adminId, 'user_ban', {
      targetTable: 'users',
      targetId: String(id),
      description: `Banned user ${updated.user_code}`,
      oldData: {
        is_banned: existing.is_banned,
        ban_reason: existing.ban_reason,
      },
      newData: { is_banned: updated.is_banned, ban_reason: updated.ban_reason },
    });

    return {
      id: updated.id,
      is_banned: updated.is_banned,
      ban_reason: updated.ban_reason,
      token_version: updated.token_version,
    };
  }

  /** Reverses a ban. Does not touch token_version — the point of banning was to force re-auth, unbanning doesn't need to. */
  async unban(id: number, adminId: number) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        is_banned: false,
        ban_reason: null,
      },
    });

    await this.audit.log(adminId, 'user_unban', {
      targetTable: 'users',
      targetId: String(id),
      description: `Unbanned user ${updated.user_code}`,
      oldData: {
        is_banned: existing.is_banned,
        ban_reason: existing.ban_reason,
      },
      newData: { is_banned: updated.is_banned, ban_reason: updated.ban_reason },
    });

    return {
      id: updated.id,
      is_banned: updated.is_banned,
      ban_reason: updated.ban_reason,
    };
  }

  /**
   * Admin-initiated wallet credit/debit. Runs in a single transaction so the new
   * WalletTransaction row and the user's wallet_balance can never drift apart.
   */
  async adjustWallet(id: number, dto: WalletAdjustmentDto, adminId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User ${id} not found`);
      }

      const amount = new Prisma.Decimal(dto.amount);
      const newBalance =
        dto.type === 'credit'
          ? user.wallet_balance.plus(amount)
          : user.wallet_balance.minus(amount);

      if (dto.type === 'debit' && newBalance.lessThan(0)) {
        throw new BadRequestException(
          'Debit would take the wallet balance negative',
        );
      }

      const source = dto.type === 'credit' ? 'admin_credit' : 'admin_debit';

      const updatedUser = await tx.user.update({
        where: { id },
        data: { wallet_balance: newBalance },
      });
      const transaction = await tx.walletTransaction.create({
        data: {
          user_id: id,
          type: dto.type,
          source,
          amount,
          balance_after: newBalance,
          description: dto.description,
        },
      });

      return { user, updatedUser, transaction };
    });

    await this.audit.log(adminId, 'wallet_adjustment', {
      targetTable: 'users',
      targetId: String(id),
      description: `${dto.type === 'credit' ? 'Credited' : 'Debited'} ${dto.amount} for user ${result.user.user_code}`,
      newData: {
        type: dto.type,
        amount: dto.amount,
        balanceAfter: result.updatedUser.wallet_balance.toString(),
      },
    });

    return {
      userId: id,
      walletBalance: result.updatedUser.wallet_balance,
      transaction: result.transaction,
    };
  }
}
