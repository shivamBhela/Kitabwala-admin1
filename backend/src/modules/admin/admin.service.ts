import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import type { CreateAdminStaffDto } from './dto/create-admin-staff.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly users: UsersService,
    private readonly audit: AuditService,
  ) {}

  async createStaff(dto: CreateAdminStaffDto, createdByAdminId: number) {
    const { user, adminProfile } = await this.users.createAdmin(dto);
    await this.audit.log(createdByAdminId, 'admin_role_change', {
      targetTable: 'admin_profiles',
      targetId: String(adminProfile.id),
      description: `Created admin staff ${user.user_code} with role ${adminProfile.admin_role}`,
    });
    return { id: user.id, userCode: user.user_code, adminRole: adminProfile.admin_role };
  }
}
