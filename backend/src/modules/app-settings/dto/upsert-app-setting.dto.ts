import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertAppSettingDto {
  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
