/**
 * constants/app.ts
 * Global application constants — single source of truth for app metadata.
 */

export const APP_NAME = "Kitabwalah Admin";
export const APP_DESCRIPTION = "Enterprise Admin Portal — admin.kitabwalah.com";
export const APP_VERSION = "0.1.0";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "kw_admin_token";

export const S3_BASE_URL =
  process.env.NEXT_PUBLIC_S3_BASE_URL ??
  "https://kitabwalah-media.s3.ap-south-1.amazonaws.com";

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// Platform business rules (from spec)
export const PLATFORM_COMMISSION_RATE = 10; // percent
export const COD_CHARGE = 7; // ₹
export const RETURN_WINDOW_DAYS = 7;
export const SAME_DAY_DELIVERY_ATTEMPTS = 1;
export const NORMAL_DELIVERY_ATTEMPTS = 3;
export const RESELLER_COMMISSION = 25; // ₹
export const LOW_STOCK_THRESHOLD = 5;

// Delivery zones & charges
export const DELIVERY_CHARGES = {
  local: 39,
  rest_bihar: 49,
  south_india: 59,
  rest_india: 59,
} as const;

export const FREE_DELIVERY_THRESHOLDS = {
  local: 500,
  rest_bihar: 599,
  south_india: 699,
  rest_india: 799,
} as const;

// Active coupons at launch
export const LAUNCH_COUPONS = [
  { code: "KITABWALAH", type: "percentage", value: 10, minOrder: null },
  { code: "NEW10", type: "percentage", value: 10, minOrder: 199 },
  { code: "BIRTHDAY10", type: "percentage", value: 10, maxDiscount: 50 },
  { code: "WELCOME30", type: "fixed_amount", value: 30, minOrder: 299 },
] as const;

// Date/Time
export const DATE_FORMAT = "dd MMM yyyy";
export const DATETIME_FORMAT = "dd MMM yyyy, hh:mm a";
export const API_DATE_FORMAT = "yyyy-MM-dd";
