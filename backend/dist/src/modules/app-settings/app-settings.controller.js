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
exports.AppSettingsController = void 0;
const common_1 = require("@nestjs/common");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_1 = require("../auth/rbac/permissions");
const app_settings_service_1 = require("./app-settings.service");
const upsert_app_setting_dto_1 = require("./dto/upsert-app-setting.dto");
let AppSettingsController = class AppSettingsController {
    appSettingsService;
    constructor(appSettingsService) {
        this.appSettingsService = appSettingsService;
    }
    findAll() {
        return this.appSettingsService.findAll();
    }
    findOne(key) {
        return this.appSettingsService.findOne(key);
    }
    upsert(key, dto, user) {
        return this.appSettingsService.upsert(key, dto, user.sub);
    }
};
exports.AppSettingsController = AppSettingsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.SETTINGS_MANAGE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppSettingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':key'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.SETTINGS_MANAGE),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppSettingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':key'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.SETTINGS_MANAGE),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_app_setting_dto_1.UpsertAppSettingDto, Object]),
    __metadata("design:returntype", void 0)
], AppSettingsController.prototype, "upsert", null);
exports.AppSettingsController = AppSettingsController = __decorate([
    (0, common_1.Controller)('app-settings'),
    __metadata("design:paramtypes", [app_settings_service_1.AppSettingsService])
], AppSettingsController);
//# sourceMappingURL=app-settings.controller.js.map