// Preloads prod DB env before running a script.
// Usage: node --env-file=.env.local --import=./scripts/with-prod-db.js <script>
if (!process.env.PROD_DATABASE_URL) {
    throw new Error('PROD_DATABASE_URL must be set for production scripts');
}
// getDatabaseConfig prefers POSTGRES_URL, so override both.
process.env.DATABASE_URL = process.env.PROD_DATABASE_URL;
process.env.POSTGRES_URL = process.env.PROD_DATABASE_URL;
