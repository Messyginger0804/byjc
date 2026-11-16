# App architecture

Blogs by JC is a Next.js blog site (`next` ^16.4.2, React ^19, App Router, JavaScript only; see `package.json`). Node 22.x is required (`engines`). Path alias `@/` maps to `src/` (`jsconfig.json`, `vitest.config.mjs`).

## Layout
- `src/app/`: pages and API routes. Pages: `page.js` (home), `about`, `blogs`, `blogs/[slug]`, `categories/[slug]`, `contact`, `jokes`, `portfolio`, `privacy-policy`, `resume`, `admin`. `feed.xml/route.js` serves the RSS feed.
- `src/app/api/`: route handlers (`route.js`) for `blogs`, `blogs/[slug]`, `comments/[blogSlug]`, `jokes` (plus `random`, `top10`, `[id]`, `[id]/star`), `blog-of-the-month`, `resume/download`, `admin/login`, `admin/logout`, `health/live`, `health/readiness`. `docs/api-reference.md` documents the endpoints.
- `src/lib/`: server helpers (`db.js`, `drizzle.js`, `databaseConfig.js`, `adminAuth.js`, `blogApiAuth.js`, `rateLimit.js`, `schemas.js`, `safeMarkdown.js`, `revalidateBlogs.js`, `queries/blogs.js`). Tests sit beside the code as `*.test.js`.
- `src/components/`, `src/hooks/`, `src/utils/`, `src/data/` (static profile and portfolio data).
- `db/schema.js`: Drizzle schema (tables `blogs`, `comments`, `rate_limit_buckets`, `jokes`). See `db-migrations.md`.

## Authentication
Two separate mechanisms:
1. Admin session (browser). `POST /api/admin/login` checks the password against `ADMIN_PASSWORD` with bcrypt (`bcryptjs`), is rate limited, and sets an `admin_session` cookie holding a 7-day HS256 JWT signed with `ADMIN_JWT_SECRET` (`src/lib/adminAuth.js`, `jose`). `src/proxy.js` (the Next.js 16 proxy file) redirects every `/admin` path except `/admin/login` to the login page when the cookie is missing or invalid.
2. Shared API secret. `requireBlogApiAuth` (`src/lib/blogApiAuth.js`) accepts `BLOG_API_SECRET` in an `x-blog-secret` header or as a `Bearer` token.

Which routes check what:
- `POST /api/blogs` and `PATCH /api/blogs/[slug]`: API secret. `POST /api/blogs` is also rate limited per client address (30 requests, refilling 30 per minute, `src/app/api/blogs/route.js`).
- `PATCH /api/jokes/top10`, `PATCH /api/jokes/[id]`, `DELETE /api/jokes/[id]`, `PATCH /api/jokes/[id]/star`: admin session (`requireAdminSession`).
- `GET` and `POST /api/jokes`: API secret or admin session (the bulk loader uses the secret).
- Read routes for blogs, comments, random jokes, health and `POST /api/comments/[blogSlug]` have no auth check; comment posting is rate limited per client IP.
- `src/proxy.js` matcher excludes `api/`, so API routes do their own checks.

## Rate limiting
`src/lib/rateLimit.js` keeps token buckets in the `rate_limit_buckets` table, keyed by route and client address. `getClientIp` decides the address:
- `TRUSTED_PROXY_PLATFORM=cloudflare`: reads the `cf-connecting-ip` header.
- `VERCEL` set to a non-empty value other than `0`: reads `x-vercel-forwarded-for`. Either source must hold a valid IP or `TrustedClientIpError` is thrown (requests get 503).
- `TRUSTED_PROXY_PLATFORM=none`: every client shares one global bucket (`untrusted-proxy-global`); ignored, with a `rate_limit.none_ignored` warning, when `VERCEL` is set.
- Nothing configured: outside `NODE_ENV=production` the key is `local-development`; in production it logs `rate_limit.proxy_unconfigured` and throws, so rate-limited POSTs return 503.
Failure modes: if `rate_limit_buckets` does not exist, `checkRateLimit` fails open for callers using the default options (logs `rate_limit.table_missing`), but admin login passes `failOpenOnMissingTable: false` and returns 503; any other limiter or database error returns 503. `README.md` "Deployment Notes" covers deployment-specific settings.

## Blog API call
`POST /api/blogs` takes JSON with required `title`, `description`, `content`, `slug` and optional `author`, `tags`, `image_url`, `is_published`, `is_featured`, `featured_slot`, `published_at` (validators in `src/lib/schemas.js`). The secret goes in the `x-blog-secret` header (or `Authorization: Bearer`). `scripts/create-blog.js` builds this call from a Markdown file's frontmatter.

## Blog content
Posts live in the `blogs` table (not MDX files). Listing queries select published rows with `published_at` not in the future. `blogs/[slug]/page.js` sets `revalidate = 300`; blog writes through the API also revalidate listing, post, feed and category paths (`src/lib/revalidateBlogs.js`). Content is rendered by `src/components/Blog/RenderMdx.js` through `renderSafeMarkdown` in `src/lib/safeMarkdown.js`: `react-markdown` with `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code` (Shiki, `github-dark`) and `rehype-sanitize` with an allow-list of elements and URL schemes. Featured posts use `featured_slot` values `featured-main`, `featured-secondary-1`, `featured-secondary-2` (`src/lib/constants.js`).

## Styling and config
Tailwind CSS v4 through PostCSS (`postcss.config.js`, `src/app/globals.css`) with `@tailwindcss/typography` and `@tailwindcss/forms`. `next.config.js` sets `output: 'standalone'`, security headers including a CSP from `src/lib/contentSecurity.js`, and a host-based redirect. Sitemap: `next-sitemap`, run by the `postbuild` script.

## Tests and checks
Vitest (`vitest.config.mjs`, 90% coverage thresholds), Playwright smoke test in `e2e/`, ESLint 9 flat config in `eslint.config.js` (`next` rules; `no-console` warns except `warn`/`error`). Husky: pre-commit runs `lint-staged`; pre-push runs lint, `test:run` and build. Tests are `*.test.js` files beside the code in `src/` and `scripts/`. CI (`.github/workflows/ci.yml`) has jobs for lint, tests and build (`test`), migrations against a disposable database (`migrations`) and the browser smoke test (`browser-smoke`).
