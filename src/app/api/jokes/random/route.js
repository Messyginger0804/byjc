import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { jokes } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { resolveCorsOrigin } from '@/lib/cors';
import { toPublicJoke } from '@/lib/jokesApi';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Offset-based random selection avoids O(n log n) ORDER BY RANDOM()
    const [{ count }] = await db
      .select({ count: sql`count(*)::int` })
      .from(jokes);

    const origin = resolveCorsOrigin(request.headers.get('origin'));
    const headers = {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
    };

    if (!count || count === 0) {
      return NextResponse.json(null, { headers });
    }

    const offset = Math.floor(Math.random() * count);

    const [randomJoke] = await db
      .select({
        setup: jokes.setup,
        punchline: jokes.punchline,
      })
      .from(jokes)
      .offset(offset)
      .limit(1);

    if (!randomJoke) {
      return NextResponse.json(null, { headers });
    }

    return NextResponse.json(toPublicJoke(randomJoke), { headers });
  } catch (err) {
    console.error('[API] Random joke GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch random joke' }, { status: 500 });
  }
}

export async function OPTIONS(request) {
  const origin = resolveCorsOrigin(request.headers.get('origin'));
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
