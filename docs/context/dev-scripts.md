# Dev commands, scripts and environment variables

All commands run from the repo root. Dependencies come from `npm ci` (`package-lock.json`).

## Local setup
`npm run dev:docker` (`scripts/dev-docker.sh`) runs `docker compose up --build app`: it starts the `db` service, then the `app` container, which generates `ADMIN_JWT_SECRET` and `BLOG_API_SECRET` (and an admin password, printed once) when unset, runs `npm run db:migrate`, and starts `npm run dev`. The app is on `APP_PORT` (default 3002).

## npm scripts (`package.json`)
- `dev`: `next dev`. `build`: `next build`; `postbuild` runs `next-sitemap`. `start`: `next start`.
- `dev:docker`: `scripts/dev-docker.sh`, runs the full stack (db + app) with `docker compose`, resetting the app's `node_modules` volume. `dev:docker:3002`: `scripts/dev-docker-port.sh`. `dev:local`: starts compose `db`, migrates, runs `next dev -p 3002` on the host.
- `lint`: `eslint src`. `test`: `vitest` (watch). `test:run`: `vitest run`. `test:coverage`: with 90% thresholds. `test:browser`: Playwright (`playwright.config.mjs`, `e2e/smoke.spec.js`). `lighthouse`: `lhci autorun` (`.lighthouserc.json`).
- `prepare`: `husky`. Hooks in `.husky/`: pre-commit `lint-staged` (`eslint --fix` on `*.{js,jsx}`), pre-push lint + `test:run` + build.
- Database: `db:generate`, `db:migrate`, `db:migrate:prod`, `db:push`, `db:studio` (see `db-migrations.md`).
- Content, each with a `:prod` variant that loads `scripts/with-prod-env.js` (maps `BLOG_API_BASE_URL_PROD` or `NEXT_PUBLIC_PROD_URL` to `BLOG_API_BASE_URL`, and `BLOG_API_SECRET_PROD` to `BLOG_API_SECRET`): `blog:create` (`create-blog.js`, takes a file path), `blog:update` (`update-blog.js`), `blog:feature` (`feature-blog.js`, `--slug` and `--slot`), `blog:migrate` (`migrate-blogs.js`, a legacy importer of MDX files from a `/content` directory that this repo no longer contains). These call the blog HTTP API with the shared secret.
- Jokes: `joke:add` / `joke:add:prod` (`add-joke.js`, setup and punchline args), `jokes:add-bulk` / `jokes:add-bulk:prod` (`add-jokes-bulk.js`, `--file`, `--dry-run`; documented in `README.md`), `db:seed-jokes` (`seed-jokes.js`). The `:prod` jokes variants load `scripts/with-prod-jokes.js`.

## How scripts get env
Scripts are run with `node --env-file=.env.local`, so values come from a local `.env.local` (gitignored via `.env*.local`). `:prod` variants add `--import=./scripts/with-prod-*.js` to remap to production values. Never print or commit env values.

## Other files under `scripts/`
`run-migration.js`, `verify-legacy-migration.mjs` (needs an empty throwaway database), `check-schema.js` and `create-indexes.js` (use `POSTGRES_URL` directly), `migrate-json-to-pg.cjs` (loads `blog.json`), `migrate-blogs.cjs`. `add-jokes-bulk.test.js` and `migrate-json-to-pg.test.js` run under Vitest.

## Environment variable names read by the code
- Database (how they are used: "Connection setup" in `db-migrations.md`): `POSTGRES_URL`, `DATABASE_URL`, `PROD_DATABASE_URL`, `DATABASE_SSL_MODE`, `DATABASE_CA_CERT`, `DATABASE_CA_CERT_PATH`, `PGSSLROOTCERT`.
- Auth: `ADMIN_JWT_SECRET`, `ADMIN_PASSWORD` (a bcrypt hash), `BLOG_API_SECRET`, `BLOG_API_SECRET_PROD`.
- Rate limiting: `TRUSTED_PROXY_PLATFORM` (`cloudflare` or `none`) and `VERCEL`; see "Rate limiting" in `app-architecture.md`. `VERCEL_ENV` is also read.
- Site and scripts: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PROD_URL`, `BLOG_API_BASE_URL`, `BLOG_API_BASE_URL_PROD`, `BLOG_POST_PATH`, `JOKES_API_BASE_URL`, `JOKES_FILE`, `JOKES_BULK_DELAY_MS`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`, `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`.
- Compose only: `DB_PORT`, `APP_PORT`.
- Tooling: `ANALYZE` (bundle analyzer), `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_PORT`, `NODE_ENV`, `NEXT_PHASE`.

In docker compose, `ADMIN_JWT_SECRET`, `BLOG_API_SECRET` and `ADMIN_PASSWORD` are generated at container start when unset (the password is printed once, only its hash is exported). Compose deliberately has no `env_file` and does not mount the repo root, so `.env.local` is not loaded into the container.
