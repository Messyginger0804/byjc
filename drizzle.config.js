import { defineConfig } from 'drizzle-kit';

function getConnectionString() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

    if (!connectionString) return connectionString;

    const url = new URL(connectionString);
    url.searchParams.set('sslmode', 'no-verify');
    return url.toString();
}

export default defineConfig({
    schema: './db/schema.js',
    out: './db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: getConnectionString(),
    },
});
