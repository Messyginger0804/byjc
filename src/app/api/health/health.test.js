import { beforeEach, describe, expect, it, vi } from 'vitest';

const client = vi.hoisted(() => ({ query: vi.fn(), release: vi.fn() }));
const pool = vi.hoisted(() => ({ connect: vi.fn() }));
const log = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({ default: pool }));
vi.mock('@/lib/logger', () => ({ log }));

import { GET as live } from './live/route.js';
import { GET as readiness } from './readiness/route.js';

describe('health endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pool.connect.mockResolvedValue(client);
  });

  it('reports liveness without querying dependencies', async () => {
    const response = live();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it('reports readiness only after PostgreSQL responds', async () => {
    client.query.mockResolvedValueOnce();
    const response = await readiness();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ready', dependencies: { database: 'ready' } });
  });

  it('keeps the process live but removes it from traffic when PostgreSQL is unavailable', async () => {
    client.query.mockRejectedValueOnce(Object.assign(new Error('connection refused'), { code: 'ECONNREFUSED' }));
    const response = await readiness();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: 'not_ready', dependencies: { database: 'unavailable' } });
    expect(log).toHaveBeenCalledWith('error', 'health.readiness.failed', expect.objectContaining({ dependency: 'database' }));
  });

  it('returns 503 and destroys the connection when the query stalls', async () => {
    vi.useFakeTimers();
    try {
      client.query.mockReturnValueOnce(new Promise(() => {}));
      const pending = readiness();
      await vi.advanceTimersByTimeAsync(3500);
      const response = await pending;
      expect(response.status).toBe(503);
      expect(client.release).toHaveBeenCalledWith(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('coalesces concurrent probes onto a single pool connection', async () => {
    let resolveQuery;
    client.query.mockReturnValueOnce(new Promise((resolve) => { resolveQuery = resolve; }));
    const calls = [readiness(), readiness(), readiness()];
    await vi.waitFor(() => expect(client.query).toHaveBeenCalledTimes(1));
    resolveQuery();
    const responses = await Promise.all(calls);
    expect(responses.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(pool.connect).toHaveBeenCalledTimes(1);
  });
});
