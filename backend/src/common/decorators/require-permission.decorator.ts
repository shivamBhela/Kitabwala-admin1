import { SetMetadata } from '@nestjs/common';
import type { Permission } from '../../modules/auth/rbac/permissions';

export const PERMISSION_KEY = 'permission';

export const RequirePermission = (permission: Permission) => SetMetadata(PERMISSION_KEY, permission);
