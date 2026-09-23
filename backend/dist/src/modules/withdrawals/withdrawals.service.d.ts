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
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<any>;
    private getWithdrawalOrThrow;
    approve(id: number, adminId: number): Promise<any>;
    reject(id: number, dto: RejectWithdrawalDto, adminId: number): Promise<any>;
    complete(id: number, dto: CompleteWithdrawalDto, adminId: number): Promise<any>;
}
