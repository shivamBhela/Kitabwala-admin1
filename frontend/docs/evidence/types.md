# TypeScript Types — Kitabwalah Admin Portal

## lib/types.ts — Domain Models and Type Aliases (52 exports)

### Union Type Aliases (enums-as-types)
- UserRole: 'customer' | 'vendor' | 'admin' | 'delivery_person' | 'reseller'
- ProductStatus: 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected'
- BookCondition: 'new_condition' | 'like_new' | 'good' | 'acceptable' | 'poor'
- BookFormat: 'physical' | 'audio' | 'ebook'
- OrderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_requested' | 'returned'
- OrderItemStatus: 'active' | 'return_requested' | 'returned' | 'cancelled'
- PaymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
- DeliveryType: 'same_day' | 'normal'
- PaymentMethod: 'razorpay' | 'cashfree' | 'cod' | 'wallet'
- ShipmentStatus: 7 variants
- WithdrawalStatus: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected'
- CouponType: 'percentage' | 'fixed_amount'
- NotificationType: 9 variants
- ReturnReason: 5 variants
- ReturnRequestStatus: 7 variants
- SupportTicketStatus: 'open' | 'in_progress' | 'resolved' | 'closed'
- SupportTicketPriority: 'low' | 'medium' | 'high' | 'urgent'
- DeliveryZone: 'zone_a' | 'zone_b' | 'zone_c' | 'zone_d'

### Interface / Object Types
- User — customer/vendor/admin account
- Address — shipping/billing address
- VendorProfile — vendor details, KYC, commission
- Category — book category tree
- City — serviceable city record
- Pincode — per-pincode delivery config
- Product — book product (all formats)
- OrderItem — line item within an order
- Order — full order record
- DeliveryPerson — delivery agent
- Shipment — package shipment record
- ReturnRequest — return/refund request
- WithdrawalRequest — vendor payout request
- Coupon — discount coupon
- Banner — homepage banner
- HomepagePin — pinned product/category
- ProductReview — customer review
- SupportTicket — customer support request
- IssueReport — bug/issue report
- Notification — push notification record
- AuditLog — admin action log entry
- EmailLog — email delivery record
- MigrationLog — DB migration record
- ExamCategory — competitive exam category
- StaticPage — CMS content page
- AppSettings — global application settings

## types/enums.ts — Duplicated/shared enum constants (string enums)

All the same values as lib/types.ts union aliases, exported as const enum objects for use in select/filter dropdowns.

## types/api.ts — API contract types

- ApiResponse<T> — standard { data, message, success }
- PaginatedResponse<T> — extends ApiResponse with { pagination: { page, pageSize, total, totalPages } }
- ApiError — { message, code, details? }
- LoginRequest — { email, password }
- LoginResponse — { user: User, token: string }

## types/index.ts — Barrel re-export

Re-exports all types from types/api.ts and types/enums.ts.
