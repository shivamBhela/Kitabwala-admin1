import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ReturnReason, ReturnRequestStatus } from '@prisma/client';

export class ListReturnsQueryDto {
  @IsOptional()
  @IsEnum(ReturnRequestStatus)
  status?: ReturnRequestStatus;

  @IsOptional()
  @IsEnum(ReturnReason)
  reason?: ReturnReason;

  /** Filters on the return request's created_at (when the customer filed it), inclusive. */
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  /** Inclusive of the whole calendar day when only a date (no time) is supplied. */
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  /** order_item.vendor_id — ReturnRequest has no vendor_id of its own. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vendor_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}
