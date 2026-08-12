import { CodType, DeliveryZone } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePincodeDto {
  @IsString()
  @IsNotEmpty()
  pincode!: string;

  @IsInt()
  city_id!: number;

  @IsEnum(DeliveryZone)
  delivery_zone!: DeliveryZone;

  // Defaults to full_cod in the service when omitted, matching the Prisma column default.
  @IsOptional()
  @IsEnum(CodType)
  cod_type?: CodType;

  // Required together with cod_type === 'partial_cod' — enforced in the service since
  // that cross-field rule can't be expressed with class-validator decorators alone.
  @IsOptional()
  @IsNumber()
  @Min(0)
  partial_cod_amount?: number;

  @IsOptional()
  @IsBoolean()
  is_same_day_eligible?: boolean;

  @IsOptional()
  @IsBoolean()
  is_delivery_available?: boolean;
}
