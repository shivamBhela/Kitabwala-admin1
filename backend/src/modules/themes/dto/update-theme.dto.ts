import { IsBoolean, IsISO8601, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateThemeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  colors?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsISO8601()
  valid_from?: string | null;

  @IsOptional()
  @IsISO8601()
  valid_until?: string | null;
}
