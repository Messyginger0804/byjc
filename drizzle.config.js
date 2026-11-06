import { defineConfig } from 'drizzle-kit';
import { getDatabaseConfig } from './src/lib/databaseConfig.js';

const databaseConfig = getDatabaseConfig();

export default defineConfig({
    schema: './db/schema.js',
    out: './db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: databaseConfig.connectionString,
        ssl: databaseConfig.ssl,
    },
});
