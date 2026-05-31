import { Pool } from 'pg';

function getConnectionString() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

    if (!connectionString) return connectionString;

    const url = new URL(connectionString);
    url.searchParams.delete('sslmode');
    url.searchParams.delete('ssl');
    url.searchParams.delete('sslcert');
    url.searchParams.delete('sslkey');
    url.searchParams.delete('sslrootcert');
    return url.toString();
}

const pool = new Pool({
    connectionString: getConnectionString(),
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    options: '-c statement_timeout=10000 -c idle_in_transaction_session_timeout=30000',
});

export default pool;
