import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permission } from '../auth/rbac/permissions';
import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { WithdrawalsService } from './withdrawals.service';
import { ListWithdrawalsQueryDto } from './dto/list-withdrawals-query.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { CompleteWithdrawalDto } from './dto/complete-withdrawal.dto';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Get()
  @RequirePermission(Permission.WITHDRAWALS_MANAGE)
  findAll(@Query() query: ListWithdrawalsQueryDto) {
    return this.withdrawalsService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(Permission.WITHDRAWALS_MANAGE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.withdrawalsService.findOne(id);
  }

  @Patch(':id/approve')
  @RequirePermission(Permission.WITHDRAWALS_MANAGE)
  approve(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.withdrawalsService.approve(id, user.sub);
  }

  @Patch(':id/reject')
  @RequirePermission(Permission.WITHDRAWALS_MANAGE)
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectWithdrawalDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.withdrawalsService.reject(id, dto, user.sub);
  }

  @Patch(':id/complete')
  @RequirePermission(Permission.WITHDRAWALS_MANAGE)
  complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteWithdrawalDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.withdrawalsService.complete(id, dto, user.sub);
  }
}
