import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdminSession } from '@/lib/adminAuth';

export async function PATCH(request, { params }) {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    const { id } = await params;
    const { rows } = await pool.query(
        `UPDATE jokes SET jc_starred = NOT jc_starred, updated_at = NOW() WHERE id = $1
         RETURNING id, title, body, source, jc_starred, created_at, updated_at`,
        [id]
    );

    if (!rows.length) {
        return NextResponse.json({ error: 'Joke not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
}
