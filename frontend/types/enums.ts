/**
 * enums.ts
 * All 30 database enums from the Kitabwalah schema, typed as TypeScript
 * const objects + inferred union types. Single source of truth for enum values.
 */

// ─── User & Auth ─────────────────────────────────────────────────────────────

export const UserRole = {
  CUSTOMER: "customer",
  VENDOR: "vendor",
  ADMIN: "admin",
  DELIVERY_PERSON: "delivery_person",
  RESELLER: "reseller",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AuthProvider = {
  PHONE: "phone",
  GOOGLE: "google",
  EMAIL: "email",
} as const;
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];

export const OtpPurpose = {
  PHONE_LOGIN: "phone_login",
  EMAIL_VERIFY: "email_verify",
  PHONE_VERIFY: "phone_verify",
} as const;
export type OtpPurpose = (typeof OtpPurpose)[keyof typeof OtpPurpose];

export const DevicePlatform = {
  ANDROID: "android",
  IOS: "ios",
  WEB: "web",
} as const;
export type DevicePlatform = (typeof DevicePlatform)[keyof typeof DevicePlatform];

// ─── Product ──────────────────────────────────────────────────────────────────

export const ProductStatus = {
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  ACTIVE: "active",
  INACTIVE: "inactive",
  REJECTED: "rejected",
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const BookCondition = {
  NEW_CONDITION: "new_condition",
  LIKE_NEW: "like_new",
  GOOD: "good",
  ACCEPTABLE: "acceptable",
  POOR: "poor",
} as const;
export type BookCondition = (typeof BookCondition)[keyof typeof BookCondition];

export const BookFormat = {
  PHYSICAL: "physical",
  AUDIO: "audio",
  EBOOK: "ebook",
} as const;
export type BookFormat = (typeof BookFormat)[keyof typeof BookFormat];

// ─── Order ────────────────────────────────────────────────────────────────────

export const OrderStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURN_REQUESTED: "return_requested",
  RETURNED: "returned",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderItemStatus = {
  ACTIVE: "active",
  RETURN_REQUESTED: "return_requested",
  RETURNED: "returned",
  CANCELLED: "cancelled",
} as const;
export type OrderItemStatus = (typeof OrderItemStatus)[keyof typeof OrderItemStatus];

export const PaymentStatus = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  RAZORPAY: "razorpay",
  CASHFREE: "cashfree",
  COD: "cod",
  WALLET: "wallet",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const DeliveryType = {
  SAME_DAY: "same_day",
  NORMAL: "normal",
} as const;
export type DeliveryType = (typeof DeliveryType)[keyof typeof DeliveryType];

// ─── Delivery & Shipping ──────────────────────────────────────────────────────

export const ShipmentStatus = {
  PENDING: "pending",
  ASSIGNED: "assigned",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  DELIVERY_FAILED: "delivery_failed",
  RETURNED_TO_SELLER: "returned_to_seller",
} as const;
export type ShipmentStatus = (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

export const DeliveryZone = {
  LOCAL: "local",
  REST_BIHAR: "rest_bihar",
  SOUTH_INDIA: "south_india",
  REST_INDIA: "rest_india",
} as const;
export type DeliveryZone = (typeof DeliveryZone)[keyof typeof DeliveryZone];

export const CodType = {
  FULL_COD: "full_cod",
  PARTIAL_COD: "partial_cod",
  PREPAID_ONLY: "prepaid_only",
} as const;
export type CodType = (typeof CodType)[keyof typeof CodType];

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const WalletTransactionType = {
  CREDIT: "credit",
  DEBIT: "debit",
} as const;
export type WalletTransactionType = (typeof WalletTransactionType)[keyof typeof WalletTransactionType];

export const WalletTransactionSource = {
  ORDER_PAYMENT: "order_payment",
  ORDER_REFUND: "order_refund",
  REFERRAL_REWARD: "referral_reward",
  RESELLER_COMMISSION: "reseller_commission",
  TOP_UP: "top_up",
  WITHDRAWAL_REVERSAL: "withdrawal_reversal",
  ADMIN_CREDIT: "admin_credit",
  ADMIN_DEBIT: "admin_debit",
} as const;
export type WalletTransactionSource = (typeof WalletTransactionSource)[keyof typeof WalletTransactionSource];

// ─── Vendor ───────────────────────────────────────────────────────────────────

export const WithdrawalStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  PROCESSING: "processing",
  COMPLETED: "completed",
  REJECTED: "rejected",
} as const;
export type WithdrawalStatus = (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus];

export const VendorSettlementStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;
export type VendorSettlementStatus = (typeof VendorSettlementStatus)[keyof typeof VendorSettlementStatus];

// ─── Returns ──────────────────────────────────────────────────────────────────

export const ReturnReason = {
  WRONG_ITEM: "wrong_item",
  DAMAGED_IN_TRANSIT: "damaged_in_transit",
  NOT_AS_DESCRIBED: "not_as_described",
  MISSING_PAGES: "missing_pages",
  OTHER: "other",
} as const;
export type ReturnReason = (typeof ReturnReason)[keyof typeof ReturnReason];

export const ReturnRequestStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PICKUP_SCHEDULED: "pickup_scheduled",
  PICKED_UP: "picked_up",
  REFUND_INITIATED: "refund_initiated",
  COMPLETED: "completed",
} as const;
export type ReturnRequestStatus = (typeof ReturnRequestStatus)[keyof typeof ReturnRequestStatus];

