# Kitabwalah Admin Portal — Engineering Audit Backlog

**Status:** Audit only. No code was modified to produce this document.
**Method:** Direct inspection (root/API/frontend package.json, .env files, main.ts, AI_TEAM_PROTOCOL.md) + a live reproduction of the dev-server crash + four parallel deep-dive audits (frontend components/state, backend auth/security/API, frontend-backend integration, config/build health — including full `tsc --noEmit` and `eslint` runs in both projects).

Per `AI_TEAM_PROTOCOL.md`: this is Claude's audit report. Antigravity implements; Claude reviews the implementation against this backlog afterward. Nothing here should be implemented by reading this file alone — each item still needs the "Inspect → Plan → Implement → Run → Test → Review → Fix → Re-test" cycle the protocol requires.

---

## P0 — Application-breaking / security / data-loss

### P0-1. `npm run dev` crashes on startup when any stale `next dev` process still holds port 3000
**Evidence:** Reproduced directly. Root `package.json`'s `dev` script runs `concurrently --kill-others-on-fail "…start:dev --prefix kitabwalah-api" "…dev --prefix kitabwalah-admin"`. `kitabwalah-admin/package.json`'s `dev` script is plain `next dev` (no fixed port). Captured log:
```
[WEB] ⚠ Port 3000 is in use by process 25216, using available port 3001 instead.
[WEB] ✓ Ready in 1076ms
[WEB] ⨯ Another next dev server is already running.
[WEB] - Local: http://localhost:3000  - PID: 25216
[WEB] npm run dev --prefix kitabwalah-admin exited with code 1
--> Sending SIGTERM to other processes..
[API] npm run start:dev --prefix kitabwalah-api exited with code 1
```
**Why it happens:** A previous `next dev`/Turbopack process (PID 25216) was never fully terminated (Turbopack spawns a detached child that survives its parent shell being stopped) and is still squatting on port 3000. The new `next dev` falls back to port 3001 — which is the *backend's* fixed port (`kitabwalah-api/.env`: `PORT=3001`) — and then, independently, Next's own duplicate-dev-server lock-file detection notices the old PID and self-terminates with exit code 1. `concurrently --kill-others-on-fail` then kills the API process too, taking down the whole dev environment.
**Impact:** This is the exact bug reported by the user ("website host link opens for 1 second, another terminal opens, I can't open it"). Currently blocks all local development every time a previous session wasn't cleanly shut down.
**Recommended solution:**
1. Kill the current zombie (PID 25216 at time of audit; re-check before acting, it may have changed).
2. Pin an explicit, fixed port for the frontend (`next dev -p 3000`) so it never silently falls back into the backend's port.
3. Add a `predev` step to the root script that force-frees ports 3000/3001 before every `npm run dev` (e.g. via a small cross-platform kill-port step), so a leftover process from a previous session can never repeat this.
**Dependencies:** None — safe to do first, unblocks manual testing of everything else in this backlog.
**How to test:** Start `npm run dev` from a clean state — both services boot and stay up. Then deliberately leave a stray `next dev` running on 3000 and run it again — confirm the predev step frees the port and the command still boots cleanly rather than crashing.

### P0-2. `AUTH_DEV_BYPASS` hijacks `refresh()` and `logout()` for ANY caller, not just synthetic bypass sessions
**Evidence:** `kitabwalah-api/src/modules/auth/auth.service.ts:45` (`const DEV_BYPASS = () => process.env.AUTH_DEV_BYPASS === 'true'`), lines 126-132 (`refresh`), lines 134-140 (`logout`), lines 142-162 (`devBypassLogin`).
**Why it happens:** The bypass check is a bare env-flag test with no scoping to "is this specific token/session itself a bypass session." `jwt.strategy.ts:25` correctly scopes its own bypass check to `payload.bypass === true`, but `refresh()`/`logout()` don't apply the same discipline.
**Impact:** If this flag is ever left `true` against a real database with real logged-in admins, every `/auth/refresh` call — from a real user, not just bypass sessions — silently swaps them for a synthetic `sub:0` super_admin session instead of refreshing their real identity, leaving their actual refresh token unrotated/unrevoked. Every `/auth/logout` call no-ops for real sessions too: no revoke, no audit entry, while the client believes it logged out.
**Recommended solution:** Scope `refresh()`/`logout()` bypass behavior the same way `jwt.strategy.ts` already does correctly — only short-circuit when the incoming token/payload itself carries `bypass: true`; otherwise always run the real DB-backed path. Additionally, hard-gate the entire bypass branch behind `NODE_ENV !== 'production'` in code (not the env flag alone), and log a loud, unmissable warning on every boot while the flag is active.
**Dependencies:** None. Should land before the real database is connected in a few days.
**How to test:** With the flag on, confirm login still works with fabricated creds; once a real seeded user exists, confirm their `refresh`/`logout` goes through the real path unaffected by the flag.

