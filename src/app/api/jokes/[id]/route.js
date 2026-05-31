import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { jokes } from '../../../../../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { requireAdminSession } from '@/lib/adminAuth';

export async function PATCH(request, { params }) {
    try {
        const authError = await requireAdminSession(request);
        if (authError) return authError;

        const { id } = await params;

        let payload;
        try {
            payload = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const { setup, punchline } = payload;

        if (!setup?.trim()) {
            return NextResponse.json({ error: 'Setup is required' }, { status: 400 });
        }
        if (!punchline?.trim()) {
            return NextResponse.json({ error: 'Punchline is required' }, { status: 400 });
        }

        const jokeId = parseInt(id, 10);
        if (Number.isNaN(jokeId) || jokeId <= 0) {
            return NextResponse.json({ error: 'Invalid joke ID' }, { status: 400 });
        }

        const updated = await db.update(jokes)
            .set({
                setup: setup.trim(),
                punchline: punchline.trim(),
                updated_at: sql`NOW()`,
            })
            .where(eq(jokes.id, jokeId))
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
    } catch (err) {
        console.error('[API] Joke PATCH error:', err);
        return NextResponse.json({ error: 'Failed to update joke' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const authError = await requireAdminSession(request);
        if (authError) return authError;

        const { id } = await params;
        const jokeId = parseInt(id, 10);
        if (Number.isNaN(jokeId) || jokeId <= 0) {
            return NextResponse.json({ error: 'Invalid joke ID' }, { status: 400 });
        }

        const deleted = await db.delete(jokes)
            .where(eq(jokes.id, jokeId))
            .returning({ id: jokes.id });

        if (!deleted.length) {
            return NextResponse.json({ error: 'Joke not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[API] Joke DELETE error:', err);
        return NextResponse.json({ error: 'Failed to delete joke' }, { status: 500 });
    }
}
