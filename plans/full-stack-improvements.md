# Full Stack Improvements Plan

## Goal
Harden security, improve performance, clean up dead code, fix database design, and establish CI/CD for the `blogs-by-jc` Next.js 16 blog/portfolio app.

---

## Phase 1: Security Hardening (P0 — Do First)

### Step 1.1 — Wire Up Middleware for Admin Route Protection
**Files:** `src/middleware.js` (new), `src/proxy.js`

The `proxy.js` file exports a `proxy` function and `config` matcher but is never imported anywhere. Admin routes (`/admin/*`) have zero middleware-level JWT protection.

- Create `src/middleware.js` that re-exports the proxy function
- Verify the matcher correctly excludes static assets, API routes, and Next internals
- Test that `/admin/jokes` and `/admin/login` redirect to login when unauthenticated

**Verification:** `curl -I localhost:3000/admin/jokes` should return 302 to login page.

### Step 1.2 — Add Rate Limiting to Admin Login
**Files:** `src/app/api/admin/login/route.js`, `src/lib/rateLimit.js`

The login endpoint has no rate limiting. An attacker can brute-force the admin password indefinitely.

- Import `checkRateLimit` from `src/lib/rateLimit.js`
- Add rate limit check at the top of the POST handler with a tight bucket (capacity: 5, refillPerSec: 1/30)
- Return 429 with a clear message when rate limited

**Verification:** Send 6 rapid POST requests to `/api/admin/login` — the 6th should return 429.

### Step 1.3 — Fix Timing-Unsafe Secret Comparison
**Files:** `src/lib/blogApiAuth.js`

`if (providedSecret !== expectedSecret)` leaks timing information enabling byte-by-byte secret recovery.

- Import `timingSafeEqual` from `node:crypto`
- Replace `!==` comparison with constant-time comparison using `Buffer`
- Handle length mismatch safely

**Verification:** Code review confirms `timingSafeEqual` is used.

### Step 1.4 — Stop Leaking Error Messages to Clients
**Files:** `src/app/api/blogs/route.js:147`, `src/app/api/blogs/[slug]/route.js:146`

Raw `err.message` from Drizzle/Postgres exposes table names, column names, and constraint names.

- Replace `err.message` with generic messages ("Failed to create blog", "Failed to update blog")
- Log full errors server-side only with `console.error`

**Verification:** Trigger a DB error; client receives generic message, server log shows full error.

### Step 1.5 — Move EmailJS Credentials to Environment Variables
**Files:** `src/components/Contact/ContactForm.js:20`

Service ID, template ID, and public key are hardcoded.

- Add `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` to `.env.local`
- Reference `process.env.NEXT_PUBLIC_EMAILJS_*` in the component
- Update `.env.vercel.local` with production values

**Verification:** Contact form still sends emails after the change.

### Step 1.6 — Fix Blog GET Error Handling (Return 500, Not 200)
**Files:** `src/app/api/blogs/route.js:69-72`

Returns `NextResponse.json([])` on DB failure — silent failure.

- Change the catch block to return `NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 })`

**Verification:** Stop the DB; `GET /api/blogs` should return 500 with error JSON.

---

## Phase 2: Database Fixes (P0 — Critical)

### Step 2.1 — Replace `ORDER BY RANDOM()` with Offset-Based Approach
**Files:** `src/app/api/jokes/random/route.js:16`

`ORDER BY RANDOM()` is O(n log n) — full table scan every request.

- Count total jokes, generate random offset, query with `.offset(offset).limit(1)`
- Handle edge case of 0 jokes gracefully

**Verification:** Query plan shows index scan, not sort.

### Step 2.2 — Add Composite Indexes for Hot Query Paths
**Files:** `db/schema.js`

Missing composite indexes on the most-queried paths:
- `blogs(is_published, published_at DESC)` — blog listing
- `blogs(featured_slot, published_at DESC) WHERE is_published = true` — blog of the month
- `comments(blog_id, created_at)` — comment listing

- Add these indexes to `db/schema.js` using Drizzle's `index()` function
- Generate and run a migration

**Verification:** `EXPLAIN ANALYZE` on the blog listing query shows index scan.

### Step 2.3 — Remove Redundant and Useless Indexes
**Files:** `db/schema.js`