### P0-3. `UserCodeService`'s Postgres sequences are never created by any migration — seeding and staff creation will crash on first real-DB use
**Evidence:** `kitabwalah-api/src/modules/users/user-code.service.ts:17-24` calls `SELECT nextval('user_code_seq_<role>'::regclass)`. No `prisma/migrations` directory exists anywhere in the repo, and `schema.prisma` has no way to declare a custom-named sequence (Prisma's `@default(autoincrement())` only creates implicit per-column sequences, not `user_code_seq_admin` etc.).
**Why it happens:** The sequence-creation SQL was never written into a migration; only the *consumption* side (`nextval`) was implemented.
**Impact:** The moment a real Postgres database is connected, `prisma/seed.ts` and the one implemented mutating endpoint (`POST /admin/staff`) both fail immediately with `relation "user_code_seq_<role>" does not exist`.
**Recommended solution:** Add a hand-written migration (`prisma migrate dev --create-only`) containing explicit `CREATE SEQUENCE user_code_seq_<role>` statements for every `UserRole` value, committed alongside the schema.
**Dependencies:** Must land before the real `DATABASE_URL` goes live — directly relevant to "I have a DB in a few days."
**How to test:** Run migrations against a fresh local Postgres, run `db:seed`, call `POST /admin/staff` — both must succeed.

### P0-4. ~20 of 24 admin sections (including the primary Dashboard) are 100% mock data with zero backend wiring — violates the standing "no static UI" rule, and some UI actively claims a healthy connection it isn't checking
**Evidence:** `lib/store.tsx` (`AdminStoreProvider`) seeds every dataset from `mockData.ts` and never calls any service; confirmed section-by-section (full table below). `products.controller.ts`/`vendors.controller.ts` are empty stubs with zero routes; there is no `UsersController` or `AuditController` at all despite `USERS_MANAGE`/`AUDIT_READ` permissions being defined for them; there is no Orders module at all. Three UI elements assert a permanently-healthy backend regardless of reality: `Header.tsx:150` ("RDS Connected"), `Sidebar.tsx:355` ("Live DB"), `app/page.tsx:130` ("All systems operational") — all static JSX, none backed by a health check.
**Why it happens:** Only Same-Day Analytics and the Map were wired to the real backend in Phase 1; the other ~20 sections predate the backend's existence and haven't been migrated yet, and the "healthy system" badges were never connected to anything because there was nothing to connect them to at the time.
**Impact:** Every "approve," "ban," "refund," or "payout" an admin performs in an unwired section is silently lost on page refresh. The Dashboard — the first screen every admin sees — is labeled "Real-time" in `constants/navigation.ts:54` while being entirely fabricated. The three status badges actively mislead about system health.
**Recommended solution:** This is the large, already-implicit Phase-2+ backend buildout (real controllers + persistence for Vendors/Products/Users/Orders/etc., then rewiring each section's data source) — track each mock section as its own follow-up, prioritized by actual admin usage. In parallel, two cheap independent fixes: (a) stop claiming "real-time"/implying live data for sections that are still mock, or explicitly badge them "Preview / Sample Data" until wired; (b) wire the three health badges to a real `GET /api/health` check (there's already a reference to `/api/health` in `test/app.e2e-spec.ts` — confirm whether it's actually implemented) so they reflect truth instead of a hardcoded claim.
**Dependencies:** Full module buildout is large and separately scoped; the honesty-labeling fix is small and can happen immediately, independent of everything else.
**How to test:** For the badge fix — stop the API and confirm the badges flip to a degraded/disconnected state. For each newly-wired module — verify a CRUD action survives a page refresh (proof it hit the real DB, not local state).

### P0-5. Session-expiry redirect targets `/login`, a route that doesn't exist — strands the admin on a dead-end 404
**Evidence:** `kitabwalah-admin/lib/axios.ts:102` — `window.location.href = "/login"` fires when a 401 survives silent refresh. The app has exactly one real route (`/`); `LoginPage.tsx` only ever renders conditionally inside `app/page.tsx` based on client state, never at a `/login` URL. `app/not-found.tsx:42`'s own "Back to Dashboard" link points at `/dashboard`, which is equally not a real route (also just a client-state string).
**Why it happens:** The app uses a single-page, client-state "activeTab" pattern rather than real Next.js routes, but the axios interceptor and the 404 page's escape hatch both assume routes exist that never were created.
**Impact:** Any real unrecoverable session expiry (30-day refresh-token expiry, revoked token family after the P1-1 multi-tab issue below, a banned account) strands the admin on Next's generic 404 with no working way back in except manually typing `/` in the address bar.
**Recommended solution:** Change the redirect target to `/` and let `app/page.tsx`'s existing session-check logic fall through to rendering `LoginPage` when no valid session exists. Fix `not-found.tsx`'s link the same way.
**Dependencies:** None — trivial, isolated fix.
**How to test:** Force a 401 (corrupt/clear the stored token) and confirm the app lands back on a working login screen, not a 404.

### P0-6. `StaticPagesSection` has zero persistence — the entire section is decorative
**Evidence:** `kitabwalah-admin/components/sections/StaticPagesSection.tsx` uses only local `useState`, never `useAdminStore` or any service. `handleSave` just flips a `saved` boolean for 2.5s and shows "Page Updated!" — the edited `content` is never written anywhere. Switching tabs (`handleSelect`) silently resets `content` back to the hardcoded source, discarding unsaved edits with no warning.
**Why it happens:** Built before the mock store existed for this feature and never wired in, unlike every other CRUD section.
**Impact:** An admin editing the Refund Policy or Terms page sees a success confirmation and believes the change is live; nothing was ever saved anywhere.
**Recommended solution:** Wire this section into `useAdminStore` (add a `staticPages` slice + `updateStaticPage` action) at minimum, matching the pattern every other mock CRUD section already uses; flag it as unsaved-changes-aware so tab-switching warns before discarding edits.
**Dependencies:** None.
**How to test:** Edit a page, save, switch tabs, switch back — edited content must persist (at least across the session).

### P0-7. `ProductsSection`'s "City-wise Pricing" feature is fully fabricated
**Evidence:** `ProductsSection.tsx:201-238`. The real `Product.city_prices: Record<string, number>` field already exists in the type and mock data, but the modal never reads it — it invents display numbers (`regular_price + 5`, `+ 10`) for hardcoded city labels, and "Save City Pricing" only closes the modal (`setCityPriceProduct(null)`), calling no store action.
**Impact:** The clearest "decorative feature that lies to the user" found in the audit — it looks fully functional (real modal, real-looking numbers, a save button) and does nothing.
**Recommended solution:** Read/write the existing `city_prices` field via a new store action; remove the fabricated `+5`/`+10` display math.
**Dependencies:** None.
**How to test:** Set a city price, save, close and reopen the modal — the value must reflect what was actually saved, not a recomputed fake.

### P0-8. Order refunds have no upper bound
**Evidence:** `OrdersSection.tsx:330-337` — the refund amount input has no `max` attribute and no validation against the order total, despite the label stating "Max ₹{showRefundModal.total}". `lib/store.tsx:256-270`'s `processOrderRefund` accepts any amount unchecked.
**Impact:** An admin can refund an arbitrary amount — e.g. ₹99,999 on a ₹100 order — and the mock store accepts it silently. If this validation gap survives into the real backend integration unchanged, it becomes a real financial-integrity bug.
**Recommended solution:** Add client-side `max={total - already_refunded}` validation and reject server-side (once real) any refund that would exceed the order total.
**Dependencies:** Should be fixed before Orders is wired to a real payment/refund backend (relevant to the P0-4 buildout).
**How to test:** Attempt to refund more than the order total — must be rejected, not silently accepted.

### P0-9. `ExamsSection` promises CRUD it structurally cannot deliver
**Evidence:** `constants/navigation.ts` describes this section as supporting creating exam categories and linking products. But `lib/store.tsx` declares `exams` with no setter at all, and `AdminStoreContextType` exposes zero exam-mutating actions. `ExamsSection.tsx`'s "Add Exam Category" button has no `onClick` handler.
**Impact:** Not a quick wiring fix — the entire mock-store layer for this feature is missing, so the section is read-only despite its own description promising otherwise.
**Recommended solution:** Either build out the missing store actions (`addExam`, `linkProductToExam`, etc.) and wire the button, or correct the nav description to stop promising functionality that doesn't exist until it's built.
**Dependencies:** None blocking, but should be resolved before this section is presented as complete.
**How to test:** "Add Exam Category" must either create a real (mock-store) entry or the button/description should be removed.

### P0-10. `WithdrawalsSection` auto-fills a randomly generated fake bank reference into the payout-confirmation flow
**Evidence:** `WithdrawalsSection.tsx:76-79` — `setUtrReference(\`UTR-${Math.floor(1000000000 + Math.random() * 9000000000)}\`)` runs the instant the approve modal opens, pre-filling the "Bank UTR / Transaction Reference Number" field. `approveWithdrawal` (`lib/store.tsx:284-299`) commits this random string as `payment_reference` — a permanent "proof of payment" record with no relationship to any real bank transaction.
**Why it happens:** Almost certainly meant as placeholder/demo convenience, but the field is never cleared or forced-empty, so an admin can click "Confirm Paid" without ever entering a real UTR.
**Impact:** This is the single highest-risk finding in the frontend audit — if this UI pattern reaches production unchanged, it actively invites recording fake payout confirmations for real vendor money. Must not survive into the real-backend integration.
**Recommended solution:** Remove the auto-fill entirely; require the admin to manually enter a real UTR, with format validation, before "Confirm Paid" is enabled.
**Dependencies:** None — fix independent of backend wiring, but treat as blocking before Withdrawals is ever connected to a real payout system.
**How to test:** Open the approve modal — the UTR field must be empty and "Confirm Paid" disabled until a validly-formatted reference is typed.

---

## P1 — Major functionality problems

### P1-1. Multi-tab refresh race triggers false "token theft" detection, force-logging out a legitimate single user
**Evidence:** `lib/axios.ts`'s `refreshInFlight` dedupe (lines 54-70) is a plain module-scoped variable, only effective within one tab. `kitabwalah-api/src/modules/auth/token.service.ts` `rotateRefreshToken` (lines 76-99) treats a second concurrent request against an already-rotated token as replay and revokes the entire token family.
**Why it happens:** No cross-tab lock (no `BroadcastChannel`, no shared-worker mutex) coordinates refresh calls across multiple open tabs of the same user.
**Impact:** A user with two tabs open, both hitting an expired access token around the same time, gets both tabs logged out with "Session revoked" — a false positive, not an actual security event.
**Recommended solution:** Add a cross-tab coordination mechanism (e.g. `BroadcastChannel` or a `navigator.locks`-based mutex) so only one tab performs the actual refresh call and the rest wait for/reuse its result.
**Dependencies:** None.
**How to test:** Open two tabs, force both access tokens to expire near-simultaneously, confirm only one refresh call occurs and neither tab gets logged out.

### P1-2. No cross-tab session sync — logging out in one tab leaves others silently "logged in"
**Evidence:** `app/page.tsx`'s `handleLogout` clears `localStorage` only in the calling tab; no `storage` event listener is attached to the auth keys, despite a generic storage-event hook already existing (`hooks/useLocalStorage.ts:60`) but unused for this purpose.
**Recommended solution:** Wire a `storage` event listener (or reuse the existing hook) on the auth keys so all open tabs react to a logout performed in any one of them.
**Dependencies:** None.
**How to test:** Log out in tab A, confirm tab B's next interaction (or immediately, via the listener) redirects to login too.

### P1-3. Backend permissions are defined for functionality that has no controller at all
**Evidence:** `src/modules/auth/rbac/permissions.ts` defines `USERS_MANAGE`, `ORDERS_MANAGE`, `AUDIT_READ`. `audit.module.ts` exports only `AuditService` (no `AuditController` — audit logs are write-only, unreadable via the API). `users.module.ts` exports only services (no `UsersController` — no list/ban/unban/deactivate endpoint despite `is_banned`/`is_active`/`token_version` being modeled specifically for this). There is no Orders module at all despite `Order` being fully modeled and queried elsewhere.
**Impact:** These are dead permissions granting access to endpoints that don't exist — a red flag that the RBAC map was written ahead of the implementation and never reconciled.
**Recommended solution:** Either implement the missing controllers (Users list/ban, Audit-log read, Orders CRUD) as part of the P0-4 de-mocking work, or remove the dead permission entries until their endpoints exist.
**Dependencies:** Overlaps with P0-4's module buildout.
**How to test:** For each new controller, confirm the corresponding permission actually gates it (403 for roles without the permission, 200 for roles with it).

### P1-4. `Products`/`Vendors` controllers are registered, empty stubs — zero routes despite being wired into the app
**Evidence:** `src/modules/products/products.controller.ts` and `src/modules/vendors/vendors.controller.ts` are both empty `@Controller()` classes with no routes; both modules are imported into `app.module.ts` regardless.
**Recommended solution:** Implement real CRUD routes as part of the P0-4 de-mocking work for the Products/Vendors sections.
**Dependencies:** Part of P0-4.
**How to test:** `ProductsSection`/`VendorsSection` should round-trip real data through these once implemented.

### P1-5. Global exception filter can never produce the per-field error shape the frontend's type promises
**Evidence:** `src/common/filters/all-exceptions.filter.ts:33-37` always collapses NestJS's flat validation-message array into `{ form: rawMessage }` with only the first message surfaced in `message`. `kitabwalah-admin/types/api.ts:15-20`'s `ApiErrorResponse.errors?: Record<string,string[]>` implies per-field lookup is possible.
**Why it happens:** Nest's default `ValidationPipe` doesn't group errors by field unless a custom `exceptionFactory` is supplied; the filter never adds one.
**Impact:** Currently harmless because no frontend form reads `.errors[field]` yet, but it's a real, latent contract mismatch that will misbehave the instant any real form (e.g. `POST /admin/staff`) tries per-field inline error display.
**Recommended solution:** Add a custom `exceptionFactory` to the global `ValidationPipe` that groups `class-validator` errors by property name, matching the promised `Record<string,string[]>` shape.
**Dependencies:** None.
**How to test:** Submit an invalid `POST /admin/staff` payload with multiple field errors, confirm the response's `errors` object has one array per invalid field.

### P1-6. `Map` section's error and empty states are indistinguishable — a backend failure is silently reported as success
**Evidence:** `kitabwalah-api/src/modules/map/map.service.ts:25-51` wraps the query in try/catch and returns `{ markers: [] }` (HTTP 200) on ANY failure, including the DB being unreachable. `MapSection.tsx` renders this identically to "genuinely zero active couriers right now," with copy reinforcing the illusion.
**Why it happens:** Intentional graceful-degradation choice, but taken further than the Same-Day Analytics endpoint, which correctly lets real errors propagate to a visible error card.
**Recommended solution:** Distinguish "confirmed zero markers" from "query failed" — either let the error propagate like Same-Day Analytics does, or return a distinct flag (`{ markers: [], degraded: true }`) the frontend can render differently.
**Dependencies:** None.
**How to test:** Stop the database, confirm the Map section shows a visible error state rather than a calm "no couriers online" message.

### P1-7. Full authenticated UI renders before any server-side session validation
**Evidence:** `app/page.tsx`'s `readStoredSession()` treats `localStorage` presence as "logged in" with no call to any session-verification endpoint. Combined with P0-4's fake "connected" badges, a dead session still shows a fully "operational" dashboard until the first background poll happens to fail.
**Recommended solution:** Add a lightweight `/auth/me`-equivalent call on mount to confirm the stored token is actually still valid before rendering the authenticated shell as trustworthy (or at least before trusting/rendering the health badges).
**Dependencies:** Benefits from P0-4's real health-check endpoint.
**How to test:** Manually invalidate a token server-side, reload the app, confirm it doesn't render a confidently "operational" shell before catching the invalid session.

### P1-8. No rate limiting or brute-force protection on auth endpoints
**Evidence:** No `@nestjs/throttler` or any throttling dependency/guard anywhere; `auth.controller.ts`'s `/auth/login` and `/auth/2fa/verify-login` have no attempt-counting or lockout.
**Impact:** A 6-digit TOTP code or bcrypt-hashed backup codes can be brute-forced with no request-rate limit.
**Recommended solution:** Add `@nestjs/throttler` (or equivalent) on the auth controller, with stricter limits on the 2FA-verify route than login.
**Dependencies:** None — should land before the real DB (and real user accounts) go live.
**How to test:** Hammer `/auth/2fa/verify-login` past the configured limit, confirm it starts rejecting with 429.

### P1-9. Weak/default secrets pass validation with no entropy or placeholder check
**Evidence:** `.env`'s `JWT_ACCESS_SECRET="dev-access-secret-change-me"` and `TOTP_ENCRYPTION_KEY="dev-32-byte-totp-key-change-me!!"` pass `env.validation.ts`'s `@IsString() @IsNotEmpty()` checks unchanged.
**Impact:** If either placeholder ships unchanged to a real deployment, JWTs can be forged / TOTP secrets can be decrypted by anyone who knows the well-known placeholder pattern.
**Recommended solution:** Add a minimum-length/entropy check to `env.validation.ts`, and explicitly reject known placeholder strings, so the app refuses to boot with them outside development.
**Dependencies:** None.
**How to test:** Set `JWT_ACCESS_SECRET` to the placeholder with `NODE_ENV=production` and confirm the app refuses to start.

### P1-10. `kitabwalah-api` ESLint: 113 errors that `--fix` cannot fully resolve
**Evidence:** Full run captured: `no-unsafe-assignment`/`no-unsafe-return`/`no-unsafe-member-access` (untyped `any` flowing through `current-user.decorator.ts`, `permissions.guard.ts`, `auth.controller.ts`, `app.e2e-spec.ts`), `no-unnecessary-type-assertion` (`auth.service.ts:145`), `require-await` (`redis.service.ts:24`), plus ~104 Prettier-formatting errors.
**Why it happens:** The backend `tsconfig.json` disables `noImplicitAny` (unlike the frontend's `strict: true`), letting `any` leak through decorators/guards that stricter settings would catch at compile time.
**Recommended solution:** Fix the ~9 real type-safety errors (type the `Request`/`ExecutionContext` user payloads properly instead of `any`), then run `--fix` for the formatting-only errors, then split the `lint` script (see P1-11).
**Dependencies:** None — cheap, mechanical, worth doing before more backend code lands on top of the untyped decorators.
**How to test:** `npx eslint "{src,apps,libs,test}/**/*.ts"` exits 0.

### P1-11. `kitabwalah-api`'s `lint` script unconditionally bakes in `--fix`
**Evidence:** `package.json`: `"lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"`.
**Impact:** Running "lint" silently rewrites the working tree rather than just reporting — unsuitable as a CI gate, and still exits non-zero after rewriting due to P1-10's non-fixable errors.
**Recommended solution:** Split into a check-only `lint` and a separate `lint:fix`.
**Dependencies:** None.
**How to test:** `npm run lint` after the split reports without modifying files; `npm run lint:fix` is the only one that rewrites.

### P1-12. Two backend files have corrupted, mixed CRLF/LF line endings within the same file
**Evidence:** `src/modules/products/products.module.ts` and `src/modules/vendors/vendors.module.ts` — Prettier reports `Insert ␍` at multiple different offsets within each file, meaning some lines are CRLF and others LF in the same file.
**Recommended solution:** Normalize both files to the project's configured line-ending style (check `.prettierrc`/`.editorconfig`) and re-save.
**Dependencies:** None.
**How to test:** `npx eslint` on those two files reports no `prettier/prettier` line-ending errors afterward.

### P1-13. No `docker-compose.yml` exists despite the backend's `.env` hardcoding local Postgres/Redis connection strings
**Evidence:** No `docker-compose.yml` anywhere in the repo (recursive search). `.claude/settings.local.json` pre-authorizes `docker compose *`, confirming this was the intended workflow but never delivered.
**Impact:** A new developer following `.env.example` has no scripted way to actually stand up the Postgres/Redis instance the backend assumes exists at `localhost:5432`/`localhost:6379`.
**Recommended solution:** Add a `docker-compose.yml` at the repo root defining `postgres:16` and `redis:7` services with credentials/ports matching `kitabwalah-api/.env`'s `DATABASE_URL`/`REDIS_URL`. (Note: if the "real DB in a few days" turns out to be an external managed instance rather than local Docker, this may become moot — worth confirming with the user before spending time on it.)
**Dependencies:** None technically, but check with the user first given the imminent real-DB timeline.
**How to test:** `docker compose up -d`, then `npx prisma migrate dev` against it succeeds.

### P1-14. No git repository anywhere in the monorepo, with real-looking (currently dev-only) secrets already in plaintext and no root-level `.gitignore`
**Evidence:** No `.git` at root, in `kitabwalah-admin/`, or in `kitabwalah-api/`. `kitabwalah-api/.env` (not yet under version control, since there's no repo) already contains `JWT_ACCESS_SECRET`, `TOTP_ENCRYPTION_KEY`, `SEED_SUPER_ADMIN_PASSWORD`. Both subprojects' own `.gitignore` files correctly exclude `.env*`, but there is no root-level `.gitignore` to protect root-level artifacts once git is initialized.
**Impact:** Zero version-control safety net right now (no history, no rollback, no blame) for a project that's about to receive a real database connection string.
**Recommended solution:** Initialize git at the repo root with a root-level `.gitignore` (covering `node_modules/`, `.env*`, `folder_tree.txt`, build artifacts) before the real DB credentials arrive.
**Dependencies:** Should happen before, or immediately alongside, the "DB in a few days" event.
**How to test:** `git status` after init shows no `.env` files or `node_modules` staged.

### P1-15. No bootstrap step for a fresh clone
**Evidence:** Root `package.json` has no `workspaces` field and no `postinstall` — running `npm install` at the root does not install either subproject's dependencies.
**Recommended solution:** Add either an npm/pnpm workspaces setup, or a `postinstall` script that runs `npm install --prefix kitabwalah-admin && npm install --prefix kitabwalah-api`.
**Dependencies:** None.
**How to test:** Delete both subprojects' `node_modules`, run `npm install` at root, confirm both are reinstalled.

### P1-16. Two competing, actively-conflicting design systems ship simultaneously
**Evidence:** New primitives (`components/ui/button.tsx`, `card.tsx`) are used only by `DashboardSection`, `Header`, `Sidebar`. The legacy CSS-class system (`.kw-btn-primary`, `.kw-card` in `app/globals.css`) is still actively used *inside the supposedly-redesigned pieces themselves* — `ConfirmDialog.tsx`, `UniversalTable.tsx`, `CouponsSection.tsx`, `BannersSection.tsx`. There is no single button/card implementation in the app.
**Recommended solution:** Pick the new `cva`-based primitives as the single source of truth and migrate every remaining `.kw-btn-*`/`.kw-card` usage onto them.
**Dependencies:** None, but do after the P0-4 de-mocking work starts touching these files anyway, to avoid double-touching.
**How to test:** Grep for `.kw-btn-`/`.kw-card` returns zero hits in `components/`.

### P1-17. The design-system rollout landed in only 2 of 24 sections; the 7 "rewritten" sections only got `Badge`
**Evidence:** `UniversalTable`/`UniversalModal`/`ConfirmDialog` are imported only by `CouponsSection.tsx`/`BannersSection.tsx`. The sections previously reported as rewritten (`OrdersSection`, `WithdrawalsSection`, `ReturnsSection`, `ProductsSection`, `SupportSection`, `ReviewsSection`, `DeliverySection`) only import `Badge`/`StatusBadge` — every table in them is still a hand-rolled `<table>` with no sorting/pagination/CSV export, and every modal is a hand-rolled `<div className="fixed inset-0...">`.
**Recommended solution:** Finish the rollout — migrate these 7 sections' tables/modals onto `UniversalTable`/`UniversalModal` for feature parity (sorting, pagination, export, escape/outside-click dismissal).
**Dependencies:** Related to P1-18 below (modal accessibility) — worth doing together.
**How to test:** Each migrated section's table gains working sort/export; each modal closes on Escape/outside-click.

### P1-18. 14 hand-rolled modals have no Escape-key or outside-click dismissal, and none have `role="dialog"`/`aria-modal`
**Evidence:** 14 `fixed inset-0` modal instances across `OrdersSection`, `ProductsSection`, `VendorsSection`, `UsersSection`, `WithdrawalsSection`, `ReturnsSection`, `SupportSection`, `HomepagePinsSection` — zero have an Escape handler or backdrop-click-to-close. `UniversalModal.tsx` itself already implements both correctly but also lacks `role="dialog"`/`aria-modal`/a focus trap.
**Recommended solution:** Migrate the 14 hand-rolled modals onto `UniversalModal` (folds into P1-17), and add `role="dialog"`, `aria-modal="true"`, and a focus trap to `UniversalModal` itself.
**Dependencies:** P1-17.
**How to test:** Every modal closes on Escape and on backdrop click; screen-reader/axe accessibility check passes for modal role attributes.

### P1-19. Five fully-built custom hooks are dead code
**Evidence:** `useDebounce`, `useDisclosure`, `useLocalStorage`, `useMediaQuery` (+ `useIsMobile`/`useIsTablet`/`useIsDesktop`), `usePagination` are never imported anywhere outside their own files. Consequence: no search input anywhere is debounced (re-filters on every keystroke); no component responds to mobile/tablet breakpoints; `UniversalTable` reimplements its own pagination state instead of reusing `usePagination`.
**Recommended solution:** Either wire these hooks into the places they were clearly built for (search inputs → `useDebounce`; `UniversalTable` → `usePagination`; responsive layout → `useMediaQuery`), or remove them if truly abandoned.
**Dependencies:** None.
**How to test:** Search inputs no longer re-filter on every keystroke; responsive breakpoints visibly change layout.

### P1-20. `useUIStore` is mostly dead state — there is no actual mobile sidebar drawer
**Evidence:** Of 7 pieces of state in `store/useUIStore.ts`, only `isSidebarOpen`/`toggleSidebar` are consumed anywhere. `isMobileSidebarOpen`, `activeModal`/`openModal`/`closeModal`, `isGlobalLoading` are never read or written. `Sidebar.tsx` only toggles between `w-16`/`w-64` — on a phone-width viewport it permanently occupies real screen space with no way to fully hide it, despite state clearly scaffolded for exactly that.
**Recommended solution:** Wire `isMobileSidebarOpen` into a real off-canvas mobile drawer pattern (hide entirely below a breakpoint, toggle via a hamburger button), using the also-dead `useMediaQuery` hook (P1-19) to detect the breakpoint.
**Dependencies:** P1-19.
**How to test:** On a narrow viewport, the sidebar is fully hideable, not just narrowed to 64px.

### P1-21. Full form-validation stack is installed and defined but entirely unused
**Evidence:** `react-hook-form`, `zod`, `@hookform/resolvers`, most `@radix-ui/*` are dependencies; `utils/validators.ts` defines `phoneSchema`/`emailSchema`/`gstinSchema`/`panSchema`/`ifscSchema`/`pincodeSchema`. Zero usage anywhere in `components/`. `VendorsSection`'s KYC modal displays PAN/Aadhaar/bank-account/IFSC fields with plain uncontrolled `useState` and no format validation.
**Impact:** Any malformed GSTIN/PAN/IFSC entered anywhere in the app currently passes through with zero checking, despite validation schemas already existing specifically for them.
**Recommended solution:** Wire `react-hook-form` + the existing `zod` schemas into the KYC modal and `LoginPage` at minimum, then extend to other forms as they're built out.
**Dependencies:** None.
**How to test:** Entering a malformed PAN/GSTIN/IFSC in the KYC modal shows a validation error and blocks submission.

### P1-22. `components/ui/chart.tsx` is entirely dead code
**Evidence:** `ChartContainer`/`ChartTooltip`/`ChartLegend` are never imported by any section — `DashboardSection.tsx` builds its bar chart with raw `recharts` primitives directly instead.
**Recommended solution:** Either migrate `DashboardSection`'s chart onto `ChartContainer` for consistency with future chart additions, or remove the unused file.
**Dependencies:** None.
**How to test:** N/A — cleanup only.

### P1-23. `PincodesSection` has two dead buttons and one fake status column
**Evidence:** `PincodesSection.tsx` — "Add New City" and "CSV Bulk Import" have no `onClick` at all. The "Service Status" column always renders a hardcoded "Deliverable" badge regardless of the real `pin.is_delivery_available` field, which is never read.
**Recommended solution:** Wire the Service Status column to the real field immediately (trivial, one-line fix); implement or remove the two dead buttons.
**Dependencies:** None.
**How to test:** A pincode with `is_delivery_available: false` shows a non-"Deliverable" badge.

### P1-24. Inconsistent confirmation-gating for destructive actions
**Evidence:** Ban User and Reject flows require a modal + written reason. Suspend/Reactivate Vendor, the Same-Day delivery toggle, and Coupon/Banner activate-deactivate all fire immediately on a single click with zero confirmation.
**Recommended solution:** Apply the existing `ConfirmDialog` primitive consistently to every destructive/state-changing action, not just some.
**Dependencies:** None.
**How to test:** Every toggle that changes a live business state (vendor active/inactive, coupon active/inactive, delivery zone flags) prompts for confirmation before committing.

### P1-25. Minor but real gaps: dead payment filter, fake invoice download, overpromising button label
**Evidence:** `OrdersSection.tsx` — `selectedPayment`/`setSelectedPayment` and a `matchesPayment` predicate exist and participate in filtering, but no "Payment:" filter control is ever rendered, so it can never be triggered. "Download PDF Invoice" only closes its modal — downloads nothing. `ReviewsSection.tsx`'s "Approve & Update Vendor Rating" button label claims more than `approveReview` does (it only sets status, never touches `VendorProfile.average_rating`/`total_reviews`).
**Recommended solution:** Either render the missing payment filter UI or remove the dead state; implement a real invoice export (reuse `UniversalTable`'s existing CSV-export pattern as a reference) or remove the misleading button; fix the Reviews button label to match actual behavior, or implement the rating update.
**Dependencies:** None.
**How to test:** Each fix is independently testable per the description above.

---

## P2 — Important UX/engineering issues

- **2FA enrollment is unreachable from the UI.** Backend exposes `POST /auth/2fa/setup`/`verify-setup` (`auth.controller.ts:85-93`), but `services/authService.ts` never calls them and no component does either — 2FA can never actually be turned on by an admin today.
- **CORS origin is a single hardcoded fallback string** (`main.ts:14`, `'http://localhost:3000'`) with no awareness that the frontend's port isn't pinned — directly connects to P0-1; once P0-1 pins the frontend's port, this stops being a live risk, but is worth hardening independently (clearer error surfacing on CORS failure instead of a generic "Unknown error contacting the backend").
- **`constants/navigation.ts` is dead, drifting code** — a fully-built 22-item nav tree with `href`s implying real routes, zero imports anywhere; the actually-rendered nav lives entirely in `Sidebar.tsx`'s separately-maintained `NAV_GROUPS`. A future edit to `navigation.ts` would silently fix nothing real. Recommend deleting the dead file or wiring it back as the single source of truth.
- **Missing indexes on nearly every foreign key**, including `Order.created_at`/`status`/`payment_status`, which are the hot filter path for every Same-Day Analytics query (`analytics.service.ts`). Will full-table-scan as real order volume grows, on a 45-second cache TTL.
- **`CreateAdminStaffDto` allows an unreachable admin account** — both `phone` and `email` are `@IsOptional()` with no cross-field "at least one required" validator; omitting both creates a staff row that can never log in.
- **Inconsistent TypeScript strictness** between frontend (`strict: true`) and backend (`noImplicitAny: false`, several strict flags off) — root cause of several of the P1-10 lint errors.
- **`kitabwalah-admin` ESLint: 74 warnings** (0 errors) — dead icon imports across ~18 section components, and 6 raw `<img>` tags that should be `next/image` (`AdvancedMap.tsx`, `BannersSection.tsx` x2, `ExamsSection.tsx`, `ProductsSection.tsx`, `ReturnsSection.tsx`).
- **`playwright` is an installed devDependency with zero test files or config** — either dead weight or a half-finished setup; decide to either write real E2E tests against it or remove it.
- **`.env.example` values diverge from the real `.env` without documentation** — `AUTH_DEV_BYPASS=false` (example) vs `true` (real), and no note that `TOTP_ENCRYPTION_KEY` must be exactly 32 bytes (the placeholder `__CHANGE_ME__` wouldn't satisfy this).
- **`refresh_token` cookie's `secure` flag depends on an unvalidated `NODE_ENV`** (`auth.controller.ts:23`) — if a production deploy omits setting `NODE_ENV=production` explicitly, the cookie silently downgrades to sendable over plain HTTP with no warning.
- **Login timing side-channel enables user enumeration**: the "no such user" path skips `bcrypt.compare` entirely while the "wrong password" path runs it (~100ms), creating a measurable timing difference despite identical error messages.
- **Currency/date formatting is duplicated ad hoc almost everywhere** instead of using the existing `utils/format.ts` helpers — used only in Dashboard/SameDayAnalytics/Map; the other 21 sections hand-roll `₹{value}` interpolation (rendering e.g. "₹849.2" instead of "₹849.20") and raw unformatted dates.
- **Free-text foreign-key-like fields with no picker or validation**: `HomepagePinsSection`'s "Target Reference ID" is a raw text input defaulting to a hardcoded product id, even though the real products/categories/banners lists are already available in the store; same pattern for `NotificationsSection`'s `targetCity`. Typos silently create pins/notifications pointing at nothing.
- **`AdminStoreContext`'s value and all action functions are recreated every render** with no `useMemo`/`useCallback` — every mutation anywhere re-renders every consumer including the always-mounted Header/Sidebar. Invisible at mock-data scale; will matter once real paginated API data replaces the arrays.
- **`CreateAdminStaffDto`-style gaps also exist on the frontend**: `CouponsSection.tsx`'s save-failure handler never reads the caught error, so genuine save failures report with no diagnostic detail.

---

## P3 — Polish / optimization

- `folder_tree.txt` — a 3.4MB UTF-16 `tree` dump in `kitabwalah-admin/` root, not covered by `.gitignore`; will bloat repo history once git exists (see P1-14).
- Root-level reference PDFs/txt dumps (`kitabwalah_admin_portal.pdf`, `kitabwalah_schema.pdf`, `usedbooks_schema.pdf`, `pdf_content.txt`) with nothing to exclude them once git exists.
- 2FA QR-code label shows the admin's bare numeric user ID instead of a human-readable identifier (email/phone/display name).
- Misleading comment in `redis.service.ts` claiming its error-swallowing "matters in AUTH_DEV_BYPASS mode" — it isn't actually gated by the flag at all, unlike the genuinely-gated logic elsewhere.
- `AUTH_COOKIE_NAME` constant is actually a `localStorage` key name, not a cookie name (the real httpOnly refresh cookie has a different name) — internally consistent everywhere it's used, just a misleading name for future readers.
- Fire-and-forget logout: if the server-side revoke call fails, the local session still clears silently, leaving the old refresh cookie valid server-side until its natural 30-day expiry.
- Stale checked-in docs (`docs/evidence/stores.md`, `docs/evidence/routes.md`) describe an outdated implementation (Zustand instead of the actual Context+useState pattern; action names that no longer exist) — either update or delete them.
- `main.ts`: unused `eslint-disable-next-line no-console` directive; unawaited floating `bootstrap()` promise (warning-level only).
- No dedicated permission gate on `GET /map/markers` — any authenticated admin role (including `support`) can view live courier GPS coordinates; may be intentional, worth a deliberate decision.
- TOTP replay: the same valid 6-digit code can be used more than once within its ~30-90s validity window (only `last_used_at` is recorded, not the specific time-step consumed).
- Refresh-token rotation doesn't independently check `is_banned`/`is_active` before issuing a new access token (downstream `jwt.strategy.ts` catches it on the next request anyway, so low real-world impact).
- Inconsistent bcrypt cost factors (12 for passwords, 10 for 2FA backup codes) — not a vulnerability, just worth normalizing.
- No explicit `onDelete` behavior declared anywhere in the 19-model Prisma schema — currently harmless (nothing hard-deletes), but implicit rather than deliberate.
- 74 ESLint warnings in the frontend, almost all unused `lucide-react` icon imports — each one is a fingerprint of an abandoned feature (e.g. unused `Edit`/`Plus` in `ProductsSection` — no Edit/Add-Product button exists; unused `Eye` + dead `selectedRequest` state in `ReturnsSection` — a "view proof in detail" feature was started and abandoned).
- Stale evidence docs (`docs/evidence/lint_output.txt`, `typecheck_output.txt`) are dated days before the most recent component edits and no longer reflect current source — don't trust them as a QA gate without re-running.
- Dangling reference in the mock fixtures themselves: a pincode references a city id that doesn't exist in `mockCities` (harmless today only because the city name is duplicated inline rather than looked up).
- `SchemaRefSection` headline claims "46 Models | 30 Enums" but its own hardcoded arrays only enumerate 15 models and 9 enums.
- `next.config.ts`'s `next/image` remote-pattern whitelist doesn't include the domain mock data actually uses (`images.unsplash.com`) — irrelevant today since every section uses raw `<img>`, but would break immediately if migrated to `next/image` as the lint warnings suggest doing.

---

## Mock-vs-Real ground truth (all 24 rendered views)

Refined per the frontend-components audit: "mock" is not monolithic — most mock sections are *honestly* mock (data flows consistently through `useAdminStore`, mutations persist for the session, nothing is fabricated), but a few are actively broken (present a working UI that either does nothing or invents data).

| Section | Source | Verdict |
|---|---|---|
| Same-Day Analytics | `GET /analytics/same-day` | **REAL** |
| Live Map | `GET /map/markers` | **REAL** (see P1-6 caveat) |
| Login / auth flow | Real `/auth/*` calls | **REAL** |
| Dashboard | `useAdminStore()` mock | **MOCK — honest** (data self-consistent; mislabeled "Real-time" in nav copy) |
| Coupons, Banners, Users, Support & Issues, Returns, Reviews (see label caveat below), Delivery (read-only), App Settings, Notifications, Audit/Email/Migration Logs (read-only) | `useAdminStore()` mock | **MOCK — honest** |
| Vendors | `useAdminStore()` mock | **MOCK — honest, mostly** (KYC/commission/suspend wired correctly; "Default Platform Fee" card is a hardcoded string) |
| Withdrawals | `useAdminStore()` mock | **MOCK — honest but risky** (see P0-10: fake auto-filled UTR) |
| Orders | `useAdminStore()` mock | **MOCK — partially broken** (status/refund wired, but see P0-8 unbounded refund, P1-25 dead filter/fake invoice) |
| Products | `useAdminStore()` mock | **MOCK — partially broken** (approve/reject wired; see P0-7 fabricated city pricing) |
| Pincodes & Cities | `useAdminStore()` mock | **MOCK — partially broken** (COD/same-day toggles wired; see P1-23 dead buttons/fake status) |
| Homepage Pins | `useAdminStore()` mock | **MOCK — honest but error-prone** (wired correctly; unvalidated free-text reference IDs) |
| **Static Pages** | Local component state only | **BROKEN** (see P0-6 — zero persistence, fake success toast) |
| **Competitive Exams** | Read-only, no store mutators exist | **BROKEN** (see P0-9 — promises CRUD that structurally doesn't exist) |
| Schema Ref | Hardcoded literal arrays | **Static reference doc**, not data (own headline count is also wrong — see P3) |

**3 of 24 rendered views are genuinely real (backend-wired). Of the remaining 21 mock views, 2 are outright broken (fake persistence) and 3 more have a broken/fabricated sub-feature inside an otherwise-honest section.**

---

## Safest implementation order

1. **P0-1** (dev-server crash fix) — unblocks manual testing of everything else; zero risk, no dependencies.
2. **P0-10** (fake auto-filled UTR in Withdrawals) and **P0-8** (unbounded order refunds) — highest real-world stakes of any finding: these are financial-integrity gaps that must not survive into a real payout/refund backend. Fix independently of anything else; both are small, isolated, no dependencies.
3. **P0-6 / P0-7 / P0-9** (Static Pages fake persistence, Products fake city pricing, Exams promising CRUD it can't deliver) — each actively misleads a user right now with a working-looking UI that does nothing or lies; fix or clearly relabel before anyone relies on them.
4. **P0-5** (session-expiry redirect) — trivial, isolated, immediately improves testing reliability for the auth work that follows.
5. **P0-2** (AUTH_DEV_BYPASS scoping) — security-critical, isolated to `auth.service.ts`/`jwt.strategy.ts`; fix before building anything further on top of it.
6. **P1-10 → P1-12** (lint errors, `--fix`-in-script, CRLF corruption) — cheap, mechanical, establishes a trustworthy CI gate before more backend code lands.
7. **P0-3** (user-code sequence migration) + **P1-14** (git init) + **P1-13** (docker-compose, pending confirmation on the external-DB question) — all prerequisites for the real database arriving "in a few days"; do these before that happens, not after.
8. **P1-3 / P1-4 / P0-4** (missing controllers, empty stubs, per-section de-mocking) — the large buildout; sequence by actual admin usage priority. Do the honesty-labeling half of P0-4 (health badges, "real-time" claims) immediately and independently — it doesn't need to wait for the buildout.
9. **P1-16 / P1-17 / P1-18** (unify the two design systems, finish the primitive rollout across all 24 sections, fix modal accessibility/dismissal) — do this pass *together with* P0-4's per-section rewiring rather than before or after it, since both touch the same files.
10. **P1-8 / P1-9** (rate limiting, secret validation) — land before real user accounts and a real database exist.
11. **P1-1 / P1-2 / P1-5 / P1-6 / P1-7** (session/UX hardening) and **P1-19 → P1-25** (dead hooks, dead state, unused validation stack, dead buttons, confirmation-gating consistency) — can proceed in parallel with the P0-4 buildout since they're independent of which sections are mock vs. real.
12. **P2 / P3** — batch during a slower period or immediately before a release; none of these block other work.
