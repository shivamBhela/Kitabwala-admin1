import { ArrayMinSize, ArrayUnique, IsArray, IsInt } from 'class-validator';

export class BulkProductIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  ids!: number[];
}
