import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import {
  DeliveryType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';

export class ListOrdersQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @IsOptional()
  @IsEnum(DeliveryType)
  delivery_type?: DeliveryType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  city_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vendor_id?: number;

  /** Inclusive lower bound on order.created_at (ISO date/date-time string). */
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  /** Inclusive upper bound on order.created_at (ISO date/date-time string). */
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  /** Matches order_number, or the related user's display_name/phone/email. */
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
