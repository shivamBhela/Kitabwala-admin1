import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RejectProductDto {
  /** Reason shown to the vendor and stored on the product record — always required. */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/\S/, { message: 'rejection_reason must not be blank' })
  rejection_reason!: string;
}
