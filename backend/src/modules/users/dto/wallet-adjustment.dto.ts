import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { WalletTransactionType } from '@prisma/client';

export class WalletAdjustmentDto {
  @IsEnum(WalletTransactionType)
  type!: WalletTransactionType;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
