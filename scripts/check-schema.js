import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
});

async function main() {
    const client = await pool.connect();
    try {
        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
        console.log('Tables:', JSON.stringify(tables.rows, null, 2));
        
        const columns = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'jokes' ORDER BY ordinal_position");
        console.log('Jokes columns:', JSON.stringify(columns.rows, null, 2));
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(e => { console.error(e); process.exit(1); });