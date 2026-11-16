# Error log

Format: signature, cause, fix, date. Policies and quirks that are not failures live in the topic docs.

## rate_limit.table_missing
- Cause: the migration that creates `rate_limit_buckets` has not been applied to the target database. Routes using the default limiter options fail open (no throttling) and log this once per process; admin login fails closed (503). See "Rate limiting" in `app-architecture.md`.
- Fix: run `npm run db:migrate` (see `db-migrations.md`). Source: `README.md` "Deployment Notes".
- Date: 2026-11-15

## rate_limit.proxy_unconfigured
- Cause: `NODE_ENV=production` with no trusted client-IP source configured, so the limiter throws and rate-limited POSTs return 503 "Unable to establish trusted client identity". Mechanism and settings: "Rate limiting" in `app-architecture.md`.
- Fix: configure a source as described there; see `README.md` "Deployment Notes" for deployment-specific guidance.
- Date: 2026-11-15
