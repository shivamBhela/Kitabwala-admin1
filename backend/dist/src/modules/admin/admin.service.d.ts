import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import type { CreateAdminStaffDto } from './dto/create-admin-staff.dto';
export declare class AdminService {
    private readonly users;
    private readonly audit;
    constructor(users: UsersService, audit: AuditService);
    createStaff(dto: CreateAdminStaffDto, createdByAdminId: number): Promise<{
        id: number;
        userCode: string;
        adminRole: import("@prisma/client").$Enums.AdminRole;
    }>;
}
