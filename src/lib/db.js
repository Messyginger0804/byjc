import { Pool } from 'pg';
import { getDatabaseConfig } from './databaseConfig.js';

// Route modules are evaluated during `next build`; defer required runtime
// database configuration so images can be built without baking in secrets.
const databaseConfig = process.env.POSTGRES_URL || process.env.DATABASE_URL
    ? getDatabaseConfig()
    : {};

const pool = new Pool({
    ...databaseConfig,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    options: '-c statement_timeout=10000 -c idle_in_transaction_session_timeout=30000',
});

export default pool;
