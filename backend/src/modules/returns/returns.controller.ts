import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permission } from '../auth/rbac/permissions';
import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { ReturnsService } from './returns.service';
import { ListReturnsQueryDto } from './dto/list-returns-query.dto';
import { ApproveReturnDto } from './dto/approve-return.dto';
import { RejectReturnDto } from './dto/reject-return.dto';
import { RefundReturnDto } from './dto/refund-return.dto';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  @RequirePermission(Permission.RETURNS_MANAGE)
  findAll(@Query() query: ListReturnsQueryDto) {
    return this.returnsService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(Permission.RETURNS_MANAGE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.returnsService.findOne(id);
  }

  @Patch(':id/approve')
  @RequirePermission(Permission.RETURNS_MANAGE)
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveReturnDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.returnsService.approve(id, dto, user.sub);
  }

  @Patch(':id/reject')
  @RequirePermission(Permission.RETURNS_MANAGE)
  reject(@Param('id', ParseIntPipe) id: number, @Body() dto: RejectReturnDto, @CurrentUser() user: AuthenticatedUser) {
    return this.returnsService.reject(id, dto, user.sub);
  }

  @Post(':id/refund')
  @RequirePermission(Permission.RETURNS_MANAGE)
  refund(@Param('id', ParseIntPipe) id: number, @Body() dto: RefundReturnDto, @CurrentUser() user: AuthenticatedUser) {
    return this.returnsService.refund(id, dto, user.sub);
  }

  @Patch(':id/complete')
  @RequirePermission(Permission.RETURNS_MANAGE)
  complete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.returnsService.complete(id, user.sub);
  }
}
