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
exports.VendorsController = void 0;
const common_1 = require("@nestjs/common");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_1 = require("../auth/rbac/permissions");
const vendors_service_1 = require("./vendors.service");
const list_vendors_query_dto_1 = require("./dto/list-vendors-query.dto");
const verify_kyc_dto_1 = require("./dto/verify-kyc.dto");
const update_commission_dto_1 = require("./dto/update-commission.dto");
const update_bank_details_dto_1 = require("./dto/update-bank-details.dto");
const vacation_mode_dto_1 = require("./dto/vacation-mode.dto");
let VendorsController = class VendorsController {
    vendorsService;
    constructor(vendorsService) {
        this.vendorsService = vendorsService;
    }
    findAll(query) {
        return this.vendorsService.findAll(query);
    }
    findOne(id) {
        return this.vendorsService.findOne(id);
    }
    verifyKyc(id, dto, user) {
        return this.vendorsService.verifyKyc(id, dto, user.sub);
    }
    updateCommission(id, dto, user) {
        return this.vendorsService.updateCommission(id, dto, user.sub);
    }
    suspend(id, user) {
        return this.vendorsService.suspend(id, user.sub);
    }
    reactivate(id, user) {
        return this.vendorsService.reactivate(id, user.sub);
    }
    updateBankDetails(id, dto, user) {
        return this.vendorsService.updateBankDetails(id, dto, user.sub);
    }
    setVacationMode(id, dto, user) {
        return this.vendorsService.setVacationMode(id, dto, user.sub);
    }
};
exports.VendorsController = VendorsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.VENDORS_MANAGE),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_vendors_query_dto_1.ListVendorsQueryDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.VENDORS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/verify-kyc'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.VENDORS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, verify_kyc_dto_1.VerifyKycDto, Object]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "verifyKyc", null);
__decorate([
    (0, common_1.Patch)(':id/commission'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.VENDORS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_commission_dto_1.UpdateCommissionDto, Object]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "updateCommission", null);
__decorate([
    (0, common_1.Patch)(':id/suspend'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.VENDORS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "suspend", null);
__decorate([
    (0, common_1.Patch)(':id/reactivate'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.VENDORS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Patch)(':id/bank-details'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.VENDORS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_bank_details_dto_1.UpdateBankDetailsDto, Object]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "updateBankDetails", null);
__decorate([
    (0, common_1.Patch)(':id/vacation-mode'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.VENDORS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, vacation_mode_dto_1.VacationModeDto, Object]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "setVacationMode", null);
exports.VendorsController = VendorsController = __decorate([
    (0, common_1.Controller)('vendors'),
    __metadata("design:paramtypes", [vendors_service_1.VendorsService])
], VendorsController);
//# sourceMappingURL=vendors.controller.js.map