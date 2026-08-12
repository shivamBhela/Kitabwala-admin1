import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RejectReturnDto {
  /** Reason shown to the customer and stored on the return request — always required. */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/\S/, { message: 'admin_note must not be blank' })
  admin_note!: string;
}
