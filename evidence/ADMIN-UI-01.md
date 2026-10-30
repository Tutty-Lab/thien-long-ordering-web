# ADMIN-UI-01 evidence

Task: implement local admin UI from existing Stitch mockups; preserve current API authorization.
Acceptance: login and admin shell match source design hierarchy; overview/order/menu/restaurant navigation; responsive mobile navigation; no fabricated live statistics; preview clearly labeled and dev only.

Source: Stitch MCP list_screens and download_file executed 2026-10-30; four source screen IDs in README. Reused Be Vietnam Pro and Lucide; no new framework.

Executed:
- npm run build: PASS (TypeScript frontend/backend; Vite).
- npm test: PASS, six backend boundary/session/validation tests; not UI coverage.
- Browser Edge desktop: overview rendered with sidebar, metrics, hourly chart and queue.
- In-app browser mobile 531px: overview, orders and menu rendered; menu category filter selected Main and returned two matching items. DOM geometry check: scrollWidth=531, viewport=531, zero elements extending past viewport.
- Mobile order detail/status control: visible; preview mutation disabled.
- Built output served through vite preview on port 5175: /admin?preview=1 rendered LOGIN, not dashboard. No dev preview link. Authentication remained required.
- A browser category click timed out after hot reload reset the selected page. Opened menu again, reran successfully; no app check bypassed.

Screenshots (local ignored design folder): admin-desktop-local.png, admin-mobile-local.png.

Limits: live login/order mutation not retested; local Vite UI has no server API. Read-only menu and restaurant information; no menu editing, SMS, payments or configuration API. No production deployment for this UI change.
