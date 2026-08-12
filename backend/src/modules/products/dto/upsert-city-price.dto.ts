import { IsNumber, IsPositive } from 'class-validator';

export class UpsertCityPriceDto {
  @IsNumber()
  @IsPositive()
  price!: number;
}
