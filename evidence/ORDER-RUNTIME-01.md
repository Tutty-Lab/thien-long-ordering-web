# ORDER-RUNTIME-01

Scope: repair empty public catalog behavior, add actual loopback API adapter, periodic admin order refresh. No payment/SMS integrations or production test writes.

Executed build PASS (both TypeScript checks and Vite); tests PASS 11/11 including empty menu/null discounts/invalid payloads; npm audit PASS 0 vulnerabilities; git diff --check PASS. Local HTTP checks on port 5175: storefront 200, session JSON 200, menu JSON 503 (development DB unavailable), unauthorized admin 401, malformed JSON 400. This is not a successful local DB integration test. Production DB credentials not accessed. Authenticated persistence round trips remain unverified.

Local setup documented in README. Test listener uses port 5175, real app dev listener port 5174. Production API handler unchanged; dev adapter strips Secure cookie attribute only for loopback HTTP and rejects non-loopback Host. Production release and DB write verification are separate evidence.
