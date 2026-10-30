# ORDERING-NEON-01

Scope: user-approved Neon migration and guest pickup API; no internal application changes.
Acceptance: server-owned pricing; persistent orders; idempotent submission; protected admin; no secrets committed.

Executed 2026-10-30:
- npm run build: PASS (client/server TypeScript + Vite).
- npm test: PASS, 6 tests, 0 failures.
- npm audit: PASS, 0 vulnerabilities.
- git diff --check: PASS (line-ending warnings only).
- Prior Vercel SQL query: 6 menu rows, 0 orders; schema/seed verified.

Initial build failed on an overly broad HTTP test request type. Request interface narrowed to used HTTP properties; final build passed. No check disabled.

BLOCKED: end-to-end deployed API verification; ADMIN_PASSWORD and SESSION_SECRET need operator entry in Vercel. No deployment performed. No DB order persistence/idempotency integration test executed. Unit boundary tests use request/response doubles, not a mocked database success.

Next: operator saves secrets, approves deployment, then validate guest order -> same-key retry -> admin login -> order status against deployed API and Neon. No payment gateway implemented.
