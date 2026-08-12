import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { UserRole } from '@prisma/client';

/** Query strings arrive as raw strings — normalize "true"/"false" to booleans before @IsBoolean runs. */
function toBoolean({ value }: { value: unknown }): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

export class ListUsersQueryDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  is_banned?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  is_migrated?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  city_id?: number;

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
