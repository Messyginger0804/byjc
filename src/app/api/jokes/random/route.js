import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { jokes } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { resolveCorsOrigin } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const [randomJoke] = await db
    .select({
      setup: jokes.setup,
      punchline: jokes.punchline,
    })
    .from(jokes)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  const origin = resolveCorsOrigin(request.headers.get('origin'));
  const headers = {
    'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
  };

  if (!randomJoke) {
    return NextResponse.json(null, { headers });
  }

  const isOneLiner = !randomJoke.punchline || randomJoke.punchline.trim() === '';

  return NextResponse.json(
    {
      setup: randomJoke.setup,
      punchline: isOneLiner ? null : randomJoke.punchline,
      isOneLiner,
    },
    { headers }
  );
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