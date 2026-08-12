import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permission } from '../auth/rbac/permissions';
import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { OrdersService } from './orders.service';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RefundOrderDto } from './dto/refund-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @RequirePermission(Permission.ORDERS_MANAGE)
  findAll(@Query() query: ListOrdersQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(Permission.ORDERS_MANAGE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @RequirePermission(Permission.ORDERS_MANAGE)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.updateStatus(id, dto, user.sub);
  }

  @Post(':id/refund')
  @RequirePermission(Permission.ORDERS_MANAGE)
  refund(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RefundOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.refund(id, dto, user.sub);
  }

  @Patch(':id/cancel')
  @RequirePermission(Permission.ORDERS_MANAGE)
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.cancel(id, dto, user.sub);
  }

  @Get(':id/invoice-number')
  @RequirePermission(Permission.ORDERS_MANAGE)
  getInvoiceNumber(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.getInvoiceNumber(id, user.sub);
  }
}
