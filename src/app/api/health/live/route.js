import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Liveness deliberately avoids dependencies: restart only a stuck process. */
export function GET() {
  return NextResponse.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
}
