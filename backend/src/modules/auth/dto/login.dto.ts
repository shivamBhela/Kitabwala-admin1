import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier!: string; // phone or email

  @IsString()
  @IsNotEmpty()
  password!: string;
}
