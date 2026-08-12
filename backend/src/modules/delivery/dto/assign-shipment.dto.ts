import { IsInt } from 'class-validator';

export class AssignShipmentDto {
  @IsInt()
  delivery_person_id!: number;
}
