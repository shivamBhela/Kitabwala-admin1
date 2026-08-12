import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { RefundMethod } from '@prisma/client';

export class RefundReturnDto {
  /**
   * Amount to refund for this return's order item. Must be caller-supplied — never
   * derived or defaulted here. The service caps it at the related order_item.total_price
   * and rejects anything above that cap rather than silently truncating it.
   */
  @IsNumber()
  @IsPositive()
  refund_amount!: number;

  @IsEnum(RefundMethod)
  refund_method!: RefundMethod;
}
