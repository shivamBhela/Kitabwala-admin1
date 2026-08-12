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
exports.CreatePincodeDto = void 0;
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreatePincodeDto {
    pincode;
    city_id;
    delivery_zone;
    cod_type;
    partial_cod_amount;
    is_same_day_eligible;
    is_delivery_available;
}
exports.CreatePincodeDto = CreatePincodeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePincodeDto.prototype, "pincode", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePincodeDto.prototype, "city_id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.DeliveryZone),
    __metadata("design:type", String)
], CreatePincodeDto.prototype, "delivery_zone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CodType),
    __metadata("design:type", String)
], CreatePincodeDto.prototype, "cod_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePincodeDto.prototype, "partial_cod_amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePincodeDto.prototype, "is_same_day_eligible", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePincodeDto.prototype, "is_delivery_available", void 0);
//# sourceMappingURL=create-pincode.dto.js.map