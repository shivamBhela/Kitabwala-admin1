# Remaining Work — kitabwalah-api

Every unresolved issue known as of this session, so nothing here gets lost or silently assumed done. See `IMPLEMENTATION_STATUS.md` for the module-by-module DONE/PARTIAL/BLOCKED table this expands on.

## Blocking (need external input, cannot proceed without it)

1. **No live database connection.** `kitabwalah-api/.env`'s `DATABASE_URL` is still the local placeholder. The complete 46-model/30-enum schema (all fixes applied, `prisma validate`/`prisma generate` both pass) has never been migrated against a real Postgres instance. Nothing in this backend has been runtime-tested against real data — every verification so far is `tsc --noEmit`, a `nest start` boot test, and static/adversarial code review only.
2. **`DATABASE_URL_1`/`DATABASE_URL_2` for the vendor-map + delivery-ETA feature request** haven't been provided in a usable form — the strings sent were mangled in transit (missing scheme prefix, markdown auto-linking corrupted them) and, per explicit instruction, must be placed directly in `.env` rather than re-sent in chat (they're pre-existing databases with real data, not blank slates — read-only introspection has to happen before anything else touches them).

## Known limitations (documented, not fixed — see IMPLEMENTATION_STATUS.md for detail)

3. **No row-level locking / atomic increments in the Orders/Returns refund paths.** A genuine double-refund or lost-update race exists under true concurrency (two simultaneous requests touching the same order or order item). Low risk for a single-admin-portal usage pattern; a real fix would need `Prisma.TransactionIsolationLevel.Serializable` + retry-on-conflict logic, or raw-SQL row locking, across multiple methods in both modules — deliberately not attempted without a live database to validate against.
4. **`ReturnsService.complete()`'s "all items returned → order returned" check treats independently-cancelled items the same as "not yet returned."** An order with one returned item and one separately-cancelled item will never have its `Order.status` advance to `returned`. This may or may not match the intended business rule — needs a decision, not obviously a bug.

## Not yet implemented

5. **GST invoice PDF generation.** Only `GET /orders/:id/invoice-number` exists (generates/returns the invoice *number*). No PDF rendering exists anywhere. Needs a PDF library decision (e.g. `pdfkit`) and a layout matching the spec's "auto-generated, separate per vendor" requirement.
6. **CSV export** for Products/Orders (mentioned in `kitabwalah_admin_portal.pdf` for both sections) — not implemented; only CSV *import* (Pincodes) exists.
7. **Vendors: "30-day revenue graph + top 5 products per vendor"** from the spec's Vendor Management section — not implemented. `findOne()` surfaces raw earnings columns and recent orders, but no aggregation/graph data.
8. **`CategoriesController` has no `DELETE` endpoint.** Unclear if in scope — categories can be created/edited/re-parented but never removed.
9. **No `sale_price < regular_price` validation** on Products create/update.
10. **The entire customer-facing origin of data is unaddressed.** This admin portal manages orders/products/vendors, but there is no customer-facing shopping app anywhere in this repo that would create them. The seed script (`prisma/seed.ts`) is the only current path for realistic data to exist once a database is connected — worth confirming this is the intended near-term plan before assuming otherwise.
11. **Medium/Low-priority sections not touched this session** (deliberately, per the "high-priority sections first" scoping decision): Coupons, Banners, Homepage Pins, Reviews, Support Tickets/Issue Reports, Competitive Exams, Static Pages, Notifications, Audit/Email/Migration Logs. Their Prisma models exist (full schema is complete) but no backend modules/endpoints have been built for any of them.

## Frontend (untouched this session)

12. **None of the newly-built backend endpoints are wired into `kitabwalah-admin` yet.** App Settings, Pincodes (+ CSV import), Withdrawals, Users, Products, Categories, Vendors, Orders, Returns, Delivery all exist as real API surface with zero frontend integration. `lib/store.tsx`'s mock data still powers every one of those sections' UI.
13. **The frontend's known fake-UTR bug (`WithdrawalsSection.tsx`, audit finding P0-10) is still present** and must not survive the eventual rewire onto the real `withdrawals` API — the backend's `CompleteWithdrawalDto` correctly requires a real, manually-entered `payment_reference` with no fallback, so the fix is entirely on the frontend side: remove the `Math.random()` auto-fill.
14. ~~The dev-server startup crash (audit finding P0-1)~~ **FIXED.** Root cause was more specific than first diagnosed: an orphaned `next/dist/server/lib/start-server.js` process survives normal termination and stays alive (though no longer listening on anything), and Next's `.next/dev/lock` file keeps referencing its PID — so every fresh `next dev` reads that lock, finds the PID still alive, and self-terminates as a false "another dev server is already running," which cascades into a full `npm run dev` failure via `concurrently --kill-others-on-fail`. Fixed with a `predev`/`predev:web` npm lifecycle hook (`scripts/free-dev-ports.js`) that kills anything listening on ports 3000/3001 and deletes the stale lock file before every dev run. Verified: `npm run dev` now boots both servers cleanly with no crash.

## Testing

15. **No automated test suite exists for any of this session's work.** Every module was verified via `tsc --noEmit`, a full boot test (confirms DI wiring + route registration), and — for the financial-integrity-critical Orders/Returns fixes specifically — an independent adversarial code-review pass. None of this is a substitute for real integration tests against a live database (CRUD, invalid input, unauthorized/forbidden, pagination, persistence-across-restart, audit-log-entry-created), which is the verification bar the original request asked for and which genuinely cannot happen until a database is connected.
