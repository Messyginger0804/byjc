# Handoff: Documentation Review & Update
**Date:** 2026-04-24
**Branch:** `jc`

---

## Task: Documentation review & update for Blogs by JC

### Completed:
- Explored full codebase with parallel agents
- Read all existing docs: README.md, docs/api-reference.md, reddis.md, memory-bank handoff
- Read key source files: db/schema.js, src/lib/db.js, src/lib/adminAuth.js,
  src/lib/blogApiAuth.js, src/app/api/admin/login/route.js, package.json
- Wrote and received approval for plan at:
  /home/messyginger0804/.claude/plans/can-you-review-this-snappy-key.md
- **NO files have been modified yet — execution was interrupted before starting**

---

## Next Action:
Start executing — write all 4 doc changes (no more research needed, all facts are known):
1. Update `/home/messyginger0804/byjc/README.md`
2. Update `/home/messyginger0804/byjc/docs/api-reference.md`
3. Create `/home/messyginger0804/byjc/docs/local-dev-setup.md`
4. Move `reddis.md` → `docs/ai-integration-notes.md` (copy content, add header, delete original)

---

## Remaining Work:
1. **README.md** — fix Features, Technologies, Future Plans, add Quick Start link, remove stale Contentlayer challenges
2. **docs/api-reference.md** — add 8 missing endpoints + comments/jokes schema tables
3. **docs/local-dev-setup.md** — create from scratch (env vars, Docker, migrations, scripts, gotcha)
4. **docs/ai-integration-notes.md** — move reddis.md here with a "design sketch, not implemented" header
5. Delete `reddis.md` from repo root

---

## Critical Technical Facts

### Environment Variables (from source)
| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (Neon prod / Docker local) |
| `BLOG_API_SECRET` | Protects POST/PATCH blog endpoints |
| `ADMIN_JWT_SECRET` | 32+ char string for JWT signing |
| `ADMIN_PASSWORD` | bcrypt hash of admin password |
| `NEXT_PUBLIC_SITE_URL` | Public site base URL |
| `NEXT_PUBLIC_PROD_URL` | Production URL |

### Auth
- **Blog API auth:** header is `x-blog-secret: <secret>` OR `Authorization: Bearer <secret>`
- **Admin auth:** cookie-based JWT named `admin_session` (7-day, HTTP-only, set on login)
- **Admin password setup:**
  ```bash
  node -e "import('bcryptjs').then(b => b.default.hash('YOUR_PW', 10).then(console.log))"
  ```

### CRITICAL GOTCHA
`src/proxy.js` is the Next.js 16 middleware — do **NOT** create `src/middleware.js` (breaks build).

---

## Missing Endpoints (not in current api-reference.md)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/comments/[blogSlug]` | None | Fetch comments for a blog |
| POST | `/api/comments/[blogSlug]` | None | Submit comment, instant publish, 60s dupe guard |
| GET | `/api/jokes` | Admin cookie | List all jokes |
| POST | `/api/jokes` | Admin cookie | Create joke |
| DELETE | `/api/jokes/[id]` | Admin cookie | Delete joke |
| PATCH | `/api/jokes/[id]/star` | Admin cookie | Toggle `jc_starred` |
| POST | `/api/admin/login` | None | Sets `admin_session` JWT cookie |
| POST | `/api/admin/logout` | None | Clears `admin_session` cookie |

---

## Database Schema (for docs)

### comments
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | PK |
| blog_id | INTEGER | FK → blogs.id (cascade delete) |
| name | TEXT | NOT NULL |
| body | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### jokes
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | PK |
| setup | TEXT | NOT NULL |
| punchline | TEXT | NOT NULL |
| jc_starred | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### blogs — addition missing from existing docs
- `is_featured` BOOLEAN DEFAULT false (separate from `featured_slot`)

---

## Blog Frontmatter Reference
```yaml
---
title: My Post
description: A great post
publishedAt: 2026-05-01
featured: true          # sets is_featured = true
featuredSlot: featured-main   # optional: places in home page carousel slot
---
```

---

## All npm Scripts
| Script | Purpose |
|---|---|
| `dev` | Start dev server |
| `build` | Next.js build + sitemap |
| `start` | Start production server |
| `lint` | ESLint src/ |
| `test` / `test:run` | Vitest (not yet written) |
| `blog:create` | Create blog from local .md file |
| `blog:create:prod` | Create blog against prod env |
| `blog:migrate` | Migrate blogs to DB |
| `blog:migrate:prod` | Migrate blogs to prod DB |
| `blog:feature` | Assign blog to featured slot |
| `blog:feature:prod` | Assign featured slot in prod |
| `db:generate` | Generate Drizzle migrations |
| `db:push` | Apply migrations to DB |
| `db:studio` | Open Drizzle Studio UI |
| `db:seed-jokes` | Seed jokes table from JSON |
| `lighthouse` | Run Lighthouse CI |
| `prepare` | Husky git hooks setup |

---

## README Future Plans (still valid, not yet built)
- Image uploads via cloud storage
- Full admin CRUD for blog posts (currently create-only via CLI scripts)
