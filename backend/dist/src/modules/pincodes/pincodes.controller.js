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
exports.PincodesController = void 0;
const common_1 = require("@nestjs/common");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_1 = require("../auth/rbac/permissions");
const pincodes_service_1 = require("./pincodes.service");
const create_city_dto_1 = require("./dto/create-city.dto");
const list_cities_query_dto_1 = require("./dto/list-cities-query.dto");
const create_pincode_dto_1 = require("./dto/create-pincode.dto");
const update_pincode_dto_1 = require("./dto/update-pincode.dto");
const list_pincodes_query_dto_1 = require("./dto/list-pincodes-query.dto");
const import_pincodes_dto_1 = require("./dto/import-pincodes.dto");
let PincodesController = class PincodesController {
    pincodesService;
    constructor(pincodesService) {
        this.pincodesService = pincodesService;
    }
    listCities(query) {
        return this.pincodesService.listCities(query);
    }
    createCity(dto) {
        return this.pincodesService.createCity(dto);
    }
    listPincodes(query) {
        return this.pincodesService.listPincodes(query);
    }
    createPincode(dto) {
        return this.pincodesService.createPincode(dto);
    }
    updatePincode(id, dto) {
        return this.pincodesService.updatePincode(id, dto);
    }
    importCsv(dto, user) {
        return this.pincodesService.importCsv(dto.csv, user.sub);
    }
};
exports.PincodesController = PincodesController;
__decorate([
    (0, common_1.Get)('cities'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PINCODES_MANAGE),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_cities_query_dto_1.ListCitiesQueryDto]),
    __metadata("design:returntype", void 0)
], PincodesController.prototype, "listCities", null);
__decorate([
    (0, common_1.Post)('cities'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PINCODES_MANAGE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_city_dto_1.CreateCityDto]),
    __metadata("design:returntype", void 0)
], PincodesController.prototype, "createCity", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PINCODES_MANAGE),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_pincodes_query_dto_1.ListPincodesQueryDto]),
    __metadata("design:returntype", void 0)
], PincodesController.prototype, "listPincodes", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PINCODES_MANAGE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pincode_dto_1.CreatePincodeDto]),
    __metadata("design:returntype", void 0)
], PincodesController.prototype, "createPincode", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PINCODES_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_pincode_dto_1.UpdatePincodeDto]),
    __metadata("design:returntype", void 0)
], PincodesController.prototype, "updatePincode", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PINCODES_MANAGE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_pincodes_dto_1.ImportPincodesDto, Object]),
    __metadata("design:returntype", void 0)
], PincodesController.prototype, "importCsv", null);
exports.PincodesController = PincodesController = __decorate([
    (0, common_1.Controller)('pincodes'),
    __metadata("design:paramtypes", [pincodes_service_1.PincodesService])
], PincodesController);
//# sourceMappingURL=pincodes.controller.js.map