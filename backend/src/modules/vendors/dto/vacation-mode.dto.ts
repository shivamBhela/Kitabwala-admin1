import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class VacationModeDto {
  @IsBoolean()
  vacation_mode!: boolean;

  @IsOptional()
  @IsString()
  vacation_message?: string;
}
