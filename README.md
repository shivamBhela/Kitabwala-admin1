# Kitabwalah Admin Portal

Admin/staff control panel for **Kitabwalah**, a multi-vendor marketplace for new books, stationery, and competitive-exam materials (Muzaffarpur-based, expanding across Bihar/India). This repo contains two sibling applications plus the original specification documents they're being built against.

```
Kitabwalah Admin Portal/
├── kitabwalah-admin/            Next.js 16 / React 19 frontend (the admin portal UI)
├── kitabwalah-api/               NestJS 11 / Prisma 6 / PostgreSQL backend
├── kitabwalah_admin_portal.pdf   SPEC: 22-section admin-portal feature specification
├── pdf_content.txt               Plain-text extraction of all three PDFs above
├── package.json                  Root script that runs both apps together (`npm run dev`
├── kitabwalah-api/IMPLEMENTATION_STATUS.md   Per-feature DONE/PARTIAL/BLOCKED status (UI/API/DB/Tests)
└── kitabwalah-api/REMAINING_WORK.md          Every open item, blocking or not
```

This document answers two questions: **what has actually been built**, and **how much of the specification in the three PDFs that has been implemented**. It reflects the real state of the code as of this writing, verified by reading `kitabwalah-api/prisma/schema.prisma` directly, by a full four-way audit of the frontend and backend (see `.claude/AUDIT_BACKLOG.md` for every known bug/gap in detail), and by an ongoing backend build-out session converting the schema and API layer from a partial subset to (nearly) the complete spec.

**Note on how the backend got built**: per `.claude/AI_TEAM_PROTOCOL.md`, this project is being developed by two collaborating engineers — Claude (architecture/review/QA) and Antigravity (implementation) — working the same repository concurrently. The database schema below was completed by Antigravity in one large pass and then independently reviewed line-by-line against both source PDFs by Claude, which found and fixed 15 concrete spec mismatches (missing fields, wrong types, wrong optionality, a model that contradicted an explicit "don't enforce this FK" spec note) before anything was migrated. The API modules below followed the same build-then-verify pattern.

---

## Status at a glance

