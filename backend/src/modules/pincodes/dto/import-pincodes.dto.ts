import { IsNotEmpty, IsString } from 'class-validator';

// The CSV is sent as a raw string in the JSON body rather than a multipart file
// upload — multer/@types/multer aren't dependencies of this project, and adding
// one wasn't warranted for a simple flat CSV format. See pincodes.service.ts for
// the parser.
export class ImportPincodesDto {
  @IsString()
  @IsNotEmpty()
  csv!: string;
}
