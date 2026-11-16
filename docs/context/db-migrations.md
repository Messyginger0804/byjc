# Database and migrations

## Where things live
- Schema: `db/schema.js` (Drizzle ORM `drizzle-orm` ^0.45.2, PostgreSQL dialect).
- Config: `drizzle.config.js` (schema `./db/schema.js`, output `./db/migrations`). `drizzle-kit generate` loads without credentials; every other drizzle-kit command needs a database URL.
- Migrations: `db/migrations/0000_...` to `0006_chunky_moondragon.sql`, journal at `db/migrations/meta/_journal.json`, snapshots `0000`, `0002`, `0005`, `0006` in `db/migrations/meta/`.
- Legacy-shaped test data: `db/fixtures/legacy-shaped.sql`, used by `scripts/verify-legacy-migration.mjs`.

## Making a schema change
1. Edit `db/schema.js`.
2. `npm run db:generate` (`drizzle-kit generate`) writes a new SQL file and snapshot.
3. Review the SQL. Some migrations are hand-written (`0001`, `0003`, `0004`); `0005` is a no-op that only records a snapshot after a hand-written repair, so later generation does not re-propose the change.
4. `npm run db:migrate` against a local database, then commit the SQL, snapshot and journal together.

`npm run db:push` and `npm run db:studio` also exist (`drizzle-kit push` / `studio`).

## How migrations are applied
- `npm run db:migrate` runs `scripts/run-migration.js`: it builds a `pg` pool from `getDatabaseConfig()` and calls the Drizzle migrator on `./db/migrations`.
- Nothing in `package.json` runs migrations on build or start: `build` is `next build` and `postbuild` is `next-sitemap`. The `Dockerfile` production stage only runs `node server.js`. `README.md` "Deployment Notes" says to migrate before promoting a deployment that has new migrations.
- Production: `npm run db:migrate:prod` runs the same script after `scripts/with-prod-db.js`, which copies `PROD_DATABASE_URL` (from `.env.local`) into both `DATABASE_URL` and `POSTGRES_URL` and throws if it is unset. `README.md` says to back up the database first.
- (maintainer note) After merging schema changes to `main`, take a `pg_dump` backup and run `db:migrate:prod`; `PROD_DATABASE_URL` must be the direct (non-pooled) connection URL. Production is Supabase Postgres 17, and the journal was baselined on 2026-11-06 with 0000 to 0006 applied.
- CI (`.github/workflows/ci.yml`, job `migrations`) applies all migrations to a disposable PostgreSQL 16, then runs `scripts/verify-legacy-migration.mjs` against a second empty database.

## Journal ordering rule
(maintainer note) Keep each new migration's journal `when` strictly greater than the previous one. The journal currently shows `0001_add_updated_at_trigger` with `when` 1748678400000, earlier than `0000_friendly_jack_flag` at 1777723905570; `0002` onward increase (`0003` and `0004` differ by 1). A new entry must exceed 1792348232777 (`0006`).

## Connection setup (`src/lib/databaseConfig.js`)
- URL comes from `POSTGRES_URL` first, then `DATABASE_URL`; one must be set or it throws. Setting `POSTGRES_URL` to empty makes `DATABASE_URL` win (compose does this).
- Local hosts (`localhost`, `127.0.0.1`, `::1`, `db`) default to no TLS. Remote hosts always verify certificates; `sslmode=disable` or `no-verify` is rejected. Custom CA: `DATABASE_CA_CERT`, `DATABASE_CA_CERT_PATH` or `PGSSLROOTCERT`; one hosted provider's root CA is bundled in `src/lib/supabaseCa.js`.
- `src/lib/db.js` creates the shared `pg` pool (max 10, 10 s statement timeout). It tolerates no URL at import time so `next build` works without a database.

## Local development database
`docker-compose.yml` defines `db` (PostgreSQL 16 Alpine, published on 127.0.0.1, port from `DB_PORT`, default 5432) and `app`, whose startup command runs `npm run db:migrate` then `npm run dev`. `npm run dev:local` starts only `db`, migrates, and runs `next dev -p 3002` on the host. See `dev-scripts.md`.

## Other notes
- `README.md` still names Neon as the database provider; treat the maintainer note above and the code as current.
- (maintainer note) Vercel Preview deployments share the production database, so a preview that runs code against a schema ahead of or behind prod affects real data.
