import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const READINESS_TIMEOUT_MS = 3000;

// Concurrent probes share one in-flight check so they hold at most one pool connection.
let inflight = null;

async function probeDatabase() {
  let client;
  let destroy = false;
  let timer;
  try {
    client = await pool.connect();
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('readiness query timed out')), READINESS_TIMEOUT_MS);
    });
    await Promise.race([client.query('SELECT 1'), deadline]);
  } catch (error) {
    destroy = true; // a stalled/broken connection must not return to the shared pool
    throw error;
  } finally {
    clearTimeout(timer);
    client?.release(destroy);
  }
}

/** Readiness includes the required PostgreSQL dependency so traffic is held during outages. */
export async function GET() {
  try {
    inflight ??= probeDatabase().finally(() => {
      inflight = null;
    });
    await inflight;
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
