import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListReturnsQueryDto } from './dto/list-returns-query.dto';
import type { ApproveReturnDto } from './dto/approve-return.dto';
import type { RejectReturnDto } from './dto/reject-return.dto';
import type { RefundReturnDto } from './dto/refund-return.dto';
export declare class ReturnsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(query: ListReturnsQueryDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<any>;
    private getReturnOrThrow;
    private endOfFilterDay;
    private getReturnWindowDays;
    private assertWithinReturnWindow;
    approve(id: number, dto: ApproveReturnDto, adminId: number): Promise<any>;
    reject(id: number, dto: RejectReturnDto, adminId: number): Promise<any>;
    refund(id: number, dto: RefundReturnDto, adminId: number): Promise<any>;
    complete(id: number, adminId: number): Promise<any>;
}
