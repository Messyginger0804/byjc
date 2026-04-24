import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const JOKES_PATH = path.resolve(__dirname, '../../jokesByJc/jokes.json');

if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set. Run via: npm run db:seed-jokes');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function main() {
    if (!fs.existsSync(JOKES_PATH)) {
        console.error(`Source file not found: ${JOKES_PATH}`);
        process.exit(1);
    }
    const { jokes } = JSON.parse(fs.readFileSync(JOKES_PATH, 'utf-8'));
    console.log(`Found ${jokes.length} joke(s) in source file.`);

    const client = await pool.connect();
    try {
        const { rows: existing } = await client.query('SELECT setup FROM jokes');
        const existingSetups = new Set(existing.map((r) => r.setup));

        const newJokes = jokes.filter((j) => !existingSetups.has(j.setup));

        if (newJokes.length === 0) {
            console.log('Nothing to insert — all jokes already exist in the database.');
            return;
        }

        console.log(`Inserting ${newJokes.length} new joke(s)...`);

        await client.query('BEGIN');
        await client.query(
            `INSERT INTO jokes (setup, punchline)
             SELECT * FROM unnest($1::text[], $2::text[]) AS t(setup, punchline)`,
            [newJokes.map((j) => j.setup), newJokes.map((j) => j.punchline)]
        );
        await client.query('COMMIT');

        const { rows: [{ count }] } = await client.query('SELECT COUNT(*) FROM jokes');
        console.log(`Done. Total jokes in database: ${count}`);
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('Insert failed, transaction rolled back:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch((err) => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
