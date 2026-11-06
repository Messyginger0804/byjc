# Blogs by JC - A Blog Site

Welcome to **Blogs by JC**, a blog site powered by [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/docs/installation), and [PostgreSQL](https://www.postgresql.org/). This project has evolved from using MDX/Contentlayer to a database-driven approach for more dynamic content management.

## Project Overview

- **Project Name:** Blogs by JC
- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/docs/installation)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Neon](https://neon.tech)
- **Developed By:** [Jeremy Ashley](https://jcashleyportfolio.netlify.app/)
- **Live Site:** https://www.byjc.dev
- **GitHub Repository:** [click here for repo](https://github.com/Messyginger0804/blogsbyjc)

## Features

**Blogs by JC** offers the following features:

- **Custom Design:** The site is tailored for a unique and engaging user experience.
- **Database-Driven:** Blog content is stored in PostgreSQL and fetched via API routes.
- **Dynamic Routing:** Utilizes Next.js dynamic routing for a smooth and dynamic user experience.
- **SEO Optimization:** Incorporates next-sitemap for enhanced SEO performance and discoverability.
- **Admin API:** Secure API endpoints for creating and managing blog posts.

## Deployment Notes

- **Migrations are not run by the build.** Run `npm run db:migrate` (or `db:migrate:prod` from a trusted machine, after backing up the database) *before* promoting a deployment that includes new migrations. Migration `0006` creates `rate_limit_buckets`; if it is missing the rate limiter fails open and logs `rate_limit.table_missing` once per process, so the app keeps working but is unthrottled until you migrate. Admin login fails closed (503) on any other limiter/database error.
- **Blog cache freshness:** blog writes through the API revalidate `/`, `/blogs`, the post, `/feed.xml` and all `/categories/[slug]` pages. A scheduled post that goes live purely by the clock has no write to trigger revalidation, so its post page (`revalidate = 300`) can show a cached 404 for up to 5 minutes, `/blogs` for up to 1 minute and the RSS feed for up to 1 hour. The sitemap is generated at build time.
- **Client identity for rate limiting** must come from a trusted proxy. On Vercel this is automatic. Set `TRUSTED_PROXY_PLATFORM=cloudflare` behind Cloudflare. For a production build with no trusted proxy (plain Docker, `next start`) set `TRUSTED_PROXY_PLATFORM=none`; all clients then share one rate-limit bucket, which means anonymous traffic can exhaust the admin login limit and lock the admin out for the window. Treat `none` as a last resort for local/proxy-less hosts, and prefer Cloudflare or another trusted proxy for any internet-facing deployment. `none` is ignored on Vercel (`VERCEL` set), where the platform client IP is always used, and a `rate_limit.none_ignored` warning is logged. Without any of these, rate-limited POSTs return 503 in production (and log `rate_limit.proxy_unconfigured`). Development and test (`NODE_ENV` not `production`) use a local fallback key.

## Technologies Used

In the creation of **Blogs by JC**, I made use of the following technologies:

- **Next.js:** A React framework for building server-rendered applications.
- **Tailwind CSS:** A utility-first CSS framework for rapid web development.
- **PostgreSQL:** A powerful, open source database system.
- **Neon:** Serverless Postgres for easy scaling and deployment.

## How to Explore The Site

1. Open a web browser and visit https://www.byjc.dev/.

2. Browse through the blog posts and enjoy the content. New blogs are posted regularly.

## Challenges Faced
Creating Blogs by JC posed several challenges:

- First-Time Utilization: This project marked my first experience with Next.js, Tailwind CSS, and Contentlayer.
- Database Migration: Migrated from MDX/Contentlayer to PostgreSQL database for dynamic content management.
- Learning SQL: Implementing array_to_json() for proper PostgreSQL array handling in API responses.

## Future Plans
For Blogs by JC, I have the following plans for future improvements and enhancements:

- Enhanced Admin Dashboard: Build a proper admin interface for managing blog posts.
- Image Uploads: Implement cloud storage for blog images.
- Comments System: Add user authentication and comments for blog posts.

## License
Blogs by JC is open-source, and its code is available in the associated GitHub repository. You are welcome to use, modify, or distribute the code as per the project's license.

## Contact
If you have any questions, feedback, or would like to connect with me, you can reach out via [Linkedin](https://www.linkedin.com/in/jeremy-ashley-webdev/).

Thank you for visiting Blogs by JC, and I look forward to sharing more content and insights in the future!