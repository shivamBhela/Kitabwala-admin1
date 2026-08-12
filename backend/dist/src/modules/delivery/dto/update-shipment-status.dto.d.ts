import { ShipmentStatus } from '@prisma/client';
export declare class UpdateShipmentStatusDto {
    status: ShipmentStatus;
    failed_reason?: string;
}
