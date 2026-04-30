# Handoff: Database ORM + Jokes + Comments + Admin Login
**Date:** 2026-04-22  
**Branch:** `feature/database-orm-jokes-comments`

---

## Task Summary
Adding Drizzle ORM, `is_featured` to blogs, a comments table, a private jokes table with JC-star, and a simple admin login page to manage jokes from the website.

---

## Completed

- Created branch: `feature/database-orm-jokes-comments`
- Added `db:generate`, `db:push`, `db:studio` scripts to `package.json`
- Created `db/schema.js` — Drizzle schema for blogs (w/ is_featured), comments, jokes tables
- Created `drizzle.config.js` — drizzle-kit config (dialect: postgresql, schema: ./db/schema.js)
- Created `src/lib/drizzle.js` — Drizzle db instance wrapping existing pg pool
- Created migration SQL files:
  - `db/migrations/001_add_is_featured.sql`
  - `db/migrations/002_add_comments.sql`
  - `db/migrations/003_add_jokes.sql`
- Updated `db/init.sql` — full schema including all new tables/columns (for fresh Docker setups)
- Updated `src/app/api/blogs/route.js` — POST accepts `is_featured`, GET returns `is_featured`
- Updated `src/app/api/blogs/[slug]/route.js` — both SELECTs now include `is_featured`
- Updated `scripts/create-blog.js` — reads `featured: true` from frontmatter → sends as `is_featured`
- Created `src/lib/adminAuth.js` — JWT helpers (`signAdminToken`, `verifyAdminToken`, `requireAdminSession`, `setAdminCookie`, `clearAdminCookie`) using `jose` + `bcryptjs`
- Updated `src/proxy.js` — merged admin auth guard for `/admin/*` routes
- Created `src/app/api/comments/[blogSlug]/route.js` — GET + POST (instant publish, 60s dupe guard)
- Created `src/app/api/jokes/route.js` — GET all + POST new (admin protected)
- Created `src/app/api/jokes/[id]/route.js` — DELETE (admin protected)
- Created `src/app/api/jokes/[id]/star/route.js` — PATCH toggles `jc_starred` (admin protected)
- Created `src/app/api/admin/login/route.js` — bcrypt compare against `ADMIN_PASSWORD` env var, sets JWT cookie
- Created `src/app/api/admin/logout/route.js` — clears `admin_session` cookie
- Created `src/app/admin/login/page.js` — login UI (dark theme, yellow CTA)
- Created `src/app/admin/jokes/page.js` — jokes management (list, add form, ★ star, ✕ delete)
- Verified: `npm run build` passes clean

---

## Next Action

User needs to add 2 env vars to `.env.local`, then run the 3 migration SQL files against the DB.

**Generate bcrypt hash for password:**
```bash
node -e "import('bcryptjs').then(b => b.default.hash('YOUR_PASSWORD', 10).then(console.log))"
```

**Add to `.env.local`:**
```
ADMIN_JWT_SECRET=some-random-32-plus-char-string
ADMIN_PASSWORD=<bcrypt hash output from above>
```

---

## Remaining Work

1. **Run DB migrations** against local Docker postgres:
   ```bash
   docker exec -i <db-container> psql -U byjc -d byjc < db/migrations/001_add_is_featured.sql
   docker exec -i <db-container> psql -U byjc -d byjc < db/migrations/002_add_comments.sql
   docker exec -i <db-container> psql -U byjc -d byjc < db/migrations/003_add_jokes.sql
   ```
   OR use: `npm run db:push` (requires `DATABASE_URL` in env)

2. Run same migrations against **Neon (production)** once tested locally

3. **Git commit** all changes on this branch

4. *(Future/separate task)* Wire up comment display on blog detail page UI

5. *(Future/separate task)* Optionally migrate existing blog API queries to use Drizzle query builder

---

## Key Context

| Item | Value |
|---|---|
| Branch | `feature/database-orm-jokes-comments` |
| Project root | `/home/messyginger0804/byjc` |
| Stack | Next.js 16.2 (App Router), PostgreSQL (Docker local + Neon prod), Drizzle ORM, jose, bcryptjs |
| Build command | `npm run build` |
| DB schema (Drizzle) | `db/schema.js` |
| DB schema (raw SQL) | `db/init.sql` (used by Docker on fresh init) |

---

## Critical Gotchas

- **Next.js 16 uses `src/proxy.js` as middleware, NOT `src/middleware.js`.** Creating `middleware.js` broke the build. Admin route protection was merged into the existing `proxy.js`. Do not create a `middleware.js` file in this project.
- Admin cookie name: `admin_session` (HTTP-only, secure in prod, 7-day expiry)
- Admin routes: `/admin/login` (public), `/admin/jokes` (protected by proxy.js)
- Jokes are **private (admin only)** — no public jokes page (user decision)
- Comments **publish instantly** — no moderation (user decision)
- `is_featured` is a simple boolean, separate from `featured_slot` (the home page carousel system)
- `requireAdminSession()` is async — must be `await`ed in route handlers
- `vitest` is not installed in this project (pre-existing gap, not introduced here)
- All files use ESM syntax — project is `"type": "module"`

---

## Blog Frontmatter Reference

```yaml
---
title: My Post
description: A great post
publishedAt: 2026-05-01        # scheduled publish — already worked before this branch
featured: true                 # NEW: sets is_featured = true in DB
featuredSlot: featured-main    # optional: places in home page carousel slot
---
```
