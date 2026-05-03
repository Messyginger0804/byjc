import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
});

async function main() {
    const client = await pool.connect();
    try {
        await client.query(`
            ALTER TABLE "jokes" ADD COLUMN IF NOT EXISTS "jc_starred" boolean DEFAULT false;
            ALTER TABLE "jokes" ADD COLUMN IF NOT EXISTS "top10_rank" integer;
            CREATE INDEX IF NOT EXISTS "jokes_top10_rank_idx" ON "jokes" USING btree ("top10_rank");
            CREATE INDEX IF NOT EXISTS "jokes_jc_starred_idx" ON "jokes" USING btree ("jc_starred");
        `);
        console.log('Indexes created on Supabase');
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(e => { console.error(e); process.exit(1); });