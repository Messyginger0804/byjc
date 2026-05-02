// In-memory token bucket. Keyed by IP. Resets on cold start and is
// per-instance only — fine for low-traffic personal site, not durable.
// Move to Upstash if abuse becomes a real problem.

const buckets = new Map();
const SWEEP_AFTER_MS = 10 * 60 * 1000;
let lastSweep = Date.now();

function sweep(now) {
  if (now - lastSweep < SWEEP_AFTER_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > SWEEP_AFTER_MS) buckets.delete(key);
  }
}

export function checkRateLimit(key, { capacity, refillPerSec }) {
  const now = Date.now();
  sweep(now);

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: capacity, lastRefill: now };
    buckets.set(key, bucket);
  }

  const elapsedSec = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsedSec * refillPerSec);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    const retryAfterSec = Math.ceil((1 - bucket.tokens) / refillPerSec);
    return { ok: false, retryAfter: retryAfterSec };
  }

  bucket.tokens -= 1;
  return { ok: true };
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
