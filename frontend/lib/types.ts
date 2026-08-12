export type UserRole = 'customer' | 'vendor' | 'admin' | 'delivery_person' | 'reseller';

export type ProductStatus = 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected';
export type BookCondition = 'new_condition' | 'like_new' | 'good' | 'acceptable' | 'poor';
export type BookFormat = 'physical' | 'audio' | 'ebook';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';

export type OrderItemStatus = 'active' | 'return_requested' | 'returned' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type DeliveryType = 'same_day' | 'normal';
export type PaymentMethod = 'razorpay' | 'cashfree' | 'cod' | 'wallet';

export type ShipmentStatus =
  | 'pending'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed'
  | 'returned_to_seller';

export type WithdrawalStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
export type CouponType = 'percentage' | 'fixed_amount';
export type NotificationType =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_received'
  | 'review_posted'
  | 'promotional'
  | 'system';

export type ReturnReason =
  | 'wrong_item'
  | 'damaged_in_transit'
  | 'not_as_described'
  | 'missing_pages'
  | 'other';

export type ReturnRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'refund_initiated'
  | 'completed';

export type RefundMethod = 'original_payment' | 'wallet';
export type DeliveryZone = 'local' | 'rest_bihar' | 'south_india' | 'rest_india';
export type CodType = 'full_cod' | 'partial_cod' | 'prepaid_only';

export type WalletTransactionType = 'credit' | 'debit';
export type WalletTransactionSource =
  | 'order_payment'
  | 'order_refund'
  | 'referral_reward'
  | 'reseller_commission'
  | 'top_up'
  | 'withdrawal_reversal'
  | 'admin_credit'
  | 'admin_debit';

export type VendorSettlementStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IssueCategory = 'delivery' | 'payment' | 'product' | 'account' | 'other';
export type MigrationStatus = 'running' | 'completed' | 'failed';
export type HomepinType = 'product' | 'category' | 'banner';
export type BannerActionType = 'product' | 'category' | 'url' | 'none';

export type AdminActionType =
  | 'user_ban'
  | 'user_unban'
  | 'product_approve'
  | 'product_reject'
  | 'vendor_verify'
  | 'vendor_suspend'
  | 'order_refund'
  | 'withdrawal_approve'
  | 'withdrawal_reject'
  | 'coupon_create'
  | 'coupon_deactivate'
  | 'banner_update'
  | 'pincode_update'
  | 'settings_update';

