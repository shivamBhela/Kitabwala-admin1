import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListVendorsQueryDto } from './dto/list-vendors-query.dto';
import type { VerifyKycDto } from './dto/verify-kyc.dto';
import type { UpdateCommissionDto } from './dto/update-commission.dto';
import type { UpdateBankDetailsDto } from './dto/update-bank-details.dto';
import type { VacationModeDto } from './dto/vacation-mode.dto';
export declare class VendorsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    private getVendorOrThrow;
    findAll(query: ListVendorsQueryDto): Promise<{
        items: any;
        page: number;
        limit: number;
        total: any;
        totalPages: number;
    }>;
    findOne(id: number): Promise<any>;
    verifyKyc(id: number, dto: VerifyKycDto, adminId: number): Promise<any>;
    updateCommission(id: number, dto: UpdateCommissionDto, adminId: number): Promise<any>;
    suspend(id: number, adminId: number): Promise<any>;
    reactivate(id: number, adminId: number): Promise<any>;
    updateBankDetails(id: number, dto: UpdateBankDetailsDto, adminId: number): Promise<any>;
    setVacationMode(id: number, dto: VacationModeDto, adminId: number): Promise<any>;
}
