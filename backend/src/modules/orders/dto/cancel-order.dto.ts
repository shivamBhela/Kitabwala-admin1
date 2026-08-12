import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CancelOrderDto {
  /** Always required — shown to the customer and stored verbatim on the order record. */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/\S/, { message: 'cancellation_reason must not be blank' })
  cancellation_reason!: string;
}