// Main Models
export interface User {
  id: string;
  wp_id?: number;
  phone: string;
  email: string;
  display_name: string;
  role: UserRole;
  wallet_balance: number;
  is_active: boolean;
  is_banned: boolean;
  ban_reason?: string;
  is_migrated: boolean;
  migration_login_done: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface VendorProfile {
  id: string;
  user_id: string;
  store_name: string;
  store_slug: string;
  gstin?: string;
  commission_rate: number; // default 10%
  total_earnings: number;
  total_withdrawn: number;
  pending_balance: number;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
  kyc_form_data: {
    pan_number?: string;
    aadhaar_last4?: string;
    business_type?: string;
    address?: string;
    bank_account?: string;
    ifsc?: string;
  };
  vacation_mode: boolean;
  is_active: boolean;
  user?: User;
}

export interface Category {
  id: string;
  wp_id?: number;
  name: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  subcategories?: Category[];
}

export interface City {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface Pincode {
  id: string;
  pincode: string;
  city_id: string;
  city_name?: string;
  delivery_zone: DeliveryZone;
  cod_type: CodType;
  partial_cod_amount: number;
  is_same_day_eligible: boolean;
  is_delivery_available: boolean;
}

export interface Product {
  id: string;
  wp_id?: number;
  vendor_id: string;
  vendor_name?: string;
  title: string;
  slug: string;
  regular_price: number;
  sale_price?: number;
  gst_rate: number;
  hsn_code: string;
  sku: string;
  isbn?: string;
  author?: string;
  book_format: BookFormat;
  condition: BookCondition;
  stock_quantity: number;
  status: ProductStatus;
  approved_by_id?: string;
  approved_at?: string;
  rejection_reason?: string;
  featured_until?: string;
  category_name?: string;
  images: string[];
  city_prices?: Record<string, number>;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  vendor_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  gst_rate: number;
  gst_amount: number;
  status: OrderItemStatus;
}

export interface OrderAddress {
  order_id: string;
  address_type: 'billing' | 'shipping';
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name?: string;
  customer_phone?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: number;
  shipping_amount: number;
  cod_charge: number;
  discount_amount: number;
  gst_amount: number;
  total: number;
  is_cod: boolean;
  delivery_type: DeliveryType;
  pincode: string;
  city?: string;
  invoice_number?: string;
  razorpay_payment_id?: string;
  delivered_at?: string;
  refund_amount?: number;
  created_at: string;
  items: OrderItem[];
  shipping_address?: OrderAddress;
}

export interface DeliveryPerson {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  last_location_lat: number;
  last_location_lng: number;
  is_available: boolean;
  is_active: boolean;
  salary_per_month: number;
  current_assigned_orders?: number;
}

export interface Shipment {
  id: string;
  order_id: string;
  order_number?: string;
  delivery_person_id?: string;
  delivery_person_name?: string;
  delivery_type: DeliveryType;
  status: ShipmentStatus;
  tracking_id?: string;
  shadowfax_order_id?: string;
  delivery_otp?: string;
  estimated_delivery_date?: string;
  actual_delivered_at?: string;
  delivery_photo_url?: string;
  delivery_attempts: number;
  failed_reason?: string;
  destination_city?: string;
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  order_number: string;
  order_item_id: string;
  product_name: string;
  user_id: string;
  user_name: string;
  reason: ReturnReason;
  reason_description: string;
  proof_images: string[];
  status: ReturnRequestStatus;
  refund_amount: number;
  refund_method?: RefundMethod;
  admin_note?: string;
  reviewed_by_id?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  wp_id?: number;
  vendor_id: string;
  vendor_name: string;
  store_name: string;
  amount: number;
  status: WithdrawalStatus;
  requested_at: string;
  processed_at?: string;
  admin_note?: string;
  payment_reference?: string;
  bank_details?: {
    account_number: string;
    ifsc: string;
    upi_id?: string;
  };
}

export interface Coupon {
  id: string;
  wp_id?: number;
  code: string;
  type: CouponType;
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  is_birthday_coupon: boolean;
  is_first_order_only: boolean;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  action_type: BannerActionType;
  action_value?: string;
  display_order: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export interface HomepagePin {
  id: string;
  type: HomepinType;
  reference_id: string;
  title: string;
  position: number;
  is_active: boolean;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  wp_id?: number;
  product_id: string;
  product_name: string;
  user_id: string;
  user_name: string;
  vendor_id: string;
  vendor_name: string;
  order_id?: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  is_verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface SupportTicket {
  id: string;
  wp_id?: number;
  user_id: string;
  user_name: string;
  user_role: 'customer' | 'vendor';
  vendor_id?: string;
  order_id?: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  resolution_note?: string;
  created_at: string;
}

export interface IssueReport {
  id: string;
  user_id: string;
  user_name: string;
  order_id?: string;
  category: IssueCategory;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolution_note?: string;
  created_at: string;
}

export interface CompetitiveExam {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  linked_products_count: number;
}

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

export interface PushNotificationLog {
  id: string;
  user_id?: string;
  target_group: 'all' | 'vendors' | 'city' | 'single_user';
  target_city?: string;
  title: string;
  body: string;
  data_payload?: string;
  sent_count: number;
  sent_at: string;
}

export interface AdminActionLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action_type: AdminActionType;
  target_table: string;
  target_id: string;
  description: string;
  old_data?: string;
  new_data?: string;
  created_at: string;
}

export interface EmailLog {
  id: string;
  to_email: string;
  subject: string;
  message: string;
  status: 'sent' | 'failed' | 'queued';
  sent_at: string;
}

export interface MigrationLog {
  id: string;
  source_db: string;
  source_table: string;
  destination_table: string;
  records_migrated: number;
  records_failed: number;
  records_skipped: number;
  status: MigrationStatus;
  error_log?: string;
  started_at: string;
  completed_at: string;
}
