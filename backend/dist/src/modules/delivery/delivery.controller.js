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
exports.DeliveryController = void 0;
const common_1 = require("@nestjs/common");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_1 = require("../auth/rbac/permissions");
const delivery_service_1 = require("./delivery.service");
const list_delivery_persons_query_dto_1 = require("./dto/list-delivery-persons-query.dto");
const create_delivery_person_dto_1 = require("./dto/create-delivery-person.dto");
const update_delivery_person_dto_1 = require("./dto/update-delivery-person.dto");
const list_shipments_query_dto_1 = require("./dto/list-shipments-query.dto");
const assign_shipment_dto_1 = require("./dto/assign-shipment.dto");
const update_shipment_status_dto_1 = require("./dto/update-shipment-status.dto");
let DeliveryController = class DeliveryController {
    deliveryService;
    constructor(deliveryService) {
        this.deliveryService = deliveryService;
    }
    findAllPersons(query) {
        return this.deliveryService.findAllPersons(query);
    }
    createPerson(dto, user) {
        return this.deliveryService.createPerson(dto, user.sub);
    }
    updatePerson(id, dto, user) {
        return this.deliveryService.updatePerson(id, dto, user.sub);
    }
    deactivatePerson(id, user) {
        return this.deliveryService.deactivatePerson(id, user.sub);
    }
    findAllShipments(query) {
        return this.deliveryService.findAllShipments(query);
    }
    findOneShipment(id) {
        return this.deliveryService.findOneShipment(id);
    }
    assignShipment(id, dto, user) {
        return this.deliveryService.assignShipment(id, dto, user.sub);
    }
    updateShipmentStatus(id, dto, user) {
        return this.deliveryService.updateShipmentStatus(id, dto, user.sub);
    }
    getShipmentAttempts(id) {
        return this.deliveryService.getShipmentAttempts(id);
    }
};
exports.DeliveryController = DeliveryController;
__decorate([
    (0, common_1.Get)('persons'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.DELIVERY_MANAGE),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_delivery_persons_query_dto_1.ListDeliveryPersonsQueryDto]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "findAllPersons", null);
__decorate([
    (0, common_1.Post)('persons'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.DELIVERY_MANAGE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_delivery_person_dto_1.CreateDeliveryPersonDto, Object]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "createPerson", null);
__decorate([
    (0, common_1.Patch)('persons/:id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.DELIVERY_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_delivery_person_dto_1.UpdateDeliveryPersonDto, Object]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "updatePerson", null);
__decorate([
    (0, common_1.Patch)('persons/:id/deactivate'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.DELIVERY_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "deactivatePerson", null);
__decorate([
    (0, common_1.Get)('shipments'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.DELIVERY_MANAGE),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_shipments_query_dto_1.ListShipmentsQueryDto]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "findAllShipments", null);
__decorate([
    (0, common_1.Get)('shipments/:id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.DELIVERY_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "findOneShipment", null);
__decorate([
    (0, common_1.Patch)('shipments/:id/assign'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.DELIVERY_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, assign_shipment_dto_1.AssignShipmentDto, Object]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "assignShipment", null);
__decorate([
    (0, common_1.Patch)('shipments/:id/status'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.DELIVERY_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_shipment_status_dto_1.UpdateShipmentStatusDto, Object]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "updateShipmentStatus", null);
__decorate([
    (0, common_1.Get)('shipments/:id/attempts'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.DELIVERY_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "getShipmentAttempts", null);
exports.DeliveryController = DeliveryController = __decorate([
    (0, common_1.Controller)('delivery'),
    __metadata("design:paramtypes", [delivery_service_1.DeliveryService])
], DeliveryController);
//# sourceMappingURL=delivery.controller.js.map