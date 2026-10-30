# Thiên Long Ordering Web

Customer pickup storefront. React + TypeScript + Vite. Separate from the internal restaurant application.

## Development

```sh
npm ci
npm run dev
npm run build
```

## Vercel

Import this repository. Framework: Vite. Root directory: repository root. Build: `npm run build`. Output: `dist`. No environment variables are required for the current UI preview. `vercel.json` provides SPA routing.

## Current status

Catalog and discounts are local sample data. Checkout submission is disabled. `/admin` contains sample management screens without authentication; do not enter real customer data. Supabase order creation, admin authorization and payment integration are not connected. The SQL under `supabase/` is an older draft, not a migration approved for the current EUR pickup flow; do not apply it to production.

Translations use react-i18next; animation uses Motion. Mobile layout includes safe-area support and a standalone manifest, without offline ordering support.
