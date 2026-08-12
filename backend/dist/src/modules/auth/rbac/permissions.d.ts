import { AdminRole } from '@prisma/client';
export declare enum Permission {
    ANALYTICS_READ = "analytics.read",
    USERS_MANAGE = "users.manage",
    ORDERS_MANAGE = "orders.manage",
    ADMIN_MANAGE = "admin.manage",
    AUDIT_READ = "audit.read",
    PRODUCTS_MANAGE = "products.manage",
    VENDORS_MANAGE = "vendors.manage",
    PINCODES_MANAGE = "pincodes.manage",
    DELIVERY_MANAGE = "delivery.manage",
    RETURNS_MANAGE = "returns.manage",
    WITHDRAWALS_MANAGE = "withdrawals.manage",
    SETTINGS_MANAGE = "settings.manage",
    THEMES_MANAGE = "themes.manage"
}
export declare const ROLE_PERMISSIONS: Record<AdminRole, Permission[]>;
export declare function roleHasPermission(role: AdminRole | undefined | null, permission: Permission): boolean;
