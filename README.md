# Thiên Long Ordering Web

React + TypeScript + Vite, Vercel Functions, Neon PostgreSQL. Customer pickup storefront; separate internal restaurant application.

## Install and verify

```sh
npm ci
npm run build
npm test
npm audit
```

## Development

`npm run dev` starts the UI only. Vite does not execute Vercel Functions: checkout remains unavailable when the API cannot load. For full local API development, use the official Vercel CLI (`npx vercel dev`) after linking this project. Supply development-only environment variables through a local ignored `.env.local` or shell environment. Never copy production credentials into an agent context.

Server variables: `DATABASE_URL` (Neon PostgreSQL), `ADMIN_PASSWORD` (minimum 12 characters), `SESSION_SECRET` (at least 32 random characters). Username is `admin`; no user table. No default password. Set these as Vercel secrets for the intended environments. Admin login uses an eight-hour signed HttpOnly Secure SameSite=Strict cookie. Local login requires HTTPS or a browser that supports Secure cookies on localhost.

## Database

With a non-production `DATABASE_URL` already supplied to the process:

```sh
npm run db:migrate
```

This applies `db/001_neon.sql` transactionally, then inserts six sample menu items without overwriting existing IDs. Seed insertions are resumable. Back up before future schema changes. Older `supabase/` files are historical drafts; do not apply them.

## API

All routes use `/api/index?action=...`:

| Method | action | Behavior |
|---|---|---|
| GET | menu | Available catalog, server prices |
| POST | orders | Guest order, UUID idempotency key, server-calculated total |
| GET | session | Authentication status |
| POST | login | Admin login, database-backed rate limit |
| POST | logout | Clear cookie |
| GET | admin-orders | Authenticated latest 200 orders |
| PATCH | admin-orders | Authenticated `{id,status}` update |

Order body: `{key,name,phone,address,note,items:[{id,quantity}]}`. Repeat the same key and payload to retry safely; changed payload returns 409. Prices come from PostgreSQL, never browser input. No online payment processing. Statuses: NEW, PREPARING, READY, DONE, CANCELLED; admin may correct any status.

## Vercel

Framework Vite; repository root; build `npm run build`; output `dist`. `vercel.json` preserves API routes and handles SPA routes. Configure Neon and server secrets before deployment. Production deployment requires explicit approval.

## Limits

No automated deployed E2E verification yet. Tests cover validation, session integrity, unauthenticated access, cross-origin rejection and fail-closed missing DB. These do not prove a deployed order round trip. Menu preview falls back to local samples when API is unavailable; checkout stays disabled. Admin currently manages order status only. No menu editor, payments, automatic refresh, session revocation store or retention job. Rate-limit rows require eventual cleanup; missing client IP shares a conservative bucket. Customer data needs retention/access policies before public launch.

## Admin UI local (ADMIN-UI-01)

- `/admin`: actual login; requires the Vercel API environment for authentication and orders.
- `/admin?preview=1`: development-only visual preview with clearly labeled synthetic orders. All DB mutations disabled. Run `npm run dev -- --port 5174` then open `http://127.0.0.1:5174/admin?preview=1`.
- Build mode ignores `preview=1` and requires authentication. Preview is not a deployed authentication bypass.
- Overview derives totals from at most 200 loaded orders; completed order value is not payment settlement or accounting revenue. Dates use Europe/Berlin.
- Order search, status filtering, selection and actual authenticated status updates are connected to existing endpoints. Menu/category search is read-only; restaurant information is read-only. No SMS, menu mutation or settings mutation is claimed.
- Design references fetched directly through Stitch MCP: project `13359882500035204561`, overview `09e788c4531f4ced8f4c842aeb60f774`, orders `c7b4f1b31f4d40ce9688fd63cbea17d3`, menu `564a7c7fd85640778746c7f7eb1cddac`, login `37767919fc3b467ea2a84360d689ee32`.

## Admin management (ADMIN-UI-02)

Implemented catalog editing (name, description, category, HTTPS image URL, integer-cent prices, optional discount, availability), item creation, category creation, restaurant contact/preparation settings. Native modal dialogs preserve focus and trap keyboard interaction. Existing authenticated server routes enforce permissions before DB access; Zod validates all mutations. No image upload service: supply an HTTPS image URL. No hard delete endpoint.

Run `npm run db:migrate` with a non-production DATABASE_URL already set to apply additive migration `db/002_admin.sql`. Then run the Vercel API environment to exercise live persistence. Migration has not been applied to production by this UI task.

API additions: GET/POST/PUT `admin-menu`; GET/POST `admin-categories`; GET/PUT `admin-settings`; public GET `restaurant`. All admin endpoints require session. Menu price edits affect future orders; stored order snapshots remain unchanged. Newly used categories appear on the storefront; public header reads restaurant name/address after reload. Preparation duration is informational only; hours and ordering-window enforcement are not implemented.

DEV `/admin?preview=1` can edit synthetic data in component memory, with explicit preview labels and sample-save buttons. No API mutation is made in preview. Navigating away/reloading resets local sample changes. Production still requires login.

No settings for SMS, online payment, tax accounting, ingredient options, allergens, opening hours, category reordering/deletion or file upload are claimed. Last-write-wins applies to concurrent admin edits; audit/version history remains future work.

## Production admin update (ADMIN-PROD-01)

Supersedes local preview instructions above: admin preview disabled, including in development; `/admin?preview=1` requires authentication. Production admin uses real API data. Removed workspace header, location tile, customer-site link and profile footer. Logout resides at sidebar bottom (fifth bottom-nav action on mobile).

Migration 002 applied through authenticated Vercel Neon Query editor on 2026-10-30 using individually verified idempotent statements. Readback: 5 categories, 1 restaurant settings record, 6 menu items. SQL editor returned to read-only mode. No menu/order rows overwritten. Actual authenticated admin save/readback still needs session verification; migration/read-only API smoke checks do not prove that workflow.

## Local frontend + API (ORDER-RUNTIME-01)

`npm run dev` now starts the actual Vercel handler behind a Node HTTP adapter plus Vite, bound to `127.0.0.1:5174`. `PORT=5175` can select another port (PowerShell: `$env:PORT='5175'`). `npm run dev:ui` runs frontend only and cannot process orders.

Supply a separate development Neon database in ignored `.env.local`: `DATABASE_URL`, `ADMIN_PASSWORD` (12+ characters), `SESSION_SECRET` (32+ characters). Do not copy production secrets. Apply migrations with `npm run db:migrate` after explicitly loading the development DATABASE_URL into the shell; the migration command does not load .env.local itself. Restart dev server after env edits. Local HTTP cookies omit Secure only inside the loopback adapter; production cookie attributes remain unchanged. API validates Host and Origin; JSON body limit 64 KiB.

Menu now starts empty, validates the server payload, handles an empty menu as authoritative, and reports load failure instead of showing sample food. Admin refreshes orders every 15 seconds while visible; this is polling, not SignalR/WebSocket delivery. Failed refresh displays error; session expiry returns to login. It does not run while a mutation is busy.

## Local login (LOCAL-LOGIN-01)

The loopback adapter explicitly accepts an operator-configured password of 6+ characters; the deployed handler retains its 12-character minimum. Local credentials belong in ignored `.env.local` (`ADMIN_PASSWORD`, `SESSION_SECRET` with 32+ characters). Restart `npm run dev` after changes. Local and deployed sessions use separate signing secrets. This workstation currently connects to the production DB by operator request: edits affect live data. Do not run migrations or seeds for connection testing. Login attempts update DB rate-limit counters.

## Dashboard and checkout (ADMIN-REFINE-04)

Dashboard uses shadcn Chart/Recharts, Cards and an Input date selector. Authenticated `GET /api/index?action=admin-summary&date=YYYY-MM-DD` aggregates all orders created within the selected Europe/Berlin calendar day, including DST boundaries; totals reflect current order statuses, not an immutable historical accounting snapshot. No 200-row limit applies to this aggregation. Operational order lists still load the latest 200 orders. Checkout now uses shadcn Dialog, Input, Label and Button, with a success view inside the same dialog. No live test orders were created during UI verification.

## Image uploads and compact admin (ADMIN-IMAGE-05)

Menu editor accepts local PNG/JPEG/WebP files up to 10 MB. Browser resizes to 960 px, compresses to WebP <=128 KiB; server independently decodes with sharp, limits decoded pixels to 16 million, strips metadata by re-encoding, enforces 128 KiB. The complete image data is stored as a Base64 data URI in the existing PostgreSQL `menu_items.image` text column; no Blob service or schema migration. Legacy HTTPS images remain usable. Public menu returns an image endpoint for stored images, keeping image bytes out of the catalog JSON. Images are public only for available items. Admin image save uses the existing authenticated menu mutation. Replacing an image replaces the existing stored bytes; no orphan files. JSON local adapter cap is 256 KiB for admin-menu, otherwise 64 KiB. Existing menu edits no longer overwrite availability; use the table Switch. New items default to available.

Verify: `npm test`, `npm run build`, `npx tsx scripts/verify-db-image.ts`. The last command uses .env.local and inserts/reads/deletes an unavailable verification row in one atomic transaction, leaving no persistent test row. No migrations or seed required. Orders paginate six at a time within the latest 200 records returned by the current API; older history beyond that remains a separate server-pagination task.
