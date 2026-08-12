"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDevBypassActive = isDevBypassActive;
function isDevBypassActive() {
    return process.env.AUTH_DEV_BYPASS === 'true' && process.env.NODE_ENV !== 'production';
}
//# sourceMappingURL=dev-bypass.js.map