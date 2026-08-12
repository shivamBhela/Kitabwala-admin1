import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { DeliveryType, ShipmentStatus } from '@prisma/client';

export class ListShipmentsQueryDto {
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  @IsOptional()
  @IsEnum(DeliveryType)
  delivery_type?: DeliveryType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  delivery_person_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit: number = 20;
}
