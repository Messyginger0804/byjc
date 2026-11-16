# Database and migrations

## Where things live
- Schema: `db/schema.js` (Drizzle ORM `drizzle-orm` ^0.45.2, PostgreSQL dialect).
- Config: `drizzle.config.js` (schema `./db/schema.js`, output `./db/migrations`). `drizzle-kit generate` loads without credentials; every other drizzle-kit command needs a database URL.
- Migrations: numbered SQL files in `db/migrations/`, journal at `db/migrations/meta/_journal.json`, snapshots `0000`, `0002`, `0005`, `0006` in `db/migrations/meta/`.
- Legacy-shaped test data: `db/fixtures/legacy-shaped.sql`, used by `scripts/verify-legacy-migration.mjs`.

## Making a schema change
1. Edit `db/schema.js`.
2. `npm run db:generate` (`drizzle-kit generate`) writes a new SQL file and snapshot.
3. Review the SQL. Some migrations are hand-written (`0001`, `0003`, `0004`); `0005` is a no-op that only records a snapshot after a hand-written repair, so later generation does not re-propose the change.
4. `npm run db:migrate` against a local database, then commit the SQL, snapshot and journal together.

`npm run db:push` and `npm run db:studio` also exist (`drizzle-kit push` / `studio`).

## How migrations are applied
- `npm run db:migrate` runs `scripts/run-migration.js`: it builds a `pg` pool from `getDatabaseConfig()` and calls the Drizzle migrator on `./db/migrations`.
- Migrations are applied by running that script; nothing in `package.json` or the `Dockerfile` runs them on build or start (`build` is `next build`, `postbuild` is `next-sitemap`, the production stage runs `node server.js`). `README.md` "Deployment Notes" says to migrate before promoting a deployment that has new migrations.
- `npm run db:migrate:prod` runs the same script after `scripts/with-prod-db.js`, which copies `PROD_DATABASE_URL` (from `.env.local`) into `DATABASE_URL` and `POSTGRES_URL` and throws if it is unset.
- Take a database backup before any deliberate migration of a deployed database, treat every deployed environment as holding real data, and never run migrations, seed scripts or destructive one-off scripts against one as a test; use the local database.
- CI (`.github/workflows/ci.yml`, job `migrations`) applies all migrations to a disposable PostgreSQL 16, then runs `scripts/verify-legacy-migration.mjs` against a second empty database. Unit tests and the build are a separate job (`test`).

## Journal ordering rule
Each new migration's journal `when` must be strictly greater than the previous entry's (maintainer note). The journal's `0001_add_updated_at_trigger` entry has an earlier `when` than `0000_friendly_jack_flag`, so file order alone is not a safe guide: read the last entry of `db/migrations/meta/_journal.json` and exceed its `when`.

## Connection setup (`src/lib/databaseConfig.js`)
- URL comes from `POSTGRES_URL` first, then `DATABASE_URL`; one must be set or it throws. Setting `POSTGRES_URL` to empty makes `DATABASE_URL` win (compose does this).
- Local hosts (`localhost`, `127.0.0.1`, `::1`, `db`) default to no TLS. Remote hosts always verify certificates; `sslmode=disable` or `no-verify` is rejected. Custom CA: `DATABASE_CA_CERT`, `DATABASE_CA_CERT_PATH` or `PGSSLROOTCERT`; `src/lib/supabaseCa.js` holds a bundled root CA certificate that `databaseConfig.js` uses for hosts under that certificate's domain when no CA is configured.
- `src/lib/db.js` creates the shared `pg` pool (max 10, 10 s statement timeout). It tolerates no URL at import time so `next build` works without a database.

## Local development database
`docker-compose.yml` defines `db` (PostgreSQL 16 Alpine, published on 127.0.0.1, port from `DB_PORT`, default 5432) and `app`, whose startup command runs `npm run db:migrate` then `npm run dev`. `npm run dev:local` starts only `db`, migrates, and runs `next dev -p 3002` on the host. The database variables are listed in `dev-scripts.md`; setup steps are in its "Local setup" section.

## Other notes
- Deployment-specific guidance is in `README.md` "Deployment Notes".
