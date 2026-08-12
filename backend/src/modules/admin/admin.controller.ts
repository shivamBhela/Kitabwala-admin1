import { Body, Controller, Post } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permission } from '../auth/rbac/permissions';
import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { AdminService } from './admin.service';
import { CreateAdminStaffDto } from './dto/create-admin-staff.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('staff')
  @RequirePermission(Permission.ADMIN_MANAGE)
  createStaff(@Body() dto: CreateAdminStaffDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.createStaff(dto, user.sub);
  }
}
