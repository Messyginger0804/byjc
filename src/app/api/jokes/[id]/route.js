import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdminSession } from '@/lib/adminAuth';

export async function DELETE(request, { params }) {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    const { id } = await params;
    const { rowCount } = await pool.query(`DELETE FROM jokes WHERE id = $1`, [id]);

    if (!rowCount) {
        return NextResponse.json({ error: 'Joke not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
}
