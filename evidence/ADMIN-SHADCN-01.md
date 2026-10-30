# ADMIN-SHADCN-01

Task: apply approved shadcn/ui migration and distinctive Thien Long admin styling.
Acceptance: actual registry components, brick/cream theme, responsive sidebar/bottom navigation, preserved authenticated API calls, no preview bypass.

Official shadcn CLI generated components in src/components/ui. Tailwind v4 Vite plugin; Radix interaction primitives. Theme imports omit global preflight to preserve customer storefront; scoped component border reset uses base layer before utilities. Existing admin stylesheet replaced with layout/brand composition. No API, credential or database changes.

Executed: npm run build PASS (frontend and server TypeScript, Vite); npm test PASS 9/9; npm audit --audit-level=moderate PASS 0 vulnerabilities; git diff --check PASS. Zod Rollup annotation warnings remain nonfatal. Local browser login rendered and border/reset collision corrected. Authenticated admin writes and full responsive browser matrix not verified without an operator session. No lint script configured.

Production release: pending deployment verification.

Release verification: production /admin returned HTTP 200 and index-Dl_CWT1g.js (matching local build). Existing authenticated browser session loaded 3 real orders, 6 real menu items and 5 categories. Opened populated shadcn edit Dialog and cancelled without writing. Screenshot: ignored design/admin-shadcn-production.png. Full mobile matrix and authenticated mutations remain untested. Initial diff check found trailing blank line; corrected in d12945a and rerun PASS.
