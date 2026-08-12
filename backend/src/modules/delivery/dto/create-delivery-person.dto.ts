import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDeliveryPersonDto {
  /**
   * Must reference an existing User row with role='delivery_person' — validated
   * in the service (cross-table check, not expressible via decorators alone).
   */
  @IsInt()
  user_id!: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsOptional()
  @IsString()
  vehicle_type?: string;

  @IsOptional()
  @IsString()
  vehicle_number?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary_per_month?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  per_delivery_charge?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  per_km_charge?: number;
}
