import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { BookCondition, BookFormat } from '@prisma/client';

// All fields optional for a partial update. Written by hand (rather than via
// PartialType) since @nestjs/mapped-types isn't a dependency of this project.
//
// Deliberately excludes status, approved_by_id, approved_at, rejection_reason and
// featured_until — those only ever change via the dedicated approve/reject/feature/
// unfeature endpoints, which apply their own state-machine rules and audit trail. Because
// the global ValidationPipe runs with forbidNonWhitelisted, sending any of those fields
// here is rejected outright rather than silently accepted or silently ignored.
export class UpdateProductDto {
  @IsOptional()
  @IsInt()
  vendor_id?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  short_description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  regular_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sale_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  base_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gst_rate?: number;

  @IsOptional()
  @IsString()
  hsn_code?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  edition?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  pages?: number;

  @IsOptional()
  @IsString()
  binding?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsEnum(BookFormat)
  book_format?: BookFormat;

  @IsOptional()
  @IsEnum(BookCondition)
  condition?: BookCondition;

  @IsOptional()
  @IsString()
  condition_description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock_quantity?: number;

  @IsOptional()
  @IsBoolean()
  manage_stock?: boolean;

  @IsOptional()
  @IsBoolean()
  in_stock?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsObject()
  dimensions?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  meta_title?: string;

  @IsOptional()
  @IsString()
  meta_description?: string;

  // When provided, fully replaces the product's category assignments (including an empty
  // array, which detaches all categories). Every id must already exist.
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  category_ids?: number[];
}
