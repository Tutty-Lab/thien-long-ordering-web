# Implementation record — WEB-001
Scope: independent customer storefront requested 2026-10-30. Existing approved harness/restaurant documents unchanged.
Decision: Vite React (existing project tooling familiarity), Vercel static hosting, Supabase Postgres/RPC. Next.js unnecessary for this static slice. No link to existing employee app database.
Acceptance: responsive catalog, categories/search, cart quantity controls, honest disconnected state, server-authoritative prices, atomic/idempotent order RPC, private order tables with RLS. Catalog uses 8 clearly provisional sample products until configured. Images: remote Unsplash placeholders; Google Fonts external stylesheet.
Reference URL currently returns “We can't find the url you entered”; visual equivalence cannot be verified.
Limitations: cloud deployment and SQL execution not verified; credentials/projects unavailable. Anonymous RPC requires production anti-abuse/rate limiting before public launch. No payment processing, fulfillment dashboard, delivery fee engine, loyalty ledger or order tracking yet. Contact collection not enabled. Reward/location controls are informational placeholders and should not imply account functionality.
