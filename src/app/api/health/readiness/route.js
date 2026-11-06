import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import db from '@/lib/drizzle';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/** Readiness includes the required PostgreSQL dependency so traffic is held during outages. */
export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json(
      { status: 'ready', dependencies: { database: 'ready' } },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    log('error', 'health.readiness.failed', { dependency: 'database', error });
    return NextResponse.json(
      { status: 'not_ready', dependencies: { database: 'unavailable' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
