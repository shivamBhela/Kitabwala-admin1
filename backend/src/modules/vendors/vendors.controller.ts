import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permission } from '../auth/rbac/permissions';
import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { VendorsService } from './vendors.service';
import { ListVendorsQueryDto } from './dto/list-vendors-query.dto';
import { VerifyKycDto } from './dto/verify-kyc.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { UpdateBankDetailsDto } from './dto/update-bank-details.dto';
import { VacationModeDto } from './dto/vacation-mode.dto';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @RequirePermission(Permission.VENDORS_MANAGE)
  findAll(@Query() query: ListVendorsQueryDto) {
    return this.vendorsService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(Permission.VENDORS_MANAGE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vendorsService.findOne(id);
  }

  @Patch(':id/verify-kyc')
  @RequirePermission(Permission.VENDORS_MANAGE)
  verifyKyc(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyKycDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vendorsService.verifyKyc(id, dto, user.sub);
  }

  @Patch(':id/commission')
  @RequirePermission(Permission.VENDORS_MANAGE)
  updateCommission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommissionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vendorsService.updateCommission(id, dto, user.sub);
  }

  @Patch(':id/suspend')
  @RequirePermission(Permission.VENDORS_MANAGE)
  suspend(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.vendorsService.suspend(id, user.sub);
  }

  @Patch(':id/reactivate')
  @RequirePermission(Permission.VENDORS_MANAGE)
  reactivate(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.vendorsService.reactivate(id, user.sub);
  }

  @Patch(':id/bank-details')
  @RequirePermission(Permission.VENDORS_MANAGE)
  updateBankDetails(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBankDetailsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vendorsService.updateBankDetails(id, dto, user.sub);
  }

  @Patch(':id/vacation-mode')
  @RequirePermission(Permission.VENDORS_MANAGE)
  setVacationMode(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VacationModeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vendorsService.setVacationMode(id, dto, user.sub);
  }
}
