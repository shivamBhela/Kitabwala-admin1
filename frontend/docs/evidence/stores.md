# Stores — Kitabwalah Admin Portal

## 1. Admin Domain Store (lib/store.tsx)

| Property | Value |
|----------|-------|
| File | lib/store.tsx |
| Pattern | React Context + useState (AdminStoreProvider / useAdminStore) |
| Exported | AdminStoreProvider, useAdminStore |

### State slices:
| Slice | Type | Description |
|-------|------|-------------|
| activeTab | string | Currently active admin section |
| users | User[] | All customer accounts |
| vendors | VendorProfile[] | All vendor profiles |
| products | Product[] | Product catalog |
| orders | Order[] | Order records |
| deliveryPersons | DeliveryPerson[] | Delivery agent list |
| shipments | Shipment[] | Shipment tracking records |
| returnRequests | ReturnRequest[] | Return/refund requests |
| withdrawalRequests | WithdrawalRequest[] | Vendor withdrawal queue |
| coupons | Coupon[] | Discount coupon list |
| banners | Banner[] | Homepage banners |
| homepagePins | HomepagePin[] | Pinned content |
| reviews | ProductReview[] | Product reviews |
| supportTickets | SupportTicket[] | Customer support tickets |
| issueReports | IssueReport[] | Reported issues |
| notifications | Notification[] | Push notification history |
| auditLogs | AuditLog[] | Admin audit trail |
| emailLogs | EmailLog[] | Email delivery records |
| migrationLogs | MigrationLog[] | DB migration history |
| cities | City[] | Serviceable cities |
| pincodes | Pincode[] | Serviceable pincodes |
| examCategories | ExamCategory[] | Exam categories |
| staticPages | StaticPage[] | CMS static pages |

### Mutation actions:
setActiveTab, updateOrderStatus, approveProduct, rejectProduct, approveVendor, suspendVendor, banUser, unbanUser, assignDelivery, approveReturn, rejectReturn, approveWithdrawal, rejectWithdrawal, createCoupon, deleteCoupon, updateBanner, approveReview, rejectReview, resolveTicket, resolveIssue, sendNotification, addAuditLog, updatePincode, updateCity, updateAppSettings

## 2. UI Store (store/useUIStore.ts)

| Property | Value |
|----------|-------|
| File | store/useUIStore.ts |
| Pattern | Zustand store |
| Exported | useUIStore |

### State slices:
| Slice | Type | Description |
|-------|------|-------------|
| sidebarOpen | boolean | Mobile sidebar open/closed |
| theme | 'light' or 'dark' | Current color theme |
| searchQuery | string | Global search query string |

### Actions:
toggleSidebar, setSidebarOpen, setTheme, setSearchQuery
