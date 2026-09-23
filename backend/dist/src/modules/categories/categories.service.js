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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let CategoriesService = class CategoriesService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async findAll() {
        return this.prisma.category.findMany({
            orderBy: [{ parent_id: 'asc' }, { display_order: 'asc' }, { name: 'asc' }],
        });
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException(`Category ${id} not found`);
        }
        return category;
    }
    async create(dto, adminId) {
        if (dto.parent_id !== undefined) {
            await this.assertParentExists(dto.parent_id);
        }
        try {
            const category = await this.prisma.category.create({
                data: {
                    name: dto.name,
                    slug: dto.slug,
                    description: dto.description,
                    parent_id: dto.parent_id,
                    image_url: dto.image_url,
                    display_order: dto.display_order,
                    is_active: dto.is_active,
                },
            });
            await this.audit.log(adminId, 'category_create', {
                targetTable: 'categories',
                targetId: String(category.id),
                description: `Created category "${category.name}" (${category.slug})`,
                newData: JSON.parse(JSON.stringify(category)),
            });
            return category;
        }
        catch (err) {
            throw this.mapWriteError(err, dto.slug);
        }
    }
    async update(id, dto, adminId) {
        const existing = await this.findOne(id);
        if (dto.parent_id !== undefined && dto.parent_id !== null) {
            if (dto.parent_id === id) {
                throw new common_1.BadRequestException('A category cannot be its own parent');
            }
            await this.assertParentExists(dto.parent_id);
            await this.assertNoCycle(id, dto.parent_id);
        }
        try {
            const updated = await this.prisma.category.update({
                where: { id },
                data: {
                    name: dto.name,
                    slug: dto.slug,
                    description: dto.description,
                    parent_id: dto.parent_id,
                    image_url: dto.image_url,
                    display_order: dto.display_order,
                    is_active: dto.is_active,
                },
            });
            await this.audit.log(adminId, 'category_update', {
                targetTable: 'categories',
                targetId: String(id),
                description: `Updated category "${existing.name}"`,
                oldData: JSON.parse(JSON.stringify(existing)),
                newData: JSON.parse(JSON.stringify(updated)),
            });
            return updated;
        }
        catch (err) {
            throw this.mapWriteError(err, dto.slug);
        }
    }
    mapWriteError(err, slug) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            return new common_1.ConflictException(`Category with slug "${slug}" already exists`);
        }
        return err;
    }
    async assertParentExists(parentId) {
        const parent = await this.prisma.category.findUnique({ where: { id: parentId } });
        if (!parent) {
            throw new common_1.BadRequestException(`Parent category ${parentId} does not exist`);
        }
    }
    async assertNoCycle(categoryId, proposedParentId) {
        let currentId = proposedParentId;
        const visited = new Set();
        while (currentId !== null) {
            if (currentId === categoryId) {
                throw new common_1.BadRequestException('This change would create a circular category hierarchy');
            }
            if (visited.has(currentId))
                break;
            visited.add(currentId);
            const parent = await this.prisma.category.findUnique({
                where: { id: currentId },
                select: { parent_id: true },
            });
            currentId = parent?.parent_id ?? null;
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, audit_service_1.AuditService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map