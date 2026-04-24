// Preloads production environment variables before running a prod script.
// Used via: node --env-file=.env.local --import=./scripts/with-prod-env.js <script> [args]
process.env.BLOG_API_BASE_URL = process.env.BLOG_API_BASE_URL_PROD || process.env.NEXT_PUBLIC_PROD_URL;
process.env.BLOG_API_SECRET = process.env.BLOG_API_SECRET_PROD;
