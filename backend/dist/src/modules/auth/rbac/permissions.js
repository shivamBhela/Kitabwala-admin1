"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.Permission = void 0;
exports.roleHasPermission = roleHasPermission;
const client_1 = require("@prisma/client");
var Permission;
(function (Permission) {
    Permission["ANALYTICS_READ"] = "analytics.read";
    Permission["USERS_MANAGE"] = "users.manage";
    Permission["ORDERS_MANAGE"] = "orders.manage";
    Permission["ADMIN_MANAGE"] = "admin.manage";
    Permission["AUDIT_READ"] = "audit.read";
    Permission["PRODUCTS_MANAGE"] = "products.manage";
    Permission["VENDORS_MANAGE"] = "vendors.manage";
    Permission["PINCODES_MANAGE"] = "pincodes.manage";
    Permission["DELIVERY_MANAGE"] = "delivery.manage";
    Permission["RETURNS_MANAGE"] = "returns.manage";
    Permission["WITHDRAWALS_MANAGE"] = "withdrawals.manage";
    Permission["SETTINGS_MANAGE"] = "settings.manage";
    Permission["THEMES_MANAGE"] = "themes.manage";
})(Permission || (exports.Permission = Permission = {}));
exports.ROLE_PERMISSIONS = {
    [client_1.AdminRole.super_admin]: Object.values(Permission),
    [client_1.AdminRole.ops]: [
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
    [client_1.AdminRole.finance]: [Permission.ANALYTICS_READ, Permission.AUDIT_READ, Permission.WITHDRAWALS_MANAGE],
    [client_1.AdminRole.analytics_viewer]: [Permission.ANALYTICS_READ],
    [client_1.AdminRole.support]: [Permission.USERS_MANAGE],
};
function roleHasPermission(role, permission) {
    if (!role)
        return false;
    return exports.ROLE_PERMISSIONS[role].includes(permission);
}
//# sourceMappingURL=permissions.js.map