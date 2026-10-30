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
