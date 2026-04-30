import { Pool } from 'pg';

function getConnectionString() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

    if (!connectionString) return connectionString;

    const url = new URL(connectionString);
    url.searchParams.set('sslmode', 'no-verify');
    return url.toString();
}

const pool = new Pool({
    connectionString: getConnectionString(),
});

export default pool;
