import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { jokes } from '../../../../db/schema.js';
import { desc, ilike, or, asc, sql } from 'drizzle-orm';
import { requireAdminSession } from '@/lib/adminAuth';
import { jokeSchema, validateBody } from '@/lib/schemas';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

function hasApiSecret(request) {
    const secret = process.env.BLOG_API_SECRET;
    if (!secret) return false;
    const provided = request.headers.get('x-blog-secret');
    return provided === secret;
}

export async function GET(request) {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    const { search } = Object.fromEntries(new URL(request.url).searchParams);
    const whereClause = search
        ? or(ilike(jokes.setup, `%${search}%`), ilike(jokes.punchline, `%${search}%`))
        : undefined;

    const rows = await db.select({
        id: jokes.id,
        setup: jokes.setup,
        punchline: jokes.punchline,
        jc_starred: jokes.jc_starred,
        top10_rank: jokes.top10_rank,
        created_at: jokes.created_at,
        updated_at: jokes.updated_at,
    }).from(jokes)
      .where(whereClause)
      .orderBy(
          sql`CASE WHEN ${jokes.top10_rank} IS NULL THEN 1 ELSE 0 END`,
          asc(jokes.top10_rank),
          desc(jokes.jc_starred),
          desc(jokes.created_at)
      );

    return NextResponse.json(rows);
}

export async function POST(request) {
    if (!hasApiSecret(request)) {
        const authError = await requireAdminSession(request);
        if (authError) return authError;

        const limit = checkRateLimit(`jokes:${getClientIp(request)}`, { capacity: 5, refillPerSec: 5 / 60 });
        if (!limit.ok) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
            );
        }
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const result = await validateBody(jokeSchema, payload);
    if (!result.ok) {
        return NextResponse.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
    }
    const { setup, punchline } = result.value;

    const [inserted] = await db.insert(jokes).values({
        setup,
        punchline,
    }).returning({
        id: jokes.id,
        setup: jokes.setup,
        punchline: jokes.punchline,
        jc_starred: jokes.jc_starred,
        top10_rank: jokes.top10_rank,
        created_at: jokes.created_at,
        updated_at: jokes.updated_at,
    });

    return NextResponse.json(inserted, { status: 201 });
}