| Area | Status |
|---|---|
| Admin portal UI (22 spec'd sections) | **All 22 present**, plus 3 bonus additions (Same-Day Analytics, Live Map, Schema Reference) |
| Sections wired to a real backend | **Still 3 of 24** (Same-Day Analytics, Live Map, Login/Auth) — the other 21 run on in-memory mock data. Real backend endpoints now exist for several more (see below), but the *frontend* hasn't been rewired to call them yet. |
| Kitabwalah database schema (`kitabwalah_schema.pdf`) | **Complete** — all 46 spec'd models + all 30 spec'd enums are implemented, plus a handful of additive models/enum values the spec doesn't cover (admin RBAC/2FA/refresh-token auth, a few audit-log action types). This was 16/46 as of the last audit; it is now feature-complete at the schema level. |
| UsedBooks database (`usedbooks_schema.pdf`) | **0% implemented** — a completely separate second platform, not started at all. (A newer request referencing "two pre-existing Neon databases" for a vendor-map/delivery-ETA feature may or may not relate to this — not yet confirmed, see **Blocked / in progress** below.) |
| Backend API modules | **Complete & wired in**: Auth, Analytics (Same-Day), Map, App Settings, Pincodes & Cities (+ CSV import), Withdrawals, Users, Products, Categories, Vendors, Orders, Returns, Delivery — 13 modules, every route confirmed registered by a full `nest start` boot test (`Nest application successfully started`, no DI errors). 7 real bugs were found (via independent build-then-verify agents, then an adversarial re-check of the fixes) and fixed in Products/Orders/Returns before this was called done — see `kitabwalah-api/IMPLEMENTATION_STATUS.md` for the full list. One known limitation remains and is documented, not fixed: no row-level locking on the Orders/Returns refund paths, so genuinely concurrent requests could still race (low risk for a single-admin-portal usage pattern). |
| Admin auth (JWT + refresh rotation + RBAC + 2FA + audit log + rate limiting) | Built and functional. A real bug was found and fixed this session: `AUTH_DEV_BYPASS` was incorrectly able to hijack `refresh()`/`logout()` for *any* caller, not just synthetic bypass sessions — now scoped correctly, plus every bypass check is gated behind `NODE_ENV !== 'production'` regardless of the env flag. Still running in the temporary **no-database bypass mode** (`AUTH_DEV_BYPASS=true`) since no live Postgres instance is connected yet. |
| Combined local dev command | `npm run dev` at the repo root starts both apps together |

---

## Tech stack

**Backend (`kitabwalah-api`)**: NestJS 11, Prisma 6, PostgreSQL, Redis (via `ioredis`), Passport-JWT, `otplib` (TOTP 2FA), `bcrypt`, `class-validator`.

**Frontend (`kitabwalah-admin`)**: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TanStack Query, Zustand (UI-only state), React Context (mock-data store), Axios, Framer Motion, Recharts, React-Leaflet, `class-variance-authority`.

---

## What's been built — Backend (`kitabwalah-api`)

### Authentication & security
- Admin login (`POST /auth/login`) issuing a short-lived JWT access token (15 min) plus a rotating refresh token (30 days, `httpOnly` cookie, SHA-256 hashed at rest).
- Refresh-token rotation with replay detection: reusing an already-rotated token revokes its entire token family.
- Role-based access control: 5 admin roles (`super_admin`, `ops`, `finance`, `analytics_viewer`, `support`) via a static permission map and a `@RequirePermission` guard.
- TOTP-based two-factor authentication (setup/verify, encrypted secret, bcrypt-hashed backup codes).
- Full audit logging (`AdminActionLog`) for login/logout/2FA events, on top of the business-action log types from the spec.
- **Note:** the spec's `Auth` platform decision ("Passwordless only — phone OTP / Google OAuth / email OTP") describes the *customer-facing* shopper app, which doesn't exist in this repo. What's built here is a traditional credential + 2FA login system for **admin/staff** users, which the spec doesn't actually define (the admin-portal spec describes itself as "Single Admin Level | Full Access" with no role model at all) — the 5-role RBAC system here is a deliberate enhancement beyond that baseline. The RBAC permission set has since grown to cover every new module: `PRODUCTS_MANAGE`, `VENDORS_MANAGE`, `PINCODES_MANAGE`, `DELIVERY_MANAGE`, `RETURNS_MANAGE`, `WITHDRAWALS_MANAGE` (granted to `ops`/`finance` as appropriate), and `SETTINGS_MANAGE` (deliberately `super_admin`-only).
- A temporary `AUTH_DEV_BYPASS` flag lets `/auth/login` accept any credentials and skips all database access, because no live database is connected yet. This is explicitly documented as temporary in `kitabwalah-api/.env`. **Fixed this session:** the flag previously let `refresh()`/`logout()` hijack *any* caller's session, not just synthetic bypass ones (audit finding P0-2) — both are now scoped to only affect an actual bypass session (checked via a sentinel token / the synthetic user id), and the bypass can never activate at all when `NODE_ENV=production`, regardless of the env flag.
- Rate limiting added (`@nestjs/throttler`): a global 60 req/min default, plus stricter per-route limits on `/auth/login` (5/min) and `/auth/2fa/verify-login` (5 per 5 min) to blunt password/TOTP/backup-code brute-forcing (audit finding P1-8).

### Real API endpoints
**Complete:**
- `POST /auth/login`, `POST /auth/2fa/verify-login`, `POST /auth/2fa/setup`, `POST /auth/2fa/verify-setup`, `POST /auth/refresh`, `POST /auth/logout`
- `POST /admin/staff` — create a new admin/staff account (RBAC-gated)
- `GET /analytics/same-day` — the real, backend-computed Same-Day Analytics dashboard
- `GET /map/markers` — live delivery-person GPS coordinates for the map view
- `app-settings` — `GET /`, `GET /:key`, `PUT /:key` (key-value platform config, with secret-looking keys auto-redacted in responses)
- `pincodes` — full CRUD for cities/pincodes (`GET/POST /pincodes/cities`, `GET/POST /pincodes`, `PATCH /pincodes/:id`) plus `POST /pincodes/import` for CSV bulk import (validates every row before writing any of them, reports imported/skipped/failed with per-row reasons, never auto-creates a city from a CSV row)
- `withdrawals` — `GET /`, `GET /:id`, `PATCH /:id/approve` (re-checks vendor balance), `PATCH /:id/reject`, `PATCH /:id/complete` (requires a real, manually-entered payment reference — never auto-generated, and atomically updates the vendor's `total_withdrawn`/`pending_balance`)
- `users` — `GET /`, `GET /:id`, `PATCH /:id/ban` (also bumps `token_version` to force-invalidate live sessions), `PATCH /:id/unban`, `POST /:id/wallet-adjustment` (transactional credit/debit with a correct running `balance_after`)

- `products` + `categories` — full CRUD, approve/reject/bulk-approve/bulk-deactivate/feature, category tree with cycle-detection on re-parenting. (Bug found + fixed: creating a product could set `status` directly, bypassing the approve/reject audit trail — `status` is no longer a creatable field; every product is now always created `pending_review`.)
- `vendors` — KYC verification, commission override, suspend (cascades to deactivate that vendor's active products) / reactivate, bank details, vacation mode. **Known gap:** the spec's "30-day revenue graph + top 5 products per vendor" isn't implemented.
- `orders` — status lifecycle (forward-only, no backward jumps), capped refunds, cancellation with mandatory reason + auto-refund. (3 bugs found + fixed: cancelling a *partially*-refunded order was silently skipping the remaining refund; the generic status-update endpoint could cancel an order while bypassing the dedicated endpoint's reason/refund requirements; refunds weren't checking that the order had actually been paid before crediting money.)
- `returns` — approve/reject/refund/complete workflow, 7-day return-window enforcement (reads `AppSetting`, falls back to 7 cleanly). (4 bugs found + fixed: the refund cap wasn't cumulative across multiple return requests on the same order item; return refunds weren't syncing the parent Order's own refund ledger, opening a cross-module double-refund path; `Order`/`OrderItem` status never advanced through the return lifecycle; and — found during a follow-up adversarial check of the first three fixes — the new Order-ledger sync itself was missing the same "only refund an order that was actually paid" check the Orders module has.)
- `delivery` — delivery-person + shipment CRUD, same-day/normal attempt-cap enforcement (1 vs 3), assignment validation.

All 5 were built by a background workflow (build, then an independent agent verified each against the spec before I fixed what it found), followed by a full project-wide `nest start` boot test confirming every route registers with no DI errors — this is genuinely done, not just "compiles."

### Database schema
`kitabwalah-api/prisma/schema.prisma` now implements the **complete 46-model / 30-enum spec** from `kitabwalah_schema.pdf`, plus a small set of additive models/enum values the original spec doesn't cover (admin RBAC/2FA/refresh-token auth: `AdminProfile`, `TwoFactorAuth`, `RefreshToken`, `AdminRole`; a few extra `AdminActionType` values for actions the spec's 14-value list didn't anticipate, e.g. `wallet_adjustment`, `withdrawal_complete`, `vendor_reactivate`). See [Specification compliance](#specification-compliance) below for detail on the review process that got it there. **Not yet done:** no migration has been run against any real database — the schema is complete and internally validated (`prisma validate`/`prisma generate` both pass), but nothing has touched a live Postgres instance yet (see **Blocked / in progress**).

---

## What's been built — Frontend (`kitabwalah-admin`)

### Design system
A token-driven design system was built out: `Badge`/`StatusBadge` (with a status→variant map covering every order/payment/shipment/vendor/etc. status in the spec), `Card`, `Button`, `StatCard` (KPI tiles with optional sparklines and trend arrows), `Skeleton` loading states, `EmptyState`, and an enhanced `UniversalTable` (sortable, paginated, CSV export, sticky header) and `UniversalModal`. Applied fully to the Dashboard, Sidebar, Header, Coupons, and Banners; applied partially (badges only, not the table/modal primitives) to 7 other sections — see `.claude/AUDIT_BACKLOG.md` P1-16/17/18 for the exact rollout gap.

### Sections implemented (24 total)
All **22 sections from `kitabwalah_admin_portal.pdf`** are present in the sidebar navigation, plus 3 additions built during this engagement:

| # | Section (per spec) | Priority (spec) | Backend-wired? |
|---|---|---|---|
| 1 | Dashboard | High | Mock data (self-consistent, not fabricated numbers — just not from a database yet) |
| — | *Same-Day Analytics* (not in original spec) | — | **Real** — `GET /analytics/same-day` |
| — | *Live Map* (spec describes this as part of §6 Delivery, not standalone) | — | **Real** — `GET /map/markers` |
| 2 | Orders | High | Mock (**real `orders` backend now exists** — frontend not yet rewired) |
| 3 | Products | High | Mock (**real `products`/`categories` backend now exists** — frontend not yet rewired) |
| 4 | Vendors | High | Mock (**real `vendors` backend now exists** — frontend not yet rewired) |
| 5 | Users | High | Mock (**real `users` backend now exists** — `GET/PATCH/POST` endpoints complete — frontend not yet rewired to call it) |
| 6 | Delivery | High | Mock (**real `delivery` backend now exists** — frontend not yet rewired) |
| 7 | Pincodes & Cities | High | Mock (**real `pincodes` backend now exists**, including CSV import — frontend not yet rewired) |
| 8 | Returns | High | Mock (**real `returns` backend now exists** — frontend not yet rewired) |
| 9 | Withdrawals | High | Mock (**real `withdrawals` backend now exists** — frontend not yet rewired; note the frontend mock's fake-UTR bug, P0-10, is untouched and must not survive the rewire) |
| 10 | Coupons | Medium | Mock |
| 11 | Banners | Medium | Mock |
| 12 | Homepage Pins | Medium | Mock |
| 13 | Reviews | Medium | Mock |
| 14+15 | Support Tickets + Issue Reports | Medium | Mock — implemented as one merged "Support & Issues" section rather than two |
| 16 | Competitive Exams | Medium | Mock, and **read-only** (no create/edit actions exist yet — see below) |
| 17 | App Settings | High | Mock (**real `app-settings` backend now exists** — frontend not yet rewired) |
| 18 | Static Pages | Low | **Broken** — edits don't persist anywhere (see audit backlog P0-6) |
| 19 | Notifications | Medium | Mock |
| 20 | Audit Logs | Low | Mock |
| 21 | Email Logs | Low | Mock |
| 22 | Migration Logs | Low | Mock |
| — | *Prisma Schema Reference* (not in spec — a static dev/debug reference page) | — | Static reference content, not live data |

"Mock" means the section is a real, working UI backed by an in-memory store (`lib/store.tsx`) rather than the database — actions like ban/approve/refund/create genuinely update the UI and the audit log for the session, they just don't survive a page refresh or reach a real database yet. For the Medium/Low-priority sections (Coupons, Banners, Reviews, Support, Exams, Notifications, Logs) that's because no backend module exists at all yet — deliberately deferred. For all 9 High-priority sections — Users, Pincodes & Cities, Withdrawals, App Settings, Orders, Products, Vendors, Delivery, Returns — a real, boot-tested backend module now exists and is wired into the API, but the frontend itself still hasn't been changed to call any of it; the "Mock" label there describes the frontend only. Two sections (Static Pages, Competitive Exams) are more than "just mock" — they have UI that doesn't actually do anything even at the mock-data level; full detail in the audit backlog.

---

## Specification compliance

### Against `kitabwalah_admin_portal.pdf` (22-section feature spec)

**All 22 sections exist in the UI.** Section-level presence is complete. Feature-level completeness *within* each section varies — most mock sections correctly implement the spec's described actions (ban/unban, approve/reject, KYC verification, commission overrides, wallet credit/debit, coupon CRUD, etc.) against the mock store; a full itemized list of what's missing or broken within each section is in `.claude/AUDIT_BACKLOG.md`. CSV bulk-import of pincodes now has a real backend implementation (`POST /pincodes/import`) — not yet wired into the frontend. GST invoice PDF generation/download for orders is still not implemented anywhere (mock or real).

### Against `kitabwalah_schema.pdf` (Kitabwalah database — 46 models, 30 enums)

**All 46 spec'd models and all 30 spec'd enums are now implemented** in `kitabwalah-api/prisma/schema.prisma` (49 models / 31 enums total, once the admin-portal-specific additions below are counted). This was **16 of 46** as of the last full audit; the remaining 30 models were added in one pass and then independently reviewed against the source PDF text field-by-field, which surfaced and fixed 15 concrete mismatches before anything was migrated:

- `Product` was missing its entire approve/reject workflow (`status`, `approved_by_id`, `approved_at`, `rejection_reason`, `featured_until`, `meta_title`, `meta_description`) even though the `ProductStatus` enum existed at the top level — reconciled from `usedbooks_schema.pdf`'s richer `Product` model plus `kitabwalah_admin_portal.pdf`'s explicit Product Management requirements (documented in a header comment in the schema file).
- `IssueReport.status` was a raw `String` where the spec types it as the `SupportTicketStatus` enum.
- `Certificate` had an enforced foreign key to `User` and invented fields, directly contradicting the spec's explicit "FK not enforced — migrated user wp_id ref" note — rebuilt to match.
- `ProductImage`, `StoreFollower`, `PaymentWebhook`, `EmailLog` were each missing their `wp_id` migration-tracking field; `WithdrawalRequest` and `ProductCityPrice` were missing timestamps entirely; `UserSavedAddress` was missing 7 of its 18 spec'd fields (name/phone/address_2/country/lat/long); `CartItem` was missing its optional city relation; `HomepagePin.reference_id` was typed as a string instead of the spec'd int; `SupportTicket.user_id` was wrongly optional; `Banner.title` was wrongly optional; `MigrationRunLog` was missing `created_at`.

**Additive, not in the original 46-model spec** (built for admin-portal auth, not customer-facing features): `AdminProfile` (RBAC), `TwoFactorAuth`, `RefreshToken`, the `AdminRole` enum, and a handful of extra `AdminActionType` values for admin actions the spec's original 14-value list didn't cover (`wallet_adjustment`, `withdrawal_complete`, `vendor_reactivate`, `vendor_commission_update`, `vendor_bank_update`, `vendor_vacation_mode`, plus the pre-existing `login`/`logout`/`two_factor_enabled`/`refresh_token_reuse_detected`/`admin_role_change`).

**What "complete" does and doesn't mean here:** the schema file is complete, internally consistent (`prisma validate` passes), and generates a working Prisma Client (`prisma generate` passes) — but it has **not been migrated against any real database yet**. No `prisma/migrations` directory exists. Until a real `DATABASE_URL` is connected and `prisma migrate dev` is run, this is a validated design, not a running database.

### Against `usedbooks_schema.pdf` (UsedBooks database — 42 models, 30 enums)

**Not started — 0% implemented.** This is important to call out explicitly: `usedbooks_schema.pdf` specifies an entirely **separate platform and database** ("Database 2," peer-to-peer used-book marketplace where every user is both buyer and seller, 15% commission + Rs. 8 platform fee, no messaging) that the spec itself states must never share a database or cross-DB join with Kitabwalah. Nothing in `kitabwalah-api` or `kitabwalah-admin` references this second platform at all — no schema, no API module, no UI. All work so far has been exclusively on the Kitabwalah side. If/when UsedBooks work begins, it should be its own datasource/schema and, per the spec, likely its own NestJS project rather than a module bolted onto `kitabwalah-api`.

**Open question, not yet resolved:** a separate feature request has since come in for a vendor-location map + delivery-ETA estimator, referencing "two pre-existing Neon databases" that already contain real vendor/order/product data. Whether either of those is actually this UsedBooks platform (or the real production Kitabwalah database, or something else entirely) is unconfirmed — the connection strings provided so far were malformed in transit and haven't been usable. No inspection of those databases has happened yet. See **Blocked / in progress** below.

---

## Blocked / in progress

Work that's been started or requested but isn't done yet, so it doesn't get miscounted as shipped:

- **No real database connection exists anywhere yet.** `kitabwalah-api/.env`'s `DATABASE_URL` is still the local placeholder — the complete schema described above has never been migrated against a live Postgres instance. Nothing has been verified end-to-end (frontend → API → Prisma → database) because there is no database to verify against.
- **A second, separate pair of Neon connection strings** (`DATABASE_URL_1`/`DATABASE_URL_2`) was requested for a new vendor-location-map + delivery-ETA feature. These are described as *pre-existing databases with real data*, not blank slates — so the plan there is read-only schema introspection first, then reconciling with (not overwriting) whatever's actually in them. Blocked on receiving working connection strings via `.env` (not chat, for credential-safety reasons).
- **The frontend has not been touched** in this round of backend work. All 13 backend modules (Auth, Analytics, Map, App Settings, Pincodes, Withdrawals, Users, Products, Categories, Vendors, Orders, Returns, Delivery) exist only as backend API surface for the 9 High-priority sections; `kitabwalah-admin`'s mock store (`lib/store.tsx`) still powers every one of those sections' UI.
- **GST invoice PDF generation** and the vendor-map/delivery-ETA feature itself have not been started — both are blocked on the items above.
- **A known, documented (not fixed) concurrency limitation** in the Orders/Returns refund paths — see `kitabwalah-api/IMPLEMENTATION_STATUS.md` for detail.

Full detail on every module's status and every remaining gap now lives in **[`kitabwalah-api/IMPLEMENTATION_STATUS.md`](kitabwalah-api/IMPLEMENTATION_STATUS.md)** (DONE/PARTIAL/BLOCKED per feature, UI/API/DB/Tests columns) and **[`kitabwalah-api/REMAINING_WORK.md`](kitabwalah-api/REMAINING_WORK.md)** (every open item, blocking or not) — this README summarizes both, they're the source of truth.

---

## Known issues

A full engineering audit — every bug, gap, and security issue found across both apps, prioritized P0–P3 with evidence, root cause, and recommended fix — is tracked in **[`.claude/AUDIT_BACKLOG.md`](.claude/AUDIT_BACKLOG.md)**. Some items there are now resolved (the `AUTH_DEV_BYPASS` scoping bug, P0-2, and the missing rate-limiting, P1-8, are both fixed as of this update — see the Backend section above). Still open: the dev-server startup crash (root-caused, not yet fixed at the code level), the missing user-code-sequence migration, and the frontend's mock-data issues — most seriously, a fake auto-generated bank reference number in the *frontend's* vendor-withdrawal approval flow (`WithdrawalsSection.tsx`), independently re-confirmed still present during this session's backend work, which must not survive the eventual rewire onto the new real `withdrawals` API.

---

## Getting started

From the repo root:

```bash
npm install          # installs the root concurrently dependency
npm run dev           # starts both kitabwalah-api (port 3001) and kitabwalah-admin (port 3000) together
```

Or run them independently:

```bash
npm run dev:api        # kitabwalah-api only
npm run dev:web        # kitabwalah-admin only
```

The backend currently runs without a live database (`AUTH_DEV_BYPASS=true` in `kitabwalah-api/.env`) — any credentials will log in. See `kitabwalah-api/.env.example` for the full environment variable list required once a real PostgreSQL connection string is available.
