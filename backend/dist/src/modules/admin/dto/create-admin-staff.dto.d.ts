import { AdminRole } from '@prisma/client';
export declare class CreateAdminStaffDto {
    displayName: string;
    phone?: string;
    email?: string;
    password: string;
    adminRole: AdminRole;
}
