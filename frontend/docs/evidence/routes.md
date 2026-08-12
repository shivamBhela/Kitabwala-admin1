# Routes — Kitabwalah Admin Portal

> Next.js 16 App Router route manifest.

## Static Routes

| Route | Type | File | Description |
|-------|------|------|-------------|
| / | Static | app/page.tsx | Main admin SPA |
| /_not-found | Static | app/not-found.tsx | 404 fallback |

## Route Segments (Layout / Special)

| File | Purpose |
|------|---------|
| app/layout.tsx | Root layout — wraps every route |
| app/loading.tsx | Suspense loading fallback |
| app/error.tsx | Client error boundary |
| app/global-error.tsx | Root-level error boundary |

## Tab Routes (client-side, within /)

The SPA uses a Zustand `activeTab` value to switch between 22 views. These are NOT separate URL routes — they are rendered conditionally inside the root page component.

| activeTab value | Section |
|----------------|---------|
| dashboard | DashboardSection |
| orders | OrdersSection |
| products | ProductsSection |
| vendors | VendorsSection |
| users | UsersSection |
| delivery | DeliverySection |
| pincodes | PincodesSection |
| returns | ReturnsSection |
| withdrawals | WithdrawalsSection |
| coupons | CouponsSection |
| banners | BannersSection |
| pins | HomepagePinsSection |
| reviews | ReviewsSection |
| support | SupportSection |
| exams | ExamsSection |
| settings | AppSettingsSection |
| static-pages | StaticPagesSection |
| notifications | NotificationsSection |
| audit-logs | AuditLogsSection |
| email-logs | EmailLogsSection |
| migration-logs | MigrationLogsSection |
| schema-ref | SchemaRefSection |

Total routes: 2 (static Next.js routes) + 22 (tab views)
