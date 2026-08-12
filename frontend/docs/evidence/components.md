# Components — Kitabwalah Admin Portal

## Layout Components (components/)

| File | Export | Description |
|------|--------|-------------|
| components/Sidebar.tsx | default Sidebar | Sticky sidebar with 22-item grouped navigation, badge counts, dark/light aware |
| components/Header.tsx | default Header | Top bar with page title, search, notification count, admin profile chip |

## Section Components (components/sections/) — 22 Total

| File | Export | Description |
|------|--------|-------------|
| DashboardSection.tsx | default DashboardSection | KPI stat cards, 30-day revenue chart (Recharts), recent orders table, low-stock alerts |
| OrdersSection.tsx | default OrdersSection | Filterable order table, inline status update, refund modal, invoice preview |
| ProductsSection.tsx | default ProductsSection | Product list with status badges, condition tags, image previews, approve/reject |
| VendorsSection.tsx | default VendorsSection | Vendor list with KYC status, commission slider, revenue summary, toggle active |
| UsersSection.tsx | default UsersSection | Customer list, ban/unban, wallet credit/debit modal, role chip |
| DeliverySection.tsx | default DeliverySection | Delivery person list, zone assignment, COD limits, status toggle |
| PincodesSection.tsx | default PincodesSection | Pincode CRUD, serviceable toggle, express/COD charges, zone assignment |
| ReturnsSection.tsx | default ReturnsSection | Return request list, approve/reject, refund type selector, product image |
| WithdrawalsSection.tsx | default WithdrawalsSection | Vendor withdrawal requests, approve/reject, payment screenshot upload |
| CouponsSection.tsx | default CouponsSection | Coupon list, CRUD modal, discount type (flat/percent), usage counters |
| BannersSection.tsx | default BannersSection | Banner list with image preview, position, active toggle, link config |
| HomepagePinsSection.tsx | default HomepagePinsSection | Pinned product/category card ordering, active management |
| ReviewsSection.tsx | default ReviewsSection | Product review list, approve/reject, star rating display |
| SupportSection.tsx | default SupportSection | Support ticket + issue report tabs, resolution modal |
| ExamsSection.tsx | default ExamsSection | Competitive exam category CRUD, board/subject tags |
| AppSettingsSection.tsx | default AppSettingsSection | Global toggle switches: COD, express delivery, maintenance mode, etc. |
| StaticPagesSection.tsx | default StaticPagesSection | CMS editor for About/T&C/Privacy/Return Policy pages |
| NotificationsSection.tsx | default NotificationsSection | Push notification form, target group selector, send history |
| AuditLogsSection.tsx | default AuditLogsSection | Admin action log table: who did what and when |
| EmailLogsSection.tsx | default EmailLogsSection | Email delivery log: recipient, template, status, timestamp |
| MigrationLogsSection.tsx | default MigrationLogsSection | Database migration run history with pass/fail status |
| SchemaRefSection.tsx | default SchemaRefSection | Interactive schema reference: 46 tables, 30 enums, field descriptions |

## App-level Components (app/)

| File | Export | Description |
|------|--------|-------------|
| app/page.tsx | AdminMainContent (internal), Home (default) | Root SPA component — tab switch logic, provider wrapping |
| app/layout.tsx | RootLayout (default) | HTML shell with fonts and AppProviders |
| app/error.tsx | ErrorBoundary (default) | Client error boundary with retry |
| app/global-error.tsx | GlobalError (default) | Root HTML-level error boundary |
| app/not-found.tsx | NotFound (default) | 404 page |
| app/loading.tsx | Loading (default) | Suspense loading skeleton |

Total Components: 30 exported React components
