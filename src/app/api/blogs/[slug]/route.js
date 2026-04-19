import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        const { rows } = await pool.query(
            `SELECT * FROM blogs WHERE slug = $1 AND is_published = true`,
            [slug]
        );
        if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(rows[0]);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
