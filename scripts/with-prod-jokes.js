// Preloads prod env for joke:add:prod script.
process.env.JOKES_API_BASE_URL = process.env.NEXT_PUBLIC_PROD_URL;
process.env.BLOG_API_SECRET = process.env.BLOG_API_SECRET_PROD;
