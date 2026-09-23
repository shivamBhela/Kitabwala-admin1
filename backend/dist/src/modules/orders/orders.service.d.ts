import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import type { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import type { RefundOrderDto } from './dto/refund-order.dto';
import type { CancelOrderDto } from './dto/cancel-order.dto';
export declare class OrdersService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAll(query: ListOrdersQueryDto): Promise<{
        items: any;
        page: number;
        limit: number;
        total: any;
        totalPages: number;
    }>;
    findOne(id: number): Promise<any>;
    updateStatus(id: number, dto: UpdateOrderStatusDto, adminId: number): Promise<any>;
    refund(id: number, dto: RefundOrderDto, adminId: number): Promise<any>;
    cancel(id: number, dto: CancelOrderDto, adminId: number): Promise<any>;
    getInvoiceNumber(id: number, adminId: number): Promise<{
        invoice_number: any;
    }>;
    private applyRefundInTx;
}