export const RefundMethod = {
  ORIGINAL_PAYMENT: "original_payment",
  WALLET: "wallet",
} as const;
export type RefundMethod = (typeof RefundMethod)[keyof typeof RefundMethod];

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const CouponType = {
  PERCENTAGE: "percentage",
  FIXED_AMOUNT: "fixed_amount",
} as const;
export type CouponType = (typeof CouponType)[keyof typeof CouponType];

// ─── Notifications ────────────────────────────────────────────────────────────

export const NotificationType = {
  ORDER_PLACED: "order_placed",
  ORDER_CONFIRMED: "order_confirmed",
  ORDER_SHIPPED: "order_shipped",
  ORDER_DELIVERED: "order_delivered",
  ORDER_CANCELLED: "order_cancelled",
  PAYMENT_RECEIVED: "payment_received",
  REVIEW_POSTED: "review_posted",
  PROMOTIONAL: "promotional",
  SYSTEM: "system",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// ─── Support ──────────────────────────────────────────────────────────────────

export const SupportTicketStatus = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;
export type SupportTicketStatus = (typeof SupportTicketStatus)[keyof typeof SupportTicketStatus];

export const IssueCategory = {
  DELIVERY: "delivery",
  PAYMENT: "payment",
  PRODUCT: "product",
  ACCOUNT: "account",
  OTHER: "other",
} as const;
export type IssueCategory = (typeof IssueCategory)[keyof typeof IssueCategory];

// ─── Migrations ───────────────────────────────────────────────────────────────

export const MigrationStatus = {
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;
export type MigrationStatus = (typeof MigrationStatus)[keyof typeof MigrationStatus];

// ─── Homepage & Banners ───────────────────────────────────────────────────────

export const HomepinType = {
  PRODUCT: "product",
  CATEGORY: "category",
  BANNER: "banner",
} as const;
export type HomepinType = (typeof HomepinType)[keyof typeof HomepinType];

export const BannerActionType = {
  PRODUCT: "product",
  CATEGORY: "category",
  URL: "url",
  NONE: "none",
} as const;
export type BannerActionType = (typeof BannerActionType)[keyof typeof BannerActionType];

// ─── Admin Audit ──────────────────────────────────────────────────────────────

export const AdminActionType = {
  USER_BAN: "user_ban",
  USER_UNBAN: "user_unban",
  PRODUCT_APPROVE: "product_approve",
  PRODUCT_REJECT: "product_reject",
  VENDOR_VERIFY: "vendor_verify",
  VENDOR_SUSPEND: "vendor_suspend",
  ORDER_REFUND: "order_refund",
  WITHDRAWAL_APPROVE: "withdrawal_approve",
  WITHDRAWAL_REJECT: "withdrawal_reject",
  COUPON_CREATE: "coupon_create",
  COUPON_DEACTIVATE: "coupon_deactivate",
  BANNER_UPDATE: "banner_update",
  PINCODE_UPDATE: "pincode_update",
  SETTINGS_UPDATE: "settings_update",
} as const;
export type AdminActionType = (typeof AdminActionType)[keyof typeof AdminActionType];
