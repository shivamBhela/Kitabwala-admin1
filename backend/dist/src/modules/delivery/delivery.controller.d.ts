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
        data: ({
            user: {
                id: number;
                user_code: string;
                phone: string | null;
                email: string | null;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            created_at: Date;
            id: number;
            name: string;
            user_id: number;
            phone: string;
            is_active: boolean;
            updated_at: Date;
            photo: string | null;
            vehicle_type: string | null;
            vehicle_number: string | null;
            last_location_lat: import("@prisma/client/runtime/library").Decimal | null;
            last_location_lng: import("@prisma/client/runtime/library").Decimal | null;
            last_location_update: Date | null;
            is_available: boolean;
            salary_per_month: import("@prisma/client/runtime/library").Decimal | null;
            per_delivery_charge: import("@prisma/client/runtime/library").Decimal | null;
            per_km_charge: import("@prisma/client/runtime/library").Decimal | null;
            joined_at: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createPerson(dto: CreateDeliveryPersonDto, user: AuthenticatedUser): Promise<{
        user: {
            id: number;
            user_code: string;
            phone: string | null;
            email: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        created_at: Date;
        id: number;
        name: string;
        user_id: number;
        phone: string;
        is_active: boolean;
        updated_at: Date;
        photo: string | null;
        vehicle_type: string | null;
        vehicle_number: string | null;
        last_location_lat: import("@prisma/client/runtime/library").Decimal | null;
        last_location_lng: import("@prisma/client/runtime/library").Decimal | null;
        last_location_update: Date | null;
        is_available: boolean;
        salary_per_month: import("@prisma/client/runtime/library").Decimal | null;
        per_delivery_charge: import("@prisma/client/runtime/library").Decimal | null;
        per_km_charge: import("@prisma/client/runtime/library").Decimal | null;
        joined_at: Date;
    }>;
    updatePerson(id: number, dto: UpdateDeliveryPersonDto, user: AuthenticatedUser): Promise<{
        user: {
            id: number;
            user_code: string;
            phone: string | null;
            email: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        created_at: Date;
        id: number;
        name: string;
        user_id: number;
        phone: string;
        is_active: boolean;
        updated_at: Date;
        photo: string | null;
        vehicle_type: string | null;
        vehicle_number: string | null;
        last_location_lat: import("@prisma/client/runtime/library").Decimal | null;
        last_location_lng: import("@prisma/client/runtime/library").Decimal | null;
        last_location_update: Date | null;
        is_available: boolean;
        salary_per_month: import("@prisma/client/runtime/library").Decimal | null;
        per_delivery_charge: import("@prisma/client/runtime/library").Decimal | null;
        per_km_charge: import("@prisma/client/runtime/library").Decimal | null;
        joined_at: Date;
    }>;
    deactivatePerson(id: number, user: AuthenticatedUser): Promise<{
        user: {
            id: number;
            user_code: string;
            phone: string | null;
            email: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        created_at: Date;
        id: number;
        name: string;
        user_id: number;
        phone: string;
        is_active: boolean;
        updated_at: Date;
        photo: string | null;
        vehicle_type: string | null;
        vehicle_number: string | null;
        last_location_lat: import("@prisma/client/runtime/library").Decimal | null;
        last_location_lng: import("@prisma/client/runtime/library").Decimal | null;
        last_location_update: Date | null;
        is_available: boolean;
        salary_per_month: import("@prisma/client/runtime/library").Decimal | null;
        per_delivery_charge: import("@prisma/client/runtime/library").Decimal | null;
        per_km_charge: import("@prisma/client/runtime/library").Decimal | null;
        joined_at: Date;
    }>;
    findAllShipments(query: ListShipmentsQueryDto): Promise<{
        data: ({
            delivery_person: {
                id: number;
                name: string;
                phone: string;
            } | null;
            order: {
                id: number;
                order_number: string;
            };
        } & {
            created_at: Date;
            id: number;
            updated_at: Date;
            status: import("@prisma/client").$Enums.ShipmentStatus;
            delivery_type: import("@prisma/client").$Enums.DeliveryType;
            order_id: number;
            delivery_person_id: number | null;
            tracking_id: string | null;
            shadowfax_order_id: string | null;
            pickup_otp: string | null;
            delivery_otp: string | null;
            otp_verified_at: Date | null;
            estimated_delivery_date: Date | null;
            actual_delivered_at: Date | null;
            delivery_photo_url: string | null;
            delivery_attempts: number;
            last_attempt_at: Date | null;
            failed_reason: string | null;
            rescheduled_for: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneShipment(id: number): Promise<{
        delivery_person: {
            created_at: Date;
            id: number;
            name: string;
            user_id: number;
            phone: string;
            is_active: boolean;
            updated_at: Date;
            photo: string | null;
            vehicle_type: string | null;
            vehicle_number: string | null;
            last_location_lat: import("@prisma/client/runtime/library").Decimal | null;
            last_location_lng: import("@prisma/client/runtime/library").Decimal | null;
            last_location_update: Date | null;
            is_available: boolean;
            salary_per_month: import("@prisma/client/runtime/library").Decimal | null;
            per_delivery_charge: import("@prisma/client/runtime/library").Decimal | null;
            per_km_charge: import("@prisma/client/runtime/library").Decimal | null;
            joined_at: Date;
        } | null;
        order: {
            city: {
                id: number;
                name: string;
            } | null;
            pincode: string | null;
            id: number;
            total: import("@prisma/client/runtime/library").Decimal;
            order_number: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            payment_status: import("@prisma/client").$Enums.PaymentStatus;
            delivery_type: import("@prisma/client").$Enums.DeliveryType;
        };
    } & {
        created_at: Date;
        id: number;
        updated_at: Date;
        status: import("@prisma/client").$Enums.ShipmentStatus;
        delivery_type: import("@prisma/client").$Enums.DeliveryType;
        order_id: number;
        delivery_person_id: number | null;
        tracking_id: string | null;
        shadowfax_order_id: string | null;
        pickup_otp: string | null;
        delivery_otp: string | null;
        otp_verified_at: Date | null;
        estimated_delivery_date: Date | null;
        actual_delivered_at: Date | null;
        delivery_photo_url: string | null;
        delivery_attempts: number;
        last_attempt_at: Date | null;
        failed_reason: string | null;
        rescheduled_for: Date | null;
    }>;
    assignShipment(id: number, dto: AssignShipmentDto, user: AuthenticatedUser): Promise<{
        delivery_person: {
            created_at: Date;
            id: number;
            name: string;
            user_id: number;
            phone: string;
            is_active: boolean;
            updated_at: Date;
            photo: string | null;
            vehicle_type: string | null;
            vehicle_number: string | null;
            last_location_lat: import("@prisma/client/runtime/library").Decimal | null;
            last_location_lng: import("@prisma/client/runtime/library").Decimal | null;
            last_location_update: Date | null;
            is_available: boolean;
            salary_per_month: import("@prisma/client/runtime/library").Decimal | null;
            per_delivery_charge: import("@prisma/client/runtime/library").Decimal | null;
            per_km_charge: import("@prisma/client/runtime/library").Decimal | null;
            joined_at: Date;
        } | null;
        order: {
            city: {
                id: number;
                name: string;
            } | null;
            pincode: string | null;
            id: number;
            total: import("@prisma/client/runtime/library").Decimal;
            order_number: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            payment_status: import("@prisma/client").$Enums.PaymentStatus;
            delivery_type: import("@prisma/client").$Enums.DeliveryType;
        };
    } & {
        created_at: Date;
        id: number;
        updated_at: Date;
        status: import("@prisma/client").$Enums.ShipmentStatus;
        delivery_type: import("@prisma/client").$Enums.DeliveryType;
        order_id: number;
        delivery_person_id: number | null;
        tracking_id: string | null;
        shadowfax_order_id: string | null;
        pickup_otp: string | null;
        delivery_otp: string | null;
        otp_verified_at: Date | null;
        estimated_delivery_date: Date | null;
        actual_delivered_at: Date | null;
        delivery_photo_url: string | null;
        delivery_attempts: number;
        last_attempt_at: Date | null;
        failed_reason: string | null;
        rescheduled_for: Date | null;
    }>;
    updateShipmentStatus(id: number, dto: UpdateShipmentStatusDto, user: AuthenticatedUser): Promise<{
        delivery_person: {
            created_at: Date;
            id: number;
            name: string;
            user_id: number;
            phone: string;
            is_active: boolean;
            updated_at: Date;
            photo: string | null;
            vehicle_type: string | null;
            vehicle_number: string | null;
            last_location_lat: import("@prisma/client/runtime/library").Decimal | null;
            last_location_lng: import("@prisma/client/runtime/library").Decimal | null;
            last_location_update: Date | null;
            is_available: boolean;
            salary_per_month: import("@prisma/client/runtime/library").Decimal | null;
            per_delivery_charge: import("@prisma/client/runtime/library").Decimal | null;
            per_km_charge: import("@prisma/client/runtime/library").Decimal | null;
            joined_at: Date;
        } | null;
        order: {
            city: {
                id: number;
                name: string;
            } | null;
            pincode: string | null;
            id: number;
            total: import("@prisma/client/runtime/library").Decimal;
            order_number: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            payment_status: import("@prisma/client").$Enums.PaymentStatus;
            delivery_type: import("@prisma/client").$Enums.DeliveryType;
        };
    } & {
        created_at: Date;
        id: number;
        updated_at: Date;
        status: import("@prisma/client").$Enums.ShipmentStatus;
        delivery_type: import("@prisma/client").$Enums.DeliveryType;
        order_id: number;
        delivery_person_id: number | null;
        tracking_id: string | null;
        shadowfax_order_id: string | null;
        pickup_otp: string | null;
        delivery_otp: string | null;
        otp_verified_at: Date | null;
        estimated_delivery_date: Date | null;
        actual_delivered_at: Date | null;
        delivery_photo_url: string | null;
        delivery_attempts: number;
        last_attempt_at: Date | null;
        failed_reason: string | null;
        rescheduled_for: Date | null;
    }>;
    getShipmentAttempts(id: number): Promise<{
        shipment_id: number;
        delivery_type: import("@prisma/client").$Enums.DeliveryType;
        max_attempts: number;
        delivery_attempts: number;
        last_attempt_at: Date | null;
        failed_reason: string | null;
        rescheduled_for: Date | null;
    }>;
}
