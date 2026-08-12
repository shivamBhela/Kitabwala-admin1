import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RejectWithdrawalDto {
  /** Reason shown to the vendor and stored on the withdrawal record — always required. */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/\S/, { message: 'admin_note must not be blank' })
  admin_note!: string;
}
