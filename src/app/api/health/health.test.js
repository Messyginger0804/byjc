import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ execute: vi.fn() }));
const log = vi.hoisted(() => vi.fn());

vi.mock('@/lib/drizzle', () => ({ default: db }));
vi.mock('@/lib/logger', () => ({ log }));

import { GET as live } from './live/route.js';
import { GET as readiness } from './readiness/route.js';

describe('health endpoints', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reports liveness without querying dependencies', async () => {
    const response = live();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
    expect(db.execute).not.toHaveBeenCalled();
  });

  it('reports readiness only after PostgreSQL responds', async () => {
    db.execute.mockResolvedValueOnce();
    const response = await readiness();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ready', dependencies: { database: 'ready' } });
  });

  it('keeps the process live but removes it from traffic when PostgreSQL is unavailable', async () => {
    db.execute.mockRejectedValueOnce(Object.assign(new Error('connection refused'), { code: 'ECONNREFUSED' }));
    const response = await readiness();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: 'not_ready', dependencies: { database: 'unavailable' } });
    expect(log).toHaveBeenCalledWith('error', 'health.readiness.failed', expect.objectContaining({ dependency: 'database' }));
  });
});
