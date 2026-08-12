import { IsISO8601 } from 'class-validator';

export class FeatureProductDto {
  /** Must be a future timestamp — enforced in the service (a cross-field-with-"now" rule
   *  that class-validator decorators alone can't express). */
  @IsISO8601()
  featured_until!: string;
}
