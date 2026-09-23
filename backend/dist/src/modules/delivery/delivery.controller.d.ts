import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { DeliveryService } from './delivery.service';
import { ListDeliveryPersonsQueryDto } from './dto/list-delivery-persons-query.dto';
import { CreateDeliveryPersonDto } from './dto/create-delivery-person.dto';
import { UpdateDeliveryPersonDto } from './dto/update-delivery-person.dto';
import { ListShipmentsQueryDto } from './dto/list-shipments-query.dto';
import { AssignShipmentDto } from './dto/assign-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
export declare class DeliveryController {
    private readonly deliveryService;
    constructor(deliveryService: DeliveryService);
    findAllPersons(query: ListDeliveryPersonsQueryDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createPerson(dto: CreateDeliveryPersonDto, user: AuthenticatedUser): Promise<any>;
    updatePerson(id: number, dto: UpdateDeliveryPersonDto, user: AuthenticatedUser): Promise<any>;
    deactivatePerson(id: number, user: AuthenticatedUser): Promise<any>;
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
    assignShipment(id: number, dto: AssignShipmentDto, user: AuthenticatedUser): Promise<any>;
    updateShipmentStatus(id: number, dto: UpdateShipmentStatusDto, user: AuthenticatedUser): Promise<any>;
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
