import { IsOptional, IsString } from 'class-validator';

export class ListCitiesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
