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

/**
 * Admin-created product on behalf of a vendor. vendor_id, slug and sku (when supplied)
 * must all be caller-supplied and are never derived/generated here — see module rules on
 * not fabricating data. `status` is deliberately NOT settable here (every product is
 * always created as `pending_review`, in products.service.ts) — otherwise a caller could
 * create a product already `active`/`rejected` with no approved_by_id/approved_at/
 * rejection_reason and no audit_log entry, bypassing the approve/reject workflow entirely.
 * approved_by_id/approved_at/rejection_reason/featured_until are never settable here either —
 * they only ever change via the dedicated approve/reject/feature endpoints.
 */
export class CreateProductDto {
  @IsInt()
  vendor_id!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  short_description?: string;

  @IsNumber()
  @IsPositive()
  regular_price!: number;

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

  @IsEnum(BookFormat)
  book_format!: BookFormat;

  @IsEnum(BookCondition)
  condition!: BookCondition;

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

  // Category ids to attach via ProductCategory. Every id must already exist.
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  category_ids?: number[];
}
