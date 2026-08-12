import { AdminRole } from '@prisma/client';

export enum Permission {
  ANALYTICS_READ = 'analytics.read',
  USERS_MANAGE = 'users.manage',
  ORDERS_MANAGE = 'orders.manage',
  ADMIN_MANAGE = 'admin.manage',
  AUDIT_READ = 'audit.read',
  PRODUCTS_MANAGE = 'products.manage',
  VENDORS_MANAGE = 'vendors.manage',
  PINCODES_MANAGE = 'pincodes.manage',
  DELIVERY_MANAGE = 'delivery.manage',
  RETURNS_MANAGE = 'returns.manage',
  WITHDRAWALS_MANAGE = 'withdrawals.manage',
  SETTINGS_MANAGE = 'settings.manage',
  THEMES_MANAGE = 'themes.manage',
}

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.super_admin]: Object.values(Permission),
  [AdminRole.ops]: [
    Permission.ORDERS_MANAGE,
    Permission.USERS_MANAGE,
    Permission.ANALYTICS_READ,
    Permission.PRODUCTS_MANAGE,
    Permission.VENDORS_MANAGE,
    Permission.PINCODES_MANAGE,
    Permission.DELIVERY_MANAGE,
    Permission.RETURNS_MANAGE,
    Permission.THEMES_MANAGE,
  ],
  [AdminRole.finance]: [Permission.ANALYTICS_READ, Permission.AUDIT_READ, Permission.WITHDRAWALS_MANAGE],
  [AdminRole.analytics_viewer]: [Permission.ANALYTICS_READ],
  [AdminRole.support]: [Permission.USERS_MANAGE],
};

export function roleHasPermission(role: AdminRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}
