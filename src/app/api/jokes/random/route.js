import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { jokes } from '@/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const [randomJoke] = await db
    .select({
      setup: jokes.setup,
      punchline: jokes.punchline,
    })
    .from(jokes)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!randomJoke) {
    return NextResponse.json(null);
  }

  const isOneLiner = !randomJoke.punchline || randomJoke.punchline.trim() === '';

  return NextResponse.json({
    setup: randomJoke.setup,
    punchline: isOneLiner ? null : randomJoke.punchline,
    isOneLiner,
  });
}