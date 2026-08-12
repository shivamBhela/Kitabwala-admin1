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
import { UsersService } from './users.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { WalletAdjustmentDto } from './dto/wallet-adjustment.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermission(Permission.USERS_MANAGE)
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(Permission.USERS_MANAGE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/ban')
  @RequirePermission(Permission.USERS_MANAGE)
  ban(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BanUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.ban(id, dto, user.sub);
  }

  @Patch(':id/unban')
  @RequirePermission(Permission.USERS_MANAGE)
  unban(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.unban(id, user.sub);
  }

  @Post(':id/wallet-adjustment')
  @RequirePermission(Permission.USERS_MANAGE)
  adjustWallet(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: WalletAdjustmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.adjustWallet(id, dto, user.sub);
  }
}
