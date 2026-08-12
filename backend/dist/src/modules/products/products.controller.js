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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_1 = require("../auth/rbac/permissions");
const products_service_1 = require("./products.service");
const list_products_query_dto_1 = require("./dto/list-products-query.dto");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const reject_product_dto_1 = require("./dto/reject-product.dto");
const bulk_product_ids_dto_1 = require("./dto/bulk-product-ids.dto");
const feature_product_dto_1 = require("./dto/feature-product.dto");
const upsert_city_price_dto_1 = require("./dto/upsert-city-price.dto");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    findAll(query) {
        return this.productsService.findAll(query);
    }
    findOne(id) {
        return this.productsService.findOne(id);
    }
    create(dto, user) {
        return this.productsService.create(dto, user.sub);
    }
    update(id, dto, user) {
        return this.productsService.update(id, dto, user.sub);
    }
    approve(id, user) {
        return this.productsService.approve(id, user.sub);
    }
    reject(id, dto, user) {
        return this.productsService.reject(id, dto, user.sub);
    }
    bulkApprove(dto, user) {
        return this.productsService.bulkApprove(dto, user.sub);
    }
    bulkDeactivate(dto, user) {
        return this.productsService.bulkDeactivate(dto, user.sub);
    }
    feature(id, dto, user) {
        return this.productsService.feature(id, dto, user.sub);
    }
    unfeature(id, user) {
        return this.productsService.unfeature(id, user.sub);
    }
    listCityPrices(id) {
        return this.productsService.listCityPrices(id);
    }
    upsertCityPrice(id, cityId, dto, user) {
        return this.productsService.upsertCityPrice(id, cityId, dto, user.sub);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PRODUCTS_MANAGE),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_products_query_dto_1.ListProductsQueryDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PRODUCTS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PRODUCTS_MANAGE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PRODUCTS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PRODUCTS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PRODUCTS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reject_product_dto_1.RejectProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)('bulk-approve'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PRODUCTS_MANAGE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_product_ids_dto_1.BulkProductIdsDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "bulkApprove", null);
__decorate([
    (0, common_1.Post)('bulk-deactivate'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PRODUCTS_MANAGE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_product_ids_dto_1.BulkProductIdsDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "bulkDeactivate", null);
__decorate([
    (0, common_1.Patch)(':id/feature'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PRODUCTS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, feature_product_dto_1.FeatureProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "feature", null);
__decorate([
    (0, common_1.Delete)(':id/feature'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PRODUCTS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "unfeature", null);
__decorate([
    (0, common_1.Get)(':id/city-prices'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PRODUCTS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "listCityPrices", null);
__decorate([
    (0, common_1.Put)(':id/city-prices/:cityId'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.Permission.PRODUCTS_MANAGE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('cityId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, upsert_city_price_dto_1.UpsertCityPriceDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "upsertCityPrice", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map