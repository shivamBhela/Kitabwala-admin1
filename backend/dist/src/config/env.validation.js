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
exports.validateEnv = validateEnv;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class EnvironmentVariables {
    DATABASE_URL;
    REDIS_URL;
    JWT_ACCESS_SECRET;
    JWT_ACCESS_TTL;
    JWT_REFRESH_TTL_DAYS;
    TOTP_ENCRYPTION_KEY;
    ANALYTICS_TIMEZONE;
    SAME_DAY_CACHE_TTL_SECONDS;
    CORS_ORIGIN;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DATABASE_URL", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "REDIS_URL", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_ACCESS_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_ACCESS_TTL", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "JWT_REFRESH_TTL_DAYS", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "TOTP_ENCRYPTION_KEY", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "ANALYTICS_TIMEZONE", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "SAME_DAY_CACHE_TTL_SECONDS", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "CORS_ORIGIN", void 0);
const KNOWN_PLACEHOLDER_SECRETS = new Set([
    'dev-access-secret-change-me',
    'dev-32-byte-totp-key-change-me!!',
    '__CHANGE_ME__',
]);
const MIN_SECRET_LENGTH = {
    JWT_ACCESS_SECRET: 32,
    TOTP_ENCRYPTION_KEY: 16,
};
function validateEnv(config) {
    const validated = (0, class_transformer_1.plainToInstance)(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = (0, class_validator_1.validateSync)(validated, { skipMissingProperties: false });
    if (errors.length > 0) {
        throw new Error(`Invalid environment configuration:\n${errors.map((e) => e.toString()).join('\n')}`);
    }
    const bypassActive = config.AUTH_DEV_BYPASS === 'true' && config.NODE_ENV !== 'production';
    if (!bypassActive) {
        for (const key of ['JWT_ACCESS_SECRET', 'TOTP_ENCRYPTION_KEY']) {
            const value = validated[key];
            if (KNOWN_PLACEHOLDER_SECRETS.has(value)) {
                throw new Error(`${key} is still a known placeholder value — set a real secret before running outside dev-bypass mode.`);
            }
            if (value.length < MIN_SECRET_LENGTH[key]) {
                throw new Error(`${key} must be at least ${MIN_SECRET_LENGTH[key]} characters outside dev-bypass mode (got ${value.length}).`);
            }
        }
    }
    return validated;
}
//# sourceMappingURL=env.validation.js.map