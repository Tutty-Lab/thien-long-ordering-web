# ADMIN-STITCH-02

Task: correct admin visual fidelity to approved Stitch screens, retaining user-requested removal of workspace header, location tile, account footer and customer redirects; logout remains sidebar bottom.

Sources read: live Stitch MCP HTML 09e788c4531f4ced8f4c842aeb60f774; live screenshot exports 09e788, 564a7, c7b4f1. Existing HTML exports in ignored design/ retained. Primary #b51d04, active container #d9381e, background #faf8ff, neutral surfaces #f2f3ff, foreground #131b2e; Be Vietnam Pro unchanged. Replaced prior cream brand interpretation. Catalog metrics derive from loaded API items/categories; discount metric used instead of unsupported mockup best-seller statistic. No simulated revenue trends, payments, SMS, pickup deadline or unimplemented actions added.

Checks executed: npm run build PASS; npm test PASS 9/9; npm audit --audit-level=moderate PASS 0 vulnerabilities; git diff --check PASS (CRLF warnings only). Build retains nonfatal upstream Zod annotation warnings. No lint script present. Production visual verification pending. No database or API mutation changes.

Production browser verification: authenticated session rendered 3 actual orders, 6 actual menu items, 5 categories. Category filter Món chính reduced table to 2 items; populated edit dialog opened; Escape closed it without saving. Matched screenshot palette/composition against live Stitch. Authenticated writes and mobile viewport matrix not executed. Additional browser correction: reset native ghost-button fill in base layer; chart highlights actual peak count, not fixed mockup values.
