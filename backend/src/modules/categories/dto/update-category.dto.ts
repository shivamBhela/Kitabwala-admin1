import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// All fields optional for a partial update. Written by hand (rather than via
// PartialType) since @nestjs/mapped-types isn't a dependency of this project.
export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // undefined = leave unchanged; null = detach to top-level; number = re-parent.
  // @IsOptional() treats both null and undefined as "not provided", so @IsInt() below
  // only runs when an actual number is sent.
  @IsOptional()
  @IsInt()
  parent_id?: number | null;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
