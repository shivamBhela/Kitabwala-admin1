# Pages — Kitabwalah Admin Portal

> App Router (Next.js 16) — all pages live under `app/`

| File | Route URL | Description |
|------|-----------|-------------|
| app/page.tsx | / | Main admin SPA — tab-based navigation across all 22 sections |
| app/layout.tsx | (wrapper) | Root layout — Inter+JetBrains Mono fonts, metadata, AppProviders |
| app/loading.tsx | /loading | Global loading UI (Suspense boundary) |
| app/error.tsx | /error | Client-side error boundary with reset button |
| app/global-error.tsx | (root error) | Root-level error boundary |
| app/not-found.tsx | /404 | Custom 404 page |

## 22 Rendered Sections (within /)

| Tab Key | Section Component | Description |
|---------|------------------|-------------|
| dashboard | DashboardSection | KPI widgets, revenue chart, recent orders, stock alerts |
| orders | OrdersSection | Full order management with filters and refund modal |
| products | ProductsSection | Product table, status controls, image preview |
| vendors | VendorsSection | KYC verification, commission, vendor management |
| users | UsersSection | User list, ban/unban, wallet adjustments |
| delivery | DeliverySection | Delivery-person management, zone assignment |
| pincodes | PincodesSection | Pincode delivery rules, COD/express charges |
| returns | ReturnsSection | Return request workflow, approve/reject |
| withdrawals | WithdrawalsSection | Vendor withdrawal management |
| coupons | CouponsSection | Coupon CRUD, usage stats |
| banners | BannersSection | Homepage banners with image preview |
| pins | HomepagePinsSection | Homepage pinned products |
| reviews | ReviewsSection | Product review moderation |
| support | SupportSection | Support tickets and issue reports |
| exams | ExamsSection | Competitive exam categories |
| settings | AppSettingsSection | Global app settings toggles |
| static-pages | StaticPagesSection | CMS for static content pages |
| notifications | NotificationsSection | Push notification broadcaster |
| audit-logs | AuditLogsSection | Admin action audit trail |
| email-logs | EmailLogsSection | Email delivery logs |
| migration-logs | MigrationLogsSection | Database migration history |
| schema-ref | SchemaRefSection | Database schema reference (46 tables, 30 enums) |
