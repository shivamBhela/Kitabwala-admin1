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
exports.WithdrawalsController = void 0;
const common_1 = require("@nestjs/common");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_1 = require("../auth/rbac/permissions");
const withdrawals_service_1 = require("./withdrawals.service");
const list_withdrawals_query_dto_1 = require("./dto/list-withdrawals-query.dto");
const reject_withdrawal_dto_1 = require("./dto/reject-withdrawal.dto");
const complete_withdrawal_dto_1 = require("./dto/complete-withdrawal.dto");
let WithdrawalsController = class WithdrawalsController {
    withdrawalsService;
    constructor(withdrawalsService) {
        this.withdrawalsService = withdrawalsService;
    }
    findAll(query) {
        return this.withdrawalsService.findAll(query);
    }
    findOne(id) {
        return this.withdrawalsService.findOne(id);
    }
    approve(id, user) {
        return this.withdrawalsService.approve(id, user.sub);
    }
    reject(id, dto, user) {
        return this.withdrawalsService.reject(id, dto, user.sub);
    }
    complete(id, dto, user) {
        return this.withdrawalsService.complete(id, dto, user.sub);
    }
};
exports.WithdrawalsController = WithdrawalsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.WITHDRAWALS_MANAGE),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_withdrawals_query_dto_1.ListWithdrawalsQueryDto]),
    __metadata("design:returntype", void 0)
], WithdrawalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.WITHDRAWALS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], WithdrawalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.WITHDRAWALS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WithdrawalsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.WITHDRAWALS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reject_withdrawal_dto_1.RejectWithdrawalDto, Object]),
    __metadata("design:returntype", void 0)
], WithdrawalsController.prototype, "reject", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.WITHDRAWALS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, complete_withdrawal_dto_1.CompleteWithdrawalDto, Object]),
    __metadata("design:returntype", void 0)
], WithdrawalsController.prototype, "complete", null);
exports.WithdrawalsController = WithdrawalsController = __decorate([
    (0, common_1.Controller)('withdrawals'),
    __metadata("design:paramtypes", [withdrawals_service_1.WithdrawalsService])
], WithdrawalsController);
//# sourceMappingURL=withdrawals.controller.js.map