import { UserRole } from '@prisma/client';
export declare class ListUsersQueryDto {
    role?: UserRole;
    is_banned?: boolean;
    is_migrated?: boolean;
    city_id?: number;
    search?: string;
    page: number;
    limit: number;
}
