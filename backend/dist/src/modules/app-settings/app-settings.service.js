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
exports.AppSettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const REDACTED_VALUE = '***redacted***';
let AppSettingsService = class AppSettingsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    isSecretKey(key) {
        return key.toLowerCase().includes('secret');
    }
    toResponse(setting) {
        return {
            key: setting.key,
            value: this.isSecretKey(setting.key) ? REDACTED_VALUE : setting.value,
            description: setting.description,
            updated_at: setting.updated_at,
        };
    }
    async findAll() {
        const settings = await this.prisma.appSetting.findMany({ orderBy: { key: 'asc' } });
        return settings.map((setting) => this.toResponse(setting));
    }
    async findOne(key) {
        const setting = await this.prisma.appSetting.findUnique({ where: { key } });
        if (!setting) {
            throw new common_1.NotFoundException(`Setting "${key}" not found`);
        }
        return this.toResponse(setting);
    }
    async upsert(key, dto, adminId) {
        const existing = await this.prisma.appSetting.findUnique({ where: { key } });
        const setting = await this.prisma.appSetting.upsert({
            where: { key },
            create: { key, value: dto.value, description: dto.description },
            update: { value: dto.value, description: dto.description },
        });
        await this.audit.log(adminId, 'settings_update', {
            targetTable: 'app_settings',
            targetId: key,
            oldData: existing ? { value: existing.value, description: existing.description } : undefined,
            newData: { value: dto.value, description: dto.description ?? null },
        });
        return this.toResponse(setting);
    }
};
exports.AppSettingsService = AppSettingsService;
exports.AppSettingsService = AppSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], AppSettingsService);
//# sourceMappingURL=app-settings.service.js.map