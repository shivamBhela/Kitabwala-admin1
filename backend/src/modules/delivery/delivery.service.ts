import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryType, Prisma, ShipmentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListDeliveryPersonsQueryDto } from './dto/list-delivery-persons-query.dto';
import type { CreateDeliveryPersonDto } from './dto/create-delivery-person.dto';
import type { UpdateDeliveryPersonDto } from './dto/update-delivery-person.dto';
import type { ListShipmentsQueryDto } from './dto/list-shipments-query.dto';
import type { AssignShipmentDto } from './dto/assign-shipment.dto';
import type { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

/** Max physical delivery attempts allowed on a shipment, keyed by its delivery_type. */
const DELIVERY_ATTEMPT_CAP: Record<DeliveryType, number> = {
  [DeliveryType.same_day]: 1,
  [DeliveryType.normal]: 3,
};

/** Shipment statuses that can no longer be (re)assigned to a delivery person. */
const TERMINAL_SHIPMENT_STATUSES: ReadonlySet<ShipmentStatus> = new Set([
  ShipmentStatus.delivered,
  ShipmentStatus.returned_to_seller,
]);

const DELIVERY_PERSON_INCLUDE = {
  user: { select: { id: true, user_code: true, email: true, phone: true, role: true } },
} satisfies Prisma.DeliveryPersonInclude;

/** Plain, JSON-safe snapshot of the admin-editable fields — used for audit log old/new data
 *  (avoids embedding Prisma.Decimal instances or the nested `user` relation object). */
function toDeliveryPersonSnapshot(person: {
  user_id: number;
  name: string;
  phone: string;
  vehicle_type: string | null;
  vehicle_number: string | null;
  salary_per_month: Prisma.Decimal | null;
  per_delivery_charge: Prisma.Decimal | null;
  per_km_charge: Prisma.Decimal | null;
}) {
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

/** Compact relations for the shipment list screen. */
const SHIPMENT_LIST_INCLUDE = {
  order: { select: { id: true, order_number: true } },
  delivery_person: { select: { id: true, name: true, phone: true } },
} satisfies Prisma.ShipmentInclude;

/** Full relations for the shipment detail screen. */
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
} satisfies Prisma.ShipmentInclude;

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---------------------------------------------------------------------------
  // Delivery persons
  // ---------------------------------------------------------------------------

  async findAllPersons(query: ListDeliveryPersonsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.DeliveryPersonWhereInput = {
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

  /**
   * Confirms `userId` exists and has role='delivery_person', and (outside of
   * `excludeDeliveryPersonId`) isn't already linked to another delivery person row.
   * Shared by create() and update() so both enforce the exact same rule.
   */
  private async validateLinkedUser(userId: number, excludeDeliveryPersonId?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(`User ${userId} does not exist`);
    }
    if (user.role !== UserRole.delivery_person) {
      throw new BadRequestException(
        `User ${userId} (${user.user_code}) has role "${user.role}", not "delivery_person" — only users with role delivery_person can be linked to a delivery person record.`,
      );
    }

    const existingLink = await this.prisma.deliveryPerson.findUnique({ where: { user_id: userId } });
    if (existingLink && existingLink.id !== excludeDeliveryPersonId) {
      throw new ConflictException(
        `User ${userId} is already linked to delivery person ${existingLink.id} (${existingLink.name})`,
      );
    }
  }

  async createPerson(dto: CreateDeliveryPersonDto, adminId: number) {
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

  private async getPersonOrThrow(id: number) {
    const person = await this.prisma.deliveryPerson.findUnique({ where: { id } });
    if (!person) {
      throw new NotFoundException(`Delivery person ${id} not found`);
    }
    return person;
  }

  async updatePerson(id: number, dto: UpdateDeliveryPersonDto, adminId: number) {
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

  /**
   * "Removing" a delivery person means deactivating, never a hard delete — Shipment
   * rows reference delivery_person_id and must not be left dangling.
   */
  async deactivatePerson(id: number, adminId: number) {
    const existing = await this.getPersonOrThrow(id);

    if (!existing.is_active) {
      throw new BadRequestException(`Delivery person ${id} is already deactivated`);
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

  // ---------------------------------------------------------------------------
  // Shipments
  // ---------------------------------------------------------------------------

  async findAllShipments(query: ListShipmentsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ShipmentWhereInput = {
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

  async findOneShipment(id: number) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: SHIPMENT_DETAIL_INCLUDE,
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment ${id} not found`);
    }
    return shipment;
  }

  private async getShipmentOrThrow(id: number) {
    const shipment = await this.prisma.shipment.findUnique({ where: { id } });
    if (!shipment) {
      throw new NotFoundException(`Shipment ${id} not found`);
    }
    return shipment;
  }

  async assignShipment(id: number, dto: AssignShipmentDto, adminId: number) {
    const shipment = await this.getShipmentOrThrow(id);

    if (shipment.delivery_type !== DeliveryType.same_day) {
      throw new BadRequestException(
        `Shipment ${id} is a "${shipment.delivery_type}" delivery — only same_day shipments are assigned to a local delivery person; normal deliveries are handled by the external Shadowfax courier.`,
      );
    }

    if (TERMINAL_SHIPMENT_STATUSES.has(shipment.status)) {
      throw new BadRequestException(`Cannot assign a delivery person to shipment ${id} — it is already "${shipment.status}".`);
    }

    const person = await this.prisma.deliveryPerson.findUnique({ where: { id: dto.delivery_person_id } });
    if (!person) {
      throw new NotFoundException(`Delivery person ${dto.delivery_person_id} not found`);
    }
    if (!person.is_active) {
      throw new BadRequestException(`Delivery person ${person.id} (${person.name}) is deactivated and cannot be assigned shipments.`);
    }
    if (!person.is_available) {
      throw new BadRequestException(`Delivery person ${person.id} (${person.name}) is currently marked unavailable.`);
    }

    const updated = await this.prisma.shipment.update({
      where: { id },
      data: { delivery_person_id: person.id, status: ShipmentStatus.assigned },
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

  /**
   * Force-updates a shipment's status for edge cases. Enforces two business rules
   * that can't be expressed via decorators alone:
   *  - status='delivery_failed' requires failed_reason and increments delivery_attempts,
   *    rejecting the update outright if that would exceed the cap for this shipment's
   *    delivery_type (1 for same_day, 3 for normal) — the caller must reassign to a
   *    different delivery person or mark it returned_to_seller instead.
   *  - status='delivered' stamps actual_delivered_at.
   */
  async updateShipmentStatus(id: number, dto: UpdateShipmentStatusDto, adminId: number) {
    const shipment = await this.getShipmentOrThrow(id);

    const data: Prisma.ShipmentUpdateInput = { status: dto.status };

    if (dto.status === ShipmentStatus.delivery_failed) {
      if (!dto.failed_reason || !dto.failed_reason.trim()) {
        throw new BadRequestException('failed_reason is required when setting status to "delivery_failed"');
      }

      const cap = DELIVERY_ATTEMPT_CAP[shipment.delivery_type];
      const nextAttempts = shipment.delivery_attempts + 1;
      if (nextAttempts > cap) {
        throw new BadRequestException(
          `Delivery attempt cap reached: "${shipment.delivery_type}" shipments allow at most ${cap} attempt(s) and this shipment already has ${shipment.delivery_attempts}. Reassign it to a different delivery person or mark it "returned_to_seller" instead of recording another failed attempt.`,
        );
      }

      data.delivery_attempts = nextAttempts;
      data.last_attempt_at = new Date();
      data.failed_reason = dto.failed_reason;
    } else if (dto.status === ShipmentStatus.delivered) {
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

  /**
   * Thin view over the shipment's own attempt-tracking fields — the schema has no
   * separate delivery-attempts table, so this is not a new model, just a focused read.
   */
  async getShipmentAttempts(id: number) {
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
      throw new NotFoundException(`Shipment ${id} not found`);
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
}