- Remove `blogs_slug_idx` (redundant with UNIQUE constraint's implicit index)
- Remove `jokes_jc_starred_idx` (low-selectivity boolean, never queried alone)
- Replace `jokes_top10_rank_idx` with partial unique index `WHERE top10_rank IS NOT NULL`

**Verification:** `pg_indexes` shows the redundant indexes are dropped.

### Step 2.4 — Configure Connection Pool Properly
**Files:** `src/lib/db.js`

Current: `connectionTimeoutMillis: 0` (infinite hang), no `statement_timeout`.

- Set `max: 10`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000`
- Add `options: '-c statement_timeout=10000 -c idle_in_transaction_session_timeout=30000'`

**Verification:** A slow query (>10s) is killed automatically.

### Step 2.5 — Consolidate Migration Chaos
**Files:** `db/migrations/`, `db/schema.js`

Hand-written migrations (001-004) diverge from Drizzle schema. Migration 003 creates `jokes` with wrong columns (`title`, `body` instead of `setup`, `punchline`).

- Delete hand-written migrations 001-004
- Add CHECK constraints and partial indexes to `db/schema.js`
- Add `updated_at` trigger function
- Generate fresh baseline migration with `drizzle-kit generate`

**Verification:** Fresh `drizzle-kit push` creates the correct schema.

### Step 2.6 — Add `updated_at` Auto-Update Trigger
**Files:** `db/schema.js`, migration SQL

`updated_at` never auto-updates on UPDATE — only set in some routes manually.

- Create `update_updated_at()` PL/pgSQL trigger function
- Apply to `blogs` and `jokes` tables

**Verification:** UPDATE a blog row; `updated_at` changes automatically.

### Step 2.7 — Fix Nullable Timestamps and Dead Column
**Files:** `db/schema.js`

- Add `.notNull()` to `comments.created_at` and `blogs.published_at`
- Add CHECK constraint for `featured_slot` valid values
- Consider removing unused `is_featured` column (or document its purpose)

**Verification:** `drizzle-kit generate` produces the correct migration.

---

## Phase 3: Frontend Performance (P1)

### Step 3.1 — Remove Dead Dependencies
**Files:** `package.json`, `next.config.js`

`formik`, `react-hook-form`, `yup`, `@lottiefiles/dotlottie-react` are installed but never imported. `framer-motion` is referenced in config but not installed.

- Run `npm uninstall formik react-hook-form yup @lottiefiles/dotlottie-react`
- Remove `transpilePackages: ['framer-motion']` and `optimizePackageImports` entry from `next.config.js`
- Move `sharp` from devDependencies to dependencies
- Remove self-referencing `"blogs-by-jc": "file:"`
- Move `eslint` to devDependencies

**Verification:** `npm run build` succeeds; bundle size decreases.

### Step 3.2 — Lazy-Load ContactForm in FloatingContactButton
**Files:** `src/components/Contact/FloatingContactButton.js`

`ContactForm` eagerly imports `@emailjs/browser` and `react-toastify`, but the modal is hidden by default. These heavy libs load on every page.

- Use `next/dynamic` to lazy-load `ContactForm` only when `isOpen` is true
- Add a loading skeleton as fallback

**Verification:** Bundle analyzer shows `emailjs` and `toastify` move out of the main chunk.

### Step 3.3 — Convert Header/Footer to Server Components
**Files:** `src/components/Header/Index.js`, `src/components/Footer/Index.js`, `src/app/layout.js`

`Header` and `Footer` are Client Components only because of `useBaseUrl()` and theme toggle. This forces full client hydration on every page.

- Move `useBaseUrl()` logic to a Server Component that reads from `headers()` or env
- Extract theme toggle into a tiny `ThemeToggle` client island
- Remove `"use client"` from Header and Footer
- Ensure `Layout` remains a Server Component

**Verification:** Lighthouse INP improves; header/footer no longer appear in client bundle.

### Step 3.4 — Fix Missing `<Image width>` and CSS Conflicts
**Files:** `src/components/Contact/ContactForm.js:23-27`, `src/app/blogs/[slug]/page.js:176`

- Add `width={100}` to the `<Image>` in ContactForm
- Remove `relative` from the blog hero container that has both `relative` and `absolute`
- Add missing image domains to `next.config.js` `remotePatterns`

**Verification:** No console warnings about missing Image width; blog hero renders correctly.

### Step 3.5 — Add Missing Error Boundaries and Loading States
**Files:** `src/app/blogs/loading.js` (new), `src/app/blogs/error.js`, `src/app/contact/error.js` (new), `src/app/not-found.js` (new)

- Create `src/app/blogs/loading.js` with skeleton
- Create `src/app/contact/error.js`
- Create `src/app/not-found.js` for proper 404 handling
- Replace the inline "Blog Not Found" div in `[slug]/page.js` with `notFound()` call

**Verification:** Visiting `/blogs/nonexistent-slug` returns 404 status (not 200).

### Step 3.6 — Fix Theme Script Flash (FOUT)
**Files:** `src/app/layout.js:75-81`

Theme script uses `strategy="afterInteractive"` causing flash of unthemed content.

- Move theme detection script to inline `<script>` in `<head>` (not `next/script`)
- Or use `strategy="beforeInteractive"`

**Verification:** No visible flash when loading the page in dark mode.

### Step 3.7 — Fix Accessibility Issues
**Files:** `src/components/Header/Index.js`, `src/components/Contact/ContactForm.js`, `src/components/Comments/CommentsSection.js`, `src/components/Portfolio/SlideShow.js`

- Add `aria-expanded={click}` and `aria-controls="mobile-nav"` to hamburger button
- Add `id="mobile-nav"` to mobile nav
- Associate all labels with inputs using `htmlFor`/`id`
- Add keyboard navigation and `aria-live` to slideshow carousel
- Add `role="tablist"`, `role="tab"`, `aria-selected` to FloatingContactButton tabs
- Fix white icons in light mode (`text-dark dark:text-light`)

**Verification:** Lighthouse accessibility score improves; tab through the page works.

---

## Phase 4: Backend Improvements (P1)

### Step 4.1 — Add Try/Catch to All Missing API Routes
**Files:** `src/app/api/jokes/route.js`, `src/app/api/jokes/random/route.js`, `src/app/api/jokes/[id]/route.js`, `src/app/api/comments/[blogSlug]/route.js`

Multiple routes have no error handling — unhandled exceptions return raw 500s.

- Wrap each handler body in try/catch
- Return consistent `{ error: string }` JSON on failure
- Log errors server-side

**Verification:** Malformed request bodies return 400, not 500.

### Step 4.2 — Fix `GET /api/jokes/top10` Destructive JSON Parse
**Files:** `src/app/api/jokes/top10/route.js:11`

`request.json().catch(() => ({}))` silently swallows parse errors, causing the transaction to clear all top10 ranks.

- Remove `.catch(() => ({}))`
- Add explicit try/catch; return 400 on malformed JSON

**Verification:** Sending invalid JSON to `PATCH /api/jokes/top10` returns 400, not a blank slate.

### Step 4.3 — Add Pagination to List Endpoints
**Files:** `src/app/api/blogs/route.js`, `src/app/api/jokes/route.js`

Both return ALL records with no pagination.

- Add `?page=1&limit=20` query parameter support
- Return `{ data: [...], meta: { page, limit, total, pages } }`
- Default to reasonable limits (20 for blogs, 50 for jokes)

**Verification:** `GET /api/blogs?page=2&limit=10` returns the correct slice.

### Step 4.4 — Fix Top10 N+1 UPDATE Pattern
**Files:** `src/app/api/jokes/top10/route.js:39-48`

Currently: 1 blanket UPDATE clearing ALL rows + 10 individual UPDATEs = 11 queries.

- Only clear rows that currently have a rank: `.where(sql\`${jokes.top10_rank} IS NOT NULL\`)`
- Use batch UPDATE with `unnest` or a single CASE statement

**Verification:** Explain analyze shows fewer row updates.

### Step 4.5 — Extract Duplicated `parseCstToUtc` Function
**Files:** `src/app/api/blogs/route.js:10-30`, `src/app/api/blogs/[slug]/route.js:59-79`

Identical 20-line function copied verbatim.

- Create `src/lib/dateUtils.js` with `parseCstToUtc`
- Import from both routes

**Verification:** Both routes still parse dates correctly.

### Step 4.6 — Fix LIKE Wildcard Injection in Joke Search
**Files:** `src/app/api/jokes/route.js:22`

`%${search}%` doesn't escape LIKE metacharacters (`%`, `_`).

- Escape `search` input: `search.replace(/[%_\\]/g, '\\$&')`

**Verification:** Searching for `%` returns no results, not all jokes.

---

## Phase 5: DevOps & Deployment (P1)

### Step 5.1 — Create Production Dockerfile
**Files:** `Dockerfile`

Current Dockerfile runs `next dev` with devDependencies.

- Create multi-stage Dockerfile: deps → build → production runner
- Use `output: 'standalone'` in `next.config.js`
- Run as non-root user (`nextjs`)
- Add `HEALTHCHECK`

**Verification:** `docker build -t byjc . && docker run -p 3000:3000 byjc` serves the built app.

### Step 5.2 — Expand `.dockerignore`
**Files:** `.dockerignore`

Currently only excludes `node_modules`, `.next`, `.contentlayer`, `.git`.

- Add `.env*`, `*.md`, `memory-bank/`, `.github/`, `.husky/`, `.lighthouseci/`, `coverage/`, `scripts/`, `docs/`

**Verification:** `docker build` context size decreases; no secrets in image layers.

### Step 5.3 — Add Security Headers to `vercel.json`
**Files:** `vercel.json`

Currently empty `{}`.

- Add `X-Content-Type-Options: nosniff`
- Add `X-Frame-Options: DENY`
- Add `Referrer-Policy: strict-origin-when-cross-origin`
- Add `Permissions-Policy` (deny camera, microphone, geolocation)
- Add `Strict-Transport-Security` (HSTS)

**Verification:** Response headers include all security headers.

### Step 5.4 — Fix Pre-Commit/Pre-Push Hooks
**Files:** `.husky/pre-commit`, `.husky/pre-push`

- Remove `2>/dev/null` from pre-commit so lint failures are visible
- Add `npm run test:run` to pre-push
- Don't discard build output on failure

**Verification:** Breaking lint causes visible error and blocked commit.

### Step 5.5 — Create CI Workflow
**Files:** `.github/workflows/ci.yml` (new)

No CI pipeline exists — no lint, typecheck, test, or build verification on PRs.

- Create workflow triggered on PRs and pushes to main
- Steps: install → lint → test:run → build
- Use Node 22, cache npm

**Verification:** PR shows CI status checks.

### Step 5.6 — Fix Lighthouse CI
**Files:** `.lighthouserc.json`, `.github/workflows/lighthouse.yml`

Currently testing production URL with desktop preset; all audits return errors.

- Change preset from `desktop` to `mobile`
- Test PR preview URLs instead of production
- Make assertions errors, not warnings

**Verification:** Lighthouse CI produces valid scores.

### Step 5.7 — Add `output: 'standalone'` and `poweredByHeader: false`
**Files:** `next.config.js`

- Add `output: 'standalone'` for Docker production builds
- Add `poweredByHeader: false` to hide `X-Powered-By: Next.js`
- Add `reactStrictMode: true`

**Verification:** Production Docker image is smaller; no `X-Powered-By` header.

---

## Phase 6: Code Quality & Cleanup (P2)

### Step 6.1 — Move `useBaseUrl` Hook to Proper Location
**Files:** `src/utils/links.js`, `src/components/Header/Index.js`

- Rename directory `src/components/Hooks/` to `src/hooks/`
- Move `src/utils/links.js` to `src/hooks/useBaseUrl.js`
- Update all imports

### Step 6.2 — Extract Shared Blog Query Logic
**Files:** `src/app/blogs/page.js:44-58`, `src/app/blogs/[slug]/page.js:25-48`

Identical Drizzle query logic duplicated.

- Create `src/lib/queries/blogs.js` with shared query functions
- Import in both page components

### Step 6.3 — Move Metadata and JSON-LD to Layout-Level Composition
**Files:** `src/app/page.js`, `src/app/blogs/page.js`, `src/app/contact/page.js`, `src/app/jokes/page.js`

Every page defines identical metadata structures.

- Create `src/lib/metadata.js` with base metadata factory
- Each page only overrides unique fields

### Step 6.4 — Fix Component Naming
**Files:** `src/components/Header/Index.js`, `src/components/Home/FeatuedPosts.js`

- Rename `Index.js` → `Header.js`
- Fix typo: `FeatuedPosts` → `FeaturedPosts`

### Step 6.5 — Clean Up `src/data/utilities.js`
**Files:** `src/data/utilities.js`

Contains data constants mixed with JSX rendering functions.

- Move `renderLinkedTechText`, `heading`, `button` to `src/components/` or `src/utils/`
- Keep only data constants in `src/data/utilities.js`

### Step 6.6 — Server-Render Initial Comments
**Files:** `src/components/Comments/CommentsSection.js`, `src/app/blogs/[slug]/page.js`

Comments are fetched client-side causing a request waterfall.

- Fetch comments in the Server Component (`[slug]/page.js`)
- Pass as props to `CommentsSection`
- Keep submission logic client-side

### Step 6.7 — Add `console.error` Exclusion to `removeConsole`
**Files:** `next.config.js:9`

`removeConsole: true` removes ALL console output including errors.

- Change to `removeConsole: { exclude: ['error', 'warn'] }`

---

## Verification Plan

After implementation, validate with:

1. **Security:** `curl -I /admin/jokes` → 302; login rate limit triggers at 6 attempts; `timingSafeEqual` in auth code
2. **Database:** `EXPLAIN ANALYZE` on blog listing uses composite index; `ORDER BY RANDOM()` replaced; migrations clean
3. **Performance:** `ANALYZE=true npm run build` shows smaller bundle; no `emailjs`/`toastify` in main chunk; header/footer not in client bundle
4. **Frontend:** Lighthouse a11y > 90; no FOUT on theme load; 404 returns proper status; no missing Image width warnings
5. **Backend:** All API routes return consistent error JSON; pagination works; top10 update uses fewer queries
6. **DevOps:** Docker image runs production build; CI workflow passes; security headers present; hooks show errors
