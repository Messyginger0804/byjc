// Preloads prod DB env before running a script.
// Usage: node --env-file=.env.local --import=./scripts/with-prod-db.js <script>
process.env.DATABASE_URL = process.env.PROD_DATABASE_URL;
