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
