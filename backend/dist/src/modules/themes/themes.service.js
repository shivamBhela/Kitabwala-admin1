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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let ThemesService = class ThemesService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async findAll() {
        return this.prisma.siteTheme.findMany({ orderBy: { created_at: 'desc' } });
    }
    async findOne(id) {
        const theme = await this.prisma.siteTheme.findUnique({ where: { id } });
        if (!theme) {
            throw new common_1.NotFoundException(`Theme ${id} not found`);
        }
        return theme;
    }
    async getEffective() {
        const now = new Date();
        const active = await this.prisma.siteTheme.findFirst({ where: { is_active: true } });
        if (active) {
            const startedOk = !active.valid_from || active.valid_from <= now;
            const notExpired = !active.valid_until || active.valid_until >= now;
            if (startedOk && notExpired) {
                return active;
            }
        }
        return this.prisma.siteTheme.findFirst({ where: { is_default: true } });
    }
    async create(dto, adminId) {
        if (dto.valid_from && dto.valid_until && new Date(dto.valid_from) > new Date(dto.valid_until)) {
            throw new common_1.BadRequestException('valid_from cannot be after valid_until.');
        }
        let created;
        try {
            created = await this.prisma.$transaction(async (tx) => {
                if (dto.is_default) {
                    await tx.siteTheme.updateMany({ where: { is_default: true }, data: { is_default: false } });
                }
                return tx.siteTheme.create({
                    data: {
                        name: dto.name,
                        slug: dto.slug,
                        description: dto.description,
                        colors: dto.colors,
                        is_default: dto.is_default ?? false,
                        valid_from: dto.valid_from ? new Date(dto.valid_from) : undefined,
                        valid_until: dto.valid_until ? new Date(dto.valid_until) : undefined,
                    },
                });
            });
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new common_1.ConflictException(`A theme with slug "${dto.slug}" already exists.`);
            }
            throw err;
        }
        await this.audit.log(adminId, 'theme_create', {
            targetTable: 'site_themes',
            targetId: String(created.id),
            description: `Created theme "${created.name}" (${created.slug})`,
            newData: { name: created.name, slug: created.slug, is_default: created.is_default },
        });
        return created;
    }
    async update(id, dto, adminId) {
        const existing = await this.findOne(id);
        const newValidFrom = dto.valid_from !== undefined ? dto.valid_from : existing.valid_from?.toISOString();
        const newValidUntil = dto.valid_until !== undefined ? dto.valid_until : existing.valid_until?.toISOString();
        if (newValidFrom && newValidUntil && new Date(newValidFrom) > new Date(newValidUntil)) {
            throw new common_1.BadRequestException('valid_from cannot be after valid_until.');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            if (dto.is_default) {
                await tx.siteTheme.updateMany({
                    where: { is_default: true, id: { not: id } },
                    data: { is_default: false },
                });
            }
            return tx.siteTheme.update({
                where: { id },
                data: {
                    name: dto.name,
                    description: dto.description,
                    colors: dto.colors,
                    is_default: dto.is_default,
                    valid_from: dto.valid_from === null ? null : dto.valid_from ? new Date(dto.valid_from) : undefined,
                    valid_until: dto.valid_until === null ? null : dto.valid_until ? new Date(dto.valid_until) : undefined,
                },
            });
        });
        await this.audit.log(adminId, 'theme_update', {
            targetTable: 'site_themes',
            targetId: String(id),
            description: `Updated theme "${existing.name}"`,
            oldData: { name: existing.name, colors: existing.colors, is_default: existing.is_default },
            newData: { name: updated.name, colors: updated.colors, is_default: updated.is_default },
        });
        return updated;
    }
    async activate(id, adminId) {
        const existing = await this.findOne(id);
        const updated = await this.prisma.$transaction(async (tx) => {
            await tx.siteTheme.updateMany({ where: { is_active: true }, data: { is_active: false } });
            return tx.siteTheme.update({ where: { id }, data: { is_active: true } });
        });
        await this.audit.log(adminId, 'theme_activate', {
            targetTable: 'site_themes',
            targetId: String(id),
            description: `Activated theme "${existing.name}"`,
            newData: { name: updated.name, valid_from: updated.valid_from, valid_until: updated.valid_until },
        });
        return updated;
    }
};
exports.ThemesService = ThemesService;
exports.ThemesService = ThemesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, audit_service_1.AuditService])
], ThemesService);
//# sourceMappingURL=themes.service.js.map