# Error log

Newest first. Format: signature, cause, fix, date.

## rate_limit.table_missing
- Cause: migration `0006` (table `rate_limit_buckets`) has not been applied to the target database. The rate limiter fails open, logs this once per process, and the app is unthrottled. Admin login fails closed with a 503 on other limiter or database errors.
- Fix: run `npm run db:migrate` (or `db:migrate:prod` after a backup) before promoting a deployment that includes new migrations. Source: `README.md` "Deployment Notes".
- Date: 2026-11-15

## rate_limit.proxy_unconfigured (rate-limited POSTs return 503, or admin locked out under TRUSTED_PROXY_PLATFORM=none)
- Cause: production has no trusted proxy configured for client IP, or `TRUSTED_PROXY_PLATFORM=none` puts all clients in one bucket so anonymous traffic can exhaust the admin login limit. `none` is ignored when `VERCEL` is set (logs `rate_limit.none_ignored`).
- Fix: set `TRUSTED_PROXY_PLATFORM=cloudflare` behind Cloudflare, or use a trusted proxy; use `none` only for local or proxy-less hosts. Source: `README.md` "Deployment Notes".
- Date: 2026-11-15

## Migration journal: 0001 when is earlier than 0000
- Cause: in `db/migrations/meta/_journal.json`, `0001_add_updated_at_trigger` has `when` 1748678400000, lower than `0000_friendly_jack_flag` (1777723905570). New migrations must have strictly increasing `when` values.
- Fix: give every new migration a `when` greater than the latest entry (currently `0006`, 1792348232777); do not rely on file order alone.
- Date: 2026-11-15

## Destructive script or migration run against a deployed environment
- Cause: a migration, seed or one-off script was run as a test against an environment that holds real data.
- Fix: treat every deployed environment as holding real data; test against the local docker database (`npm run dev:docker`) and take a backup before any deliberate production migration.
- Date: 2026-11-15
