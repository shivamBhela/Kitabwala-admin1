import { CodType, DeliveryZone } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// All fields optional for a partial update. Written by hand (rather than via
// PartialType) since @nestjs/mapped-types isn't a dependency of this project.
export class UpdatePincodeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  pincode?: string;

  @IsOptional()
  @IsInt()
  city_id?: number;

  @IsOptional()
  @IsEnum(DeliveryZone)
  delivery_zone?: DeliveryZone;

  @IsOptional()
  @IsEnum(CodType)
  cod_type?: CodType;

  // Required together with an effective cod_type of 'partial_cod' — enforced in the
  // service since that cross-field rule can't be expressed with decorators alone.
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
