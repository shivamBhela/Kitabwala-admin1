import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApproveReturnDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  admin_note?: string;
}
