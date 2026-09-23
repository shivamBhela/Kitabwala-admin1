import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { ReturnsService } from './returns.service';
import { ListReturnsQueryDto } from './dto/list-returns-query.dto';
import { ApproveReturnDto } from './dto/approve-return.dto';
import { RejectReturnDto } from './dto/reject-return.dto';
import { RefundReturnDto } from './dto/refund-return.dto';
export declare class ReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
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
    approve(id: number, dto: ApproveReturnDto, user: AuthenticatedUser): Promise<any>;
    reject(id: number, dto: RejectReturnDto, user: AuthenticatedUser): Promise<any>;
    refund(id: number, dto: RefundReturnDto, user: AuthenticatedUser): Promise<any>;
    complete(id: number, user: AuthenticatedUser): Promise<any>;
}
