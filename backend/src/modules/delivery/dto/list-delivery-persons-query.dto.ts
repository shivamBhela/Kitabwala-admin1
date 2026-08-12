import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

/** Query strings arrive as raw strings — normalize "true"/"false" to booleans before @IsBoolean runs. */
function toBoolean({ value }: { value: unknown }): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

export class ListDeliveryPersonsQueryDto {
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  is_available?: boolean;

  /** Matches against name or phone. */
  @IsOptional()
  @IsString()
  search?: string;

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
