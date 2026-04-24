import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdminSession } from '@/lib/adminAuth';

export async function GET(request) {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    const { rows } = await pool.query(
        `SELECT id, setup, punchline, jc_starred, created_at, updated_at FROM jokes ORDER BY jc_starred DESC, created_at DESC`
    );
    return NextResponse.json(rows);
}

export async function POST(request) {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    const { setup, punchline } = await request.json();
    if (!setup?.trim()) {
        return NextResponse.json({ error: 'Setup is required' }, { status: 400 });
    }
    if (!punchline?.trim()) {
        return NextResponse.json({ error: 'Punchline is required' }, { status: 400 });
    }

    const { rows } = await pool.query(
        `INSERT INTO jokes (setup, punchline) VALUES ($1, $2) RETURNING id, setup, punchline, jc_starred, created_at, updated_at`,
        [setup.trim(), punchline.trim()]
    );
    return NextResponse.json(rows[0], { status: 201 });
}
