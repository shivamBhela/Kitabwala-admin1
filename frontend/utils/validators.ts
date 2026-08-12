/**
 * utils/validators.ts
 * Base Zod schemas for shared form validation patterns.
 * Extended by module-level schemas — never duplicated.
 */

import { z } from "zod";

// ─── Primitives ───────────────────────────────────────────────────────────────

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const emailSchema = z.string().email("Enter a valid email address");

export const gstinSchema = z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    "Enter a valid GSTIN (e.g. 22AAAAA0000A1Z5)"
  );

export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter a valid PAN number");

export const ifscSchema = z
  .string()
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code");

export const pincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode");

export const urlSchema = z.string().url("Enter a valid URL").optional().or(z.literal(""));

// ─── Shared Field Schemas ─────────────────────────────────────────────────────

export const requiredString = z.string().min(1, "This field is required");

export const optionalString = z.string().optional();

export const positiveDecimal = z
  .string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Must be a non-negative number",
  });

export const positiveInt = z
  .number({ invalid_type_error: "Must be a number" })
  .int("Must be a whole number")
  .positive("Must be greater than 0");

export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

// ─── Pagination Schema ────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ─── Date Range Schema ────────────────────────────────────────────────────────

export const dateRangeSchema = z.object({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});
