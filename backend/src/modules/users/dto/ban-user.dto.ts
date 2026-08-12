import { IsNotEmpty, IsString } from 'class-validator';

export class BanUserDto {
  @IsString()
  @IsNotEmpty()
  ban_reason!: string;
}
