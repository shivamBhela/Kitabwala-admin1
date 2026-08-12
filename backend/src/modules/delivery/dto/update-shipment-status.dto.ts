import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ShipmentStatus } from '@prisma/client';

export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  status!: ShipmentStatus;

  /**
   * Required when status === 'delivery_failed' — enforced in the service since
   * that cross-field rule can't be expressed with decorators alone.
   */
  @IsOptional()
  @IsString()
  @MinLength(3)
  failed_reason?: string;
}
