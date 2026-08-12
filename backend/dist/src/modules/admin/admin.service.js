"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const audit_service_1 = require("../audit/audit.service");
let AdminService = class AdminService {
    users;
    audit;
    constructor(users, audit) {
        this.users = users;
        this.audit = audit;
    }
    async createStaff(dto, createdByAdminId) {
        const { user, adminProfile } = await this.users.createAdmin(dto);
        await this.audit.log(createdByAdminId, 'admin_role_change', {
            targetTable: 'admin_profiles',
            targetId: String(adminProfile.id),
            description: `Created admin staff ${user.user_code} with role ${adminProfile.admin_role}`,
        });
        return { id: user.id, userCode: user.user_code, adminRole: adminProfile.admin_role };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        audit_service_1.AuditService])
], AdminService);
//# sourceMappingURL=admin.service.js.map