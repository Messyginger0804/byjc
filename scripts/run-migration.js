import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getDatabaseConfig } from '../src/lib/databaseConfig.js';

const { Pool } = pg;

const pool = new Pool({
    ...getDatabaseConfig(),
});
const db = drizzle(pool);

try {
    await migrate(db, { migrationsFolder: './db/migrations' });
    console.log('Migration complete');
} finally {
    await pool.end();
}
