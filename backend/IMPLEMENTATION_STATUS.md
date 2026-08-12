# Implementation Status — kitabwalah-api

Snapshot as of this backend build-out session. `Tests` means automated tests (there are none yet — every module below was verified via `tsc --noEmit`, a full `nest start` boot test confirming DI wiring and route registration, and in several cases an independent adversarial code-review pass, but **nothing has been runtime-tested against a real database** because none is connected). Do not read `DONE` in any column as "verified against live data" — read it as "implemented and passes static verification."

| Feature | UI | API | DB | Tests | Status |
|---|---|---|---|---|---|
| Auth (login/refresh/logout/2FA/RBAC) | DONE | DONE | BLOCKED — no live DB, running in `AUTH_DEV_BYPASS` | NOT STARTED | PARTIAL |
| Rate limiting (`@nestjs/throttler`) | N/A | DONE | N/A | NOT STARTED (throttling behavior itself not runtime-tested) | PARTIAL |
| Same-Day Analytics | DONE | DONE | BLOCKED | NOT STARTED | PARTIAL |
| Live Map (delivery-person GPS) | DONE | DONE | BLOCKED | NOT STARTED | PARTIAL |
| App Settings | NOT STARTED (frontend not rewired) | DONE | BLOCKED | NOT STARTED | PARTIAL |
| Pincodes & Cities + CSV import | NOT STARTED | DONE | BLOCKED | NOT STARTED | PARTIAL |
| Withdrawals | NOT STARTED — frontend's fake-UTR mock bug (P0-10) is still unfixed | DONE | BLOCKED | NOT STARTED | PARTIAL |
| Users (list/ban/unban/wallet-adjustment) | NOT STARTED | DONE | BLOCKED | NOT STARTED | PARTIAL |
| Products + Categories | NOT STARTED | DONE (1 bug found+fixed: create bypassed approval workflow) | BLOCKED | NOT STARTED | PARTIAL |
| Vendors | NOT STARTED | PARTIAL — missing "30-day revenue graph + top 5 products" from spec | BLOCKED | NOT STARTED | PARTIAL |
| Orders | NOT STARTED | DONE (3 bugs found+fixed — see below) | BLOCKED | NOT STARTED | PARTIAL |
| Returns | NOT STARTED | DONE (4 bugs found+fixed — see below; 1 known concurrency limitation remains) | BLOCKED | NOT STARTED | PARTIAL |
| Delivery (persons + shipments CRUD) | NOT STARTED | DONE | BLOCKED | NOT STARTED | PARTIAL |
| GST invoice PDF generation | NOT STARTED | NOT STARTED — only `GET /orders/:id/invoice-number` (the number, not a rendered PDF) exists | BLOCKED | NOT STARTED | NOT STARTED |
| Coupons, Banners, Homepage Pins, Reviews, Support/Issue Reports, Competitive Exams, Static Pages, Notifications, Audit/Email/Migration Logs | Mock (pre-existing) | NOT STARTED | Schema models exist, no endpoints | NOT STARTED | NOT STARTED (deferred — Medium/Low priority, not part of this build-out's scope) |
| Vendor-location map + delivery-ETA estimator (separate request) | NOT STARTED | NOT STARTED | BLOCKED — `DATABASE_URL_1`/`DATABASE_URL_2` not yet provided in usable form | NOT STARTED | BLOCKED |
| Migration of the complete schema to a real Neon database | — | — | BLOCKED — `kitabwalah-api/.env`'s `DATABASE_URL` is still the local placeholder | NOT STARTED | BLOCKED |

## Bugs found and fixed this session (backend modules)

- **Products:** `CreateProductDto.status` let a caller create a product already `active`/`rejected`, bypassing the approve/reject audit trail entirely. Fixed — `status` removed from the create DTO; every product is now always created `pending_review`.
- **Orders (3):**
  1. Cancelling a partially-refunded order silently skipped refunding the remaining balance (the check was `payment_status === 'paid'` exactly, which a prior partial refund had already flipped to `'partially_refunded'`). Fixed.
  2. `PATCH /orders/:id/status` could cancel an order while completely bypassing the mandatory-reason + auto-refund logic that the dedicated `/cancel` endpoint enforces. Fixed — the generic status endpoint now rejects `cancelled` outright.
  3. `refund()` never checked `payment_status` before crediting money, so a never-paid (pending/failed) order could still have a wallet refund issued against it. Fixed — the shared `applyRefundInTx` core now requires `payment_status` to be `paid`/`partially_refunded`.
- **Returns (4):**
  1. The refund cap was checked only against a single order item's `total_price`, not cumulatively — two separate approved return requests on the same item could each be refunded up to the full price independently. Fixed — the cap is now cumulative across sibling return requests.
  2. Return-driven refunds never updated the parent `Order`'s own `refund_amount`/`payment_status` ledger, so a later order-level refund/cancel had no idea money had already been returned via this path — a real double-refund vector. Fixed — the same transaction now syncs the Order ledger.
  3. `Order`/`OrderItem` status never advanced through the return lifecycle (`return_requested` → `returned`), leaving orders stuck at e.g. `delivered` forever after a return completed, with no way to see it from the Order record. Fixed — `complete()` now advances `OrderItem.status`, and `Order.status` too once every item on the order has been returned.
  4. (Found during the adversarial re-check of fixes 1–3 above.) The Order-ledger sync added in fix #2 mirrored the refund-cap math from `OrdersService.applyRefundInTx` but not its `payment_status` entry gate — an approved return on an order that was never actually paid could still credit a wallet. Fixed — the same gate now applies here too.

## Known limitation, not fixed (documented, not silently dropped)

**No row-level locking or atomic increments anywhere in the Orders/Returns refund paths.** Every refund-mutating write uses a blind absolute `data: { refund_amount: <computed value>, ... }` rather than an atomic increment, no `$transaction` call specifies an isolation level, and nothing uses `SELECT ... FOR UPDATE` (Prisma has no direct API for it without raw SQL). `OrdersService.refund()`/`cancel()` additionally fetch the `Order` row *before* the transaction starts and reuse that snapshot inside it. Under genuinely concurrent requests — two admins (or a double-click/retry) refunding the same order, or approving two sibling return requests on the same order item at the same moment — this allows a lost-update / double-refund race. This is **not** a newly-introduced bug from this session's fixes; it's a pre-existing architectural gap in how the Orders module was originally built, inherited by Returns. Given this is a low-concurrency internal admin tool (one admin at a time is the expected usage pattern) and there is no live database yet to validate a fix against, this has been documented rather than "fixed" with an unverified, untested locking scheme. See `REMAINING_WORK.md`.
