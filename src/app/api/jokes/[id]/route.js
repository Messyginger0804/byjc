import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { jokes } from '../../../../../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { requireAdminSession } from '@/lib/adminAuth';

export async function PATCH(request, { params }) {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    const { id } = await params;
    const { setup, punchline } = await request.json();

    if (!setup?.trim()) {
        return NextResponse.json({ error: 'Setup is required' }, { status: 400 });
    }
    if (!punchline?.trim()) {
        return NextResponse.json({ error: 'Punchline is required' }, { status: 400 });
    }

    const updated = await db.update(jokes)
        .set({
            setup: setup.trim(),
            punchline: punchline.trim(),
            updated_at: sql`NOW()`,
        })
        .where(eq(jokes.id, parseInt(id, 10)))
        .returning({
            id: jokes.id,
            setup: jokes.setup,
            punchline: jokes.punchline,
            jc_starred: jokes.jc_starred,
            top10_rank: jokes.top10_rank,
            created_at: jokes.created_at,
            updated_at: jokes.updated_at,
        });

    if (!updated.length) {
        return NextResponse.json({ error: 'Joke not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
}

export async function DELETE(request, { params }) {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    const { id } = await params;
    const deleted = await db.delete(jokes)
        .where(eq(jokes.id, parseInt(id, 10)))
        .returning({ id: jokes.id });

    if (!deleted.length) {
        return NextResponse.json({ error: 'Joke not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
}
