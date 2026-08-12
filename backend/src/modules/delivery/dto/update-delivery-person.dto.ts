import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// All fields optional for a partial update. Written by hand (rather than via
// PartialType) since @nestjs/mapped-types isn't a dependency of this project.
export class UpdateDeliveryPersonDto {
  /**
   * Re-links this delivery person row to a different User. Re-validated in the
   * service exactly like on create (must exist, must have role='delivery_person',
   * must not already be linked to another delivery person).
   */
  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;

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
