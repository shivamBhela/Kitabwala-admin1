import type { Permission } from '../../modules/auth/rbac/permissions';
export declare const PERMISSION_KEY = "permission";
export declare const RequirePermission: (permission: Permission) => import("@nestjs/common").CustomDecorator<string>;
