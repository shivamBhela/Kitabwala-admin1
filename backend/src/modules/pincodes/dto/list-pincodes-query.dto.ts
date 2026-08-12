import { DeliveryZone } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListPincodesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  city_id?: number;

  @IsOptional()
  @IsEnum(DeliveryZone)
  delivery_zone?: DeliveryZone;

  @IsOptional()
  @IsString()
  search?: string;
}
