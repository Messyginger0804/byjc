import { defineConfig } from 'drizzle-kit';
import { getDatabaseConfig } from './src/lib/databaseConfig.js';

// `drizzle-kit generate` only diffs the schema and never connects, so it must load
// without credentials. Every other command keeps the URL validation.
const needsConnection = !process.argv.slice(2).includes('generate');
const databaseConfig = needsConnection ? getDatabaseConfig() : null;

export default defineConfig({
    schema: './db/schema.js',
    out: './db/migrations',
    dialect: 'postgresql',
    ...(databaseConfig && {
        dbCredentials: {
            url: databaseConfig.connectionString,
            ssl: databaseConfig.ssl,
        },
    }),
});
