import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { RefundMethod } from '@prisma/client';

export class RefundOrderDto {
  /**
   * The refund amount requested by the admin. The service layer caps this at
   * (order.total - order.refund_amount already refunded) and rejects — never clamps —
   * anything over that remaining refundable amount.
   */
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsEnum(RefundMethod)
  method!: RefundMethod;

  @IsOptional()
  @IsString()
  reason?: string;
}
