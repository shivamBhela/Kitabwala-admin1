import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

/** Loose IFSC check — real IFSC codes are 11 alphanumeric characters; not validated against a bank registry. */
const IFSC_REGEX = /^[A-Za-z0-9]{11}$/;

export class UpdateBankDetailsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  bank_account_number?: string;

  @IsOptional()
  @IsString()
  @Matches(IFSC_REGEX, { message: 'bank_ifsc must be a valid 11-character IFSC code' })
  bank_ifsc?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  bank_account_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  upi_id?: string;
}
