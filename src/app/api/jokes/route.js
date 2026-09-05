import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { jokes } from '../../../../db/schema.js';
import { desc, ilike, or, asc, sql } from 'drizzle-orm';
import { requireAdminSession } from '@/lib/adminAuth';
import { jokeSchema, validateBody } from '@/lib/schemas';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { safeCompare } from '@/lib/safeCompare';

function hasApiSecret(request) {
    const secret = process.env.BLOG_API_SECRET;
    if (!secret) return false;
    const provided = request.headers.get('x-blog-secret');
    return safeCompare(provided, secret);
}

/**
 * Escape LIKE metacharacters so user input can't inject wildcards.
 * Note: backslash escaping is PostgreSQL-specific (requires standard_conforming_strings=on).
 */
function escapeLike(str) {
    return str.replace(/[%_\\]/g, '\\$&');
}

export async function GET(request) {
    try {
        const authError = await requireAdminSession(request);
        if (authError) return authError;

        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const page = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
        const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit'), 10) || 50));

        const escapedSearch = escapeLike(search);
        const whereClause = search
            ? or(ilike(jokes.setup, `%${escapedSearch}%`), ilike(jokes.punchline, `%${escapedSearch}%`))
            : undefined;

        const [{ total }] = await db
            .select({ total: sql`count(*)::int` })
            .from(jokes)
            .where(whereClause);

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
          )
          .limit(limit)
          .offset((page - 1) * limit);

        return NextResponse.json({
            data: rows,
            meta: {
                page,
                limit,
                total: total || 0,
                pages: Math.ceil((total || 0) / limit),
            },
        });
    } catch (err) {
        console.error('[API] Jokes GET error:', err);
        return NextResponse.json({ error: 'Failed to fetch jokes' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const usingApiSecret = hasApiSecret(request);
        if (!usingApiSecret) {
            const authError = await requireAdminSession(request);
            if (authError) return authError;
        }

        // Rate limit both auth paths. The secret path gets a much larger bucket
        // since scripts/add-jokes-bulk.js legitimately makes many sequential
        // requests with it — this is just a ceiling against a leaked secret,
        // not a throttle on normal bulk-add usage.
        const rateLimitKey = usingApiSecret
            ? `jokes:secret:${getClientIp(request)}`
            : `jokes:${getClientIp(request)}`;
        const rateLimitOpts = usingApiSecret
            ? { capacity: 60, refillPerSec: 1 }
            : { capacity: 5, refillPerSec: 5 / 60 };

        const limit = checkRateLimit(rateLimitKey, rateLimitOpts);
        if (!limit.ok) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
            );
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
    } catch (err) {
        console.error('[API] Jokes POST error:', err);
        return NextResponse.json({ error: 'Failed to create joke' }, { status: 500 });
    }
}
