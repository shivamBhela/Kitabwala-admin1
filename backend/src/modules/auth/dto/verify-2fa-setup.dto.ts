import { IsNotEmpty, IsString } from 'class-validator';

export class Verify2FASetupDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
