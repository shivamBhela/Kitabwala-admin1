import { IsNotEmpty, IsString } from 'class-validator';

export class Verify2FALoginDto {
  @IsString()
  @IsNotEmpty()
  pendingToken!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}
