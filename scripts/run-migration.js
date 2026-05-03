import { defineConfig } from 'drizzle-kit';

const connectionString = process.env.PROD_DATABASE_URL;
if (!connectionString) {
    console.error('PROD_DATABASE_URL not set');
    process.exit(1);
}

const url = new URL(connectionString);
url.searchParams.set('sslmode', 'no-verify');

const config = defineConfig({
    schema: './db/schema.js',
    out: './db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: url.toString(),
    },
});

const { migrate } = await import('drizzle-kit');
await migrate(config, { migrationsFolder: './db/migrations' });
console.log('Migration complete');