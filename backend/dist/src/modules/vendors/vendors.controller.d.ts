import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { VendorsService } from './vendors.service';
import { ListVendorsQueryDto } from './dto/list-vendors-query.dto';
import { VerifyKycDto } from './dto/verify-kyc.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { UpdateBankDetailsDto } from './dto/update-bank-details.dto';
import { VacationModeDto } from './dto/vacation-mode.dto';
export declare class VendorsController {
    private readonly vendorsService;
    constructor(vendorsService: VendorsService);
    findAll(query: ListVendorsQueryDto): Promise<{
        items: any;
        page: number;
        limit: number;
        total: any;
        totalPages: number;
    }>;
    findOne(id: number): Promise<any>;
    verifyKyc(id: number, dto: VerifyKycDto, user: AuthenticatedUser): Promise<any>;
    updateCommission(id: number, dto: UpdateCommissionDto, user: AuthenticatedUser): Promise<any>;
    suspend(id: number, user: AuthenticatedUser): Promise<any>;
    reactivate(id: number, user: AuthenticatedUser): Promise<any>;
    updateBankDetails(id: number, dto: UpdateBankDetailsDto, user: AuthenticatedUser): Promise<any>;
    setVacationMode(id: number, dto: VacationModeDto, user: AuthenticatedUser): Promise<any>;
}
