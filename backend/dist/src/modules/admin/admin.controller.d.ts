import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { AdminService } from './admin.service';
import { CreateAdminStaffDto } from './dto/create-admin-staff.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createStaff(dto: CreateAdminStaffDto, user: AuthenticatedUser): Promise<{
        id: any;
        userCode: any;
        adminRole: any;
    }>;
}
