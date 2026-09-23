import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { WithdrawalsService } from './withdrawals.service';
import { ListWithdrawalsQueryDto } from './dto/list-withdrawals-query.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { CompleteWithdrawalDto } from './dto/complete-withdrawal.dto';
export declare class WithdrawalsController {
    private readonly withdrawalsService;
    constructor(withdrawalsService: WithdrawalsService);
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
    approve(id: number, user: AuthenticatedUser): Promise<any>;
    reject(id: number, dto: RejectWithdrawalDto, user: AuthenticatedUser): Promise<any>;
    complete(id: number, dto: CompleteWithdrawalDto, user: AuthenticatedUser): Promise<any>;
}
