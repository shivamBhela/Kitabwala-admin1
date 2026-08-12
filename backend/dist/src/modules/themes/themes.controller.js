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
exports.ThemesController = void 0;
const common_1 = require("@nestjs/common");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_1 = require("../auth/rbac/permissions");
const themes_service_1 = require("./themes.service");
const create_theme_dto_1 = require("./dto/create-theme.dto");
const update_theme_dto_1 = require("./dto/update-theme.dto");
let ThemesController = class ThemesController {
    themesService;
    constructor(themesService) {
        this.themesService = themesService;
    }
    findAll() {
        return this.themesService.findAll();
    }
    getEffective() {
        return this.themesService.getEffective();
    }
    findOne(id) {
        return this.themesService.findOne(id);
    }
    create(dto, user) {
        return this.themesService.create(dto, user.sub);
    }
    update(id, dto, user) {
        return this.themesService.update(id, dto, user.sub);
    }
    activate(id, user) {
        return this.themesService.activate(id, user.sub);
    }
};
exports.ThemesController = ThemesController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.THEMES_MANAGE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('effective'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.THEMES_MANAGE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getEffective", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.THEMES_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.THEMES_MANAGE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_theme_dto_1.CreateThemeDto, Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.THEMES_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_theme_dto_1.UpdateThemeDto, Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.THEMES_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "activate", null);
exports.ThemesController = ThemesController = __decorate([
    (0, common_1.Controller)('themes'),
    __metadata("design:paramtypes", [themes_service_1.ThemesService])
], ThemesController);
//# sourceMappingURL=themes.controller.js.map