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
exports.DeliveryService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const DELIVERY_ATTEMPT_CAP = {
    [client_1.DeliveryType.same_day]: 1,
    [client_1.DeliveryType.normal]: 3,
};
const TERMINAL_SHIPMENT_STATUSES = new Set([
    client_1.ShipmentStatus.delivered,
    client_1.ShipmentStatus.returned_to_seller,
]);
const DELIVERY_PERSON_INCLUDE = {
    user: { select: { id: true, user_code: true, email: true, phone: true, role: true } },
};
function toDeliveryPersonSnapshot(person) {
    return {
        user_id: person.user_id,
        name: person.name,
        phone: person.phone,
        vehicle_type: person.vehicle_type,
        vehicle_number: person.vehicle_number,
        salary_per_month: person.salary_per_month?.toString() ?? null,
        per_delivery_charge: person.per_delivery_charge?.toString() ?? null,
        per_km_charge: person.per_km_charge?.toString() ?? null,
    };
}
const SHIPMENT_LIST_INCLUDE = {
    order: { select: { id: true, order_number: true } },
    delivery_person: { select: { id: true, name: true, phone: true } },
};
const SHIPMENT_DETAIL_INCLUDE = {
    order: {
        select: {
            id: true,
            order_number: true,
            status: true,
            payment_status: true,
            total: true,
            delivery_type: true,
            city: { select: { id: true, name: true } },
            pincode: true,
        },
    },
    delivery_person: true,
};
let DeliveryService = class DeliveryService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async findAllPersons(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
            ...(query.is_active !== undefined && { is_active: query.is_active }),
            ...(query.is_available !== undefined && { is_available: query.is_available }),
            ...(query.search && {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { phone: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };
        const [total, data] = await Promise.all([
            this.prisma.deliveryPerson.count({ where }),
            this.prisma.deliveryPerson.findMany({
                where,
                include: DELIVERY_PERSON_INCLUDE,
                orderBy: { id: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
        };
    }
    async validateLinkedUser(userId, excludeDeliveryPersonId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException(`User ${userId} does not exist`);
        }
        if (user.role !== client_1.UserRole.delivery_person) {
            throw new common_1.BadRequestException(`User ${userId} (${user.user_code}) has role "${user.role}", not "delivery_person" — only users with role delivery_person can be linked to a delivery person record.`);
        }
        const existingLink = await this.prisma.deliveryPerson.findUnique({ where: { user_id: userId } });
        if (existingLink && existingLink.id !== excludeDeliveryPersonId) {
            throw new common_1.ConflictException(`User ${userId} is already linked to delivery person ${existingLink.id} (${existingLink.name})`);
        }
    }
    async createPerson(dto, adminId) {
        await this.validateLinkedUser(dto.user_id);
        const created = await this.prisma.deliveryPerson.create({
            data: {
                user_id: dto.user_id,
                name: dto.name,
                phone: dto.phone,
                vehicle_type: dto.vehicle_type,
                vehicle_number: dto.vehicle_number,
                salary_per_month: dto.salary_per_month,
                per_delivery_charge: dto.per_delivery_charge,
                per_km_charge: dto.per_km_charge,
            },
            include: DELIVERY_PERSON_INCLUDE,
        });
        await this.audit.log(adminId, 'delivery_person_create', {
            targetTable: 'delivery_persons',
            targetId: String(created.id),
            description: `Created delivery person ${created.name} (linked to user ${created.user_id})`,
            newData: toDeliveryPersonSnapshot(created),
        });
        return created;
    }
    async getPersonOrThrow(id) {
        const person = await this.prisma.deliveryPerson.findUnique({ where: { id } });
        if (!person) {
            throw new common_1.NotFoundException(`Delivery person ${id} not found`);
        }
        return person;
    }
    async updatePerson(id, dto, adminId) {
        const existing = await this.getPersonOrThrow(id);
        if (dto.user_id !== undefined && dto.user_id !== existing.user_id) {
            await this.validateLinkedUser(dto.user_id, id);
        }
        const updated = await this.prisma.deliveryPerson.update({
            where: { id },
            data: {
                user_id: dto.user_id,
                name: dto.name,
                phone: dto.phone,
                vehicle_type: dto.vehicle_type,
                vehicle_number: dto.vehicle_number,
                salary_per_month: dto.salary_per_month,
                per_delivery_charge: dto.per_delivery_charge,
                per_km_charge: dto.per_km_charge,
            },
            include: DELIVERY_PERSON_INCLUDE,
        });
        await this.audit.log(adminId, 'delivery_person_update', {
            targetTable: 'delivery_persons',
            targetId: String(id),
            oldData: toDeliveryPersonSnapshot(existing),
            newData: toDeliveryPersonSnapshot(updated),
        });
        return updated;
    }
    async deactivatePerson(id, adminId) {
        const existing = await this.getPersonOrThrow(id);
        if (!existing.is_active) {
            throw new common_1.BadRequestException(`Delivery person ${id} is already deactivated`);
        }
        const updated = await this.prisma.deliveryPerson.update({
            where: { id },
            data: { is_active: false, is_available: false },
            include: DELIVERY_PERSON_INCLUDE,
        });
        await this.audit.log(adminId, 'delivery_person_deactivate', {
            targetTable: 'delivery_persons',
            targetId: String(id),
            description: `Deactivated delivery person ${existing.name}`,
            oldData: { is_active: existing.is_active, is_available: existing.is_available },
            newData: { is_active: updated.is_active, is_available: updated.is_available },
        });
        return updated;
    }
    async findAllShipments(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
            ...(query.status && { status: query.status }),
            ...(query.delivery_type && { delivery_type: query.delivery_type }),
            ...(query.delivery_person_id !== undefined && { delivery_person_id: query.delivery_person_id }),
        };
        const [total, data] = await Promise.all([
            this.prisma.shipment.count({ where }),
            this.prisma.shipment.findMany({
                where,
                include: SHIPMENT_LIST_INCLUDE,
                orderBy: { id: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
        };
    }
    async findOneShipment(id) {
        const shipment = await this.prisma.shipment.findUnique({
            where: { id },
            include: SHIPMENT_DETAIL_INCLUDE,
        });
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment ${id} not found`);
        }
        return shipment;
    }
    async getShipmentOrThrow(id) {
        const shipment = await this.prisma.shipment.findUnique({ where: { id } });
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment ${id} not found`);
        }
        return shipment;
    }
    async assignShipment(id, dto, adminId) {
        const shipment = await this.getShipmentOrThrow(id);
        if (shipment.delivery_type !== client_1.DeliveryType.same_day) {
            throw new common_1.BadRequestException(`Shipment ${id} is a "${shipment.delivery_type}" delivery — only same_day shipments are assigned to a local delivery person; normal deliveries are handled by the external Shadowfax courier.`);
        }
        if (TERMINAL_SHIPMENT_STATUSES.has(shipment.status)) {
            throw new common_1.BadRequestException(`Cannot assign a delivery person to shipment ${id} — it is already "${shipment.status}".`);
        }
        const person = await this.prisma.deliveryPerson.findUnique({ where: { id: dto.delivery_person_id } });
        if (!person) {
            throw new common_1.NotFoundException(`Delivery person ${dto.delivery_person_id} not found`);
        }
        if (!person.is_active) {
            throw new common_1.BadRequestException(`Delivery person ${person.id} (${person.name}) is deactivated and cannot be assigned shipments.`);
        }
        if (!person.is_available) {
            throw new common_1.BadRequestException(`Delivery person ${person.id} (${person.name}) is currently marked unavailable.`);
        }
        const updated = await this.prisma.shipment.update({
            where: { id },
            data: { delivery_person_id: person.id, status: client_1.ShipmentStatus.assigned },
            include: SHIPMENT_DETAIL_INCLUDE,
        });
        await this.audit.log(adminId, 'shipment_assign', {
            targetTable: 'shipments',
            targetId: String(id),
            description: `Assigned shipment ${id} to delivery person ${person.id} (${person.name})`,
            oldData: { delivery_person_id: shipment.delivery_person_id, status: shipment.status },
            newData: { delivery_person_id: updated.delivery_person_id, status: updated.status },
        });
        return updated;
    }
    async updateShipmentStatus(id, dto, adminId) {
        const shipment = await this.getShipmentOrThrow(id);
        const data = { status: dto.status };
        if (dto.status === client_1.ShipmentStatus.delivery_failed) {
            if (!dto.failed_reason || !dto.failed_reason.trim()) {
                throw new common_1.BadRequestException('failed_reason is required when setting status to "delivery_failed"');
            }
            const cap = DELIVERY_ATTEMPT_CAP[shipment.delivery_type];
            const nextAttempts = shipment.delivery_attempts + 1;
            if (nextAttempts > cap) {
                throw new common_1.BadRequestException(`Delivery attempt cap reached: "${shipment.delivery_type}" shipments allow at most ${cap} attempt(s) and this shipment already has ${shipment.delivery_attempts}. Reassign it to a different delivery person or mark it "returned_to_seller" instead of recording another failed attempt.`);
            }
            data.delivery_attempts = nextAttempts;
            data.last_attempt_at = new Date();
            data.failed_reason = dto.failed_reason;
        }
        else if (dto.status === client_1.ShipmentStatus.delivered) {
            data.actual_delivered_at = new Date();
        }
        const updated = await this.prisma.shipment.update({
            where: { id },
            data,
            include: SHIPMENT_DETAIL_INCLUDE,
        });
        await this.audit.log(adminId, 'shipment_status_update', {
            targetTable: 'shipments',
            targetId: String(id),
            description: `Force-updated shipment ${id} status: ${shipment.status} -> ${updated.status}`,
            oldData: { status: shipment.status, delivery_attempts: shipment.delivery_attempts },
            newData: {
                status: updated.status,
                delivery_attempts: updated.delivery_attempts,
                failed_reason: updated.failed_reason,
                actual_delivered_at: updated.actual_delivered_at,
            },
        });
        return updated;
    }
    async getShipmentAttempts(id) {
        const shipment = await this.prisma.shipment.findUnique({
            where: { id },
            select: {
                id: true,
                delivery_type: true,
                delivery_attempts: true,
                last_attempt_at: true,
                failed_reason: true,
                rescheduled_for: true,
            },
        });
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment ${id} not found`);
        }
        return {
            shipment_id: shipment.id,
            delivery_type: shipment.delivery_type,
            max_attempts: DELIVERY_ATTEMPT_CAP[shipment.delivery_type],
            delivery_attempts: shipment.delivery_attempts,
            last_attempt_at: shipment.last_attempt_at,
            failed_reason: shipment.failed_reason,
            rescheduled_for: shipment.rescheduled_for,
        };
    }
};
exports.DeliveryService = DeliveryService;
exports.DeliveryService = DeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], DeliveryService);
//# sourceMappingURL=delivery.service.js.map