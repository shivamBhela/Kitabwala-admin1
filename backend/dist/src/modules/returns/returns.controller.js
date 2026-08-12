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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnsController = void 0;
const common_1 = require("@nestjs/common");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_1 = require("../auth/rbac/permissions");
const returns_service_1 = require("./returns.service");
const list_returns_query_dto_1 = require("./dto/list-returns-query.dto");
const approve_return_dto_1 = require("./dto/approve-return.dto");
const reject_return_dto_1 = require("./dto/reject-return.dto");
const refund_return_dto_1 = require("./dto/refund-return.dto");
let ReturnsController = class ReturnsController {
    returnsService;
    constructor(returnsService) {
        this.returnsService = returnsService;
    }
    findAll(query) {
        return this.returnsService.findAll(query);
    }
    findOne(id) {
        return this.returnsService.findOne(id);
    }
    approve(id, dto, user) {
        return this.returnsService.approve(id, dto, user.sub);
    }
    reject(id, dto, user) {
        return this.returnsService.reject(id, dto, user.sub);
    }
    refund(id, dto, user) {
        return this.returnsService.refund(id, dto, user.sub);
    }
    complete(id, user) {
        return this.returnsService.complete(id, user.sub);
    }
};
exports.ReturnsController = ReturnsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.RETURNS_MANAGE),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_returns_query_dto_1.ListReturnsQueryDto]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.RETURNS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.RETURNS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, approve_return_dto_1.ApproveReturnDto, Object]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.RETURNS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reject_return_dto_1.RejectReturnDto, Object]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.RETURNS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, refund_return_dto_1.RefundReturnDto, Object]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "refund", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.RETURNS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "complete", null);
exports.ReturnsController = ReturnsController = __decorate([
    (0, common_1.Controller)('returns'),
    __metadata("design:paramtypes", [returns_service_1.ReturnsService])
], ReturnsController);
//# sourceMappingURL=returns.controller.js.map