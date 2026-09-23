import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { OrdersService } from './orders.service';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RefundOrderDto } from './dto/refund-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(query: ListOrdersQueryDto): Promise<{
        items: any;
        page: number;
        limit: number;
        total: any;
        totalPages: number;
    }>;
    findOne(id: number): Promise<any>;
    updateStatus(id: number, dto: UpdateOrderStatusDto, user: AuthenticatedUser): Promise<any>;
    refund(id: number, dto: RefundOrderDto, user: AuthenticatedUser): Promise<any>;
    cancel(id: number, dto: CancelOrderDto, user: AuthenticatedUser): Promise<any>;
    getInvoiceNumber(id: number, user: AuthenticatedUser): Promise<{
        invoice_number: any;
    }>;
}
