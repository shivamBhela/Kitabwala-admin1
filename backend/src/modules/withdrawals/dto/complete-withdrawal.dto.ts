import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CompleteWithdrawalDto {
  /**
   * Real UTR / bank transfer reference the admin manually typed in after actually paying
   * the vendor outside this system (e.g. via NEFT/IMPS/UPI). This value must always come
   * from the admin — it must NEVER be auto-generated, defaulted, or fabricated anywhere in
   * this module (see WithdrawalsService.complete()).
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @Matches(/\S/, { message: 'payment_reference must not be blank' })
  payment_reference!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  admin_note?: string;
}
