import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { ListDeliveryPersonsQueryDto } from './dto/list-delivery-persons-query.dto';
import type { CreateDeliveryPersonDto } from './dto/create-delivery-person.dto';
import type { UpdateDeliveryPersonDto } from './dto/update-delivery-person.dto';
import type { ListShipmentsQueryDto } from './dto/list-shipments-query.dto';
import type { AssignShipmentDto } from './dto/assign-shipment.dto';
import type { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
export declare class DeliveryService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    findAllPersons(query: ListDeliveryPersonsQueryDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    private validateLinkedUser;
    createPerson(dto: CreateDeliveryPersonDto, adminId: number): Promise<any>;
    private getPersonOrThrow;
    updatePerson(id: number, dto: UpdateDeliveryPersonDto, adminId: number): Promise<any>;
    deactivatePerson(id: number, adminId: number): Promise<any>;
    findAllShipments(query: ListShipmentsQueryDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneShipment(id: number): Promise<any>;
    private getShipmentOrThrow;
    assignShipment(id: number, dto: AssignShipmentDto, adminId: number): Promise<any>;
    updateShipmentStatus(id: number, dto: UpdateShipmentStatusDto, adminId: number): Promise<any>;
    getShipmentAttempts(id: number): Promise<{
        shipment_id: any;
        delivery_type: any;
        max_attempts: any;
        delivery_attempts: any;
        last_attempt_at: any;
        failed_reason: any;
        rescheduled_for: any;
    }>;
}
