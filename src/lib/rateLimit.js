import { isIP } from 'node:net';
import pool from './db.js';
import { log } from './logger.js';

const CLEANUP_BATCH_SIZE = 100;

export class TrustedClientIpError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TrustedClientIpError';
  }
}

const UNDEFINED_TABLE = '42P01';
let warnedMissingTable = false;
let warnedUntrustedProxy = false;
let warnedIgnoredNone = false;

// A single IPv6 subscriber commonly controls a whole /64, so per-address limits
// alone are trivially bypassed. Keys shaped `<bucket>:<ipv6>` also consume from a
// shared /64 bucket sized for several users behind the same prefix.
const IPV6_PREFIX_CAPACITY_MULTIPLIER = 4;

export function ipv6Prefix64(address) {
  const bare = String(address).split('%')[0];
  if (isIP(bare) !== 6 || bare.includes('.')) return null;
  const [head, tail] = bare.split('::');
  const headGroups = head ? head.split(':') : [];
  const tailGroups = tail === undefined ? [] : (tail ? tail.split(':') : []);
  const missing = 8 - headGroups.length - tailGroups.length;
  const groups = bare.includes('::')
    ? [...headGroups, ...Array(missing).fill('0'), ...tailGroups]
    : headGroups;
  if (groups.length !== 8) return null;
  return groups.slice(0, 4).map((group) => Number.parseInt(group, 16).toString(16)).join(':');
}

function prefixKey(key) {
  const separator = String(key).indexOf(':');
  if (separator < 1) return null;
  const prefix = ipv6Prefix64(String(key).slice(separator + 1));
  return prefix ? `${String(key).slice(0, separator)}:v6p:${prefix}` : null;
}

export async function checkRateLimit(key, { capacity, refillPerSec, failOpenOnMissingTable = true }) {
  try {
    const perIp = await consumeToken(key, { capacity, refillPerSec });
    const sharedKey = prefixKey(key);
    if (!perIp.ok || !sharedKey) return perIp;
    return await consumeToken(sharedKey, {
      capacity: capacity * IPV6_PREFIX_CAPACITY_MULTIPLIER,
      refillPerSec: refillPerSec * IPV6_PREFIX_CAPACITY_MULTIPLIER,
    });
  } catch (error) {
    // The rate_limit_buckets table ships in migration 0006. If the app is
    // deployed before `npm run db:migrate` has run, fail open (and say so)
    // rather than turning every write endpoint into a 500. Other database
    // errors still propagate to the caller, as does a missing table when the
    // caller opts out with failOpenOnMissingTable: false (e.g. admin login).
    if (error?.code !== UNDEFINED_TABLE || !failOpenOnMissingTable) throw error;
    if (!warnedMissingTable) {
      warnedMissingTable = true;
      log('warn', 'rate_limit.table_missing', {
        message: 'rate_limit_buckets does not exist; rate limiting is DISABLED until migrations are applied (npm run db:migrate)',
        error,
      });
    }
    return { ok: true };
  }
}

async function consumeToken(key, { capacity, refillPerSec }) {
  const windowMs = Math.ceil((capacity / refillPerSec) * 1000);
  const boundedKey = String(key).slice(0, 255);
  const result = await pool.query(`
    WITH stmt_clock AS (
      SELECT clock_timestamp() AS ts
    ), expired AS (
      DELETE FROM rate_limit_buckets
      WHERE key IN (
        SELECT key FROM rate_limit_buckets
        WHERE expires_at <= (SELECT ts FROM stmt_clock)
          AND key <> $1
        ORDER BY expires_at
        LIMIT $4
      )
    ), upserted AS (
      INSERT INTO rate_limit_buckets (key, window_started_at, request_count, expires_at)
      VALUES ($1, (SELECT ts FROM stmt_clock), 1, (SELECT ts FROM stmt_clock) + ($3 * interval '1 millisecond'))
      ON CONFLICT (key) DO UPDATE SET
        window_started_at = CASE
          WHEN rate_limit_buckets.window_started_at + ($2 * interval '1 millisecond') <= (SELECT ts FROM stmt_clock)
            THEN (SELECT ts FROM stmt_clock)
          ELSE rate_limit_buckets.window_started_at
        END,
        request_count = CASE
          WHEN rate_limit_buckets.window_started_at + ($2 * interval '1 millisecond') <= (SELECT ts FROM stmt_clock)
            THEN 1
          ELSE LEAST(rate_limit_buckets.request_count + 1, $5)
        END,
        expires_at = (SELECT ts FROM stmt_clock) + ($3 * interval '1 millisecond')
      RETURNING request_count, window_started_at
    )
    SELECT request_count, window_started_at FROM upserted
  `, [boundedKey, windowMs, windowMs * 2, CLEANUP_BATCH_SIZE, capacity + 1]);

  const bucket = result.rows[0];
  if (bucket.request_count <= capacity) return { ok: true };

  const retryAt = new Date(bucket.window_started_at).getTime() + windowMs;
  return { ok: false, retryAfter: Math.max(1, Math.ceil((retryAt - Date.now()) / 1000)) };
}

export function getClientIp(request, env = process.env) {
  // Any non-empty VERCEL value (other than '0') means we are on Vercel's trusted edge.
  const isVercel = Boolean(env.VERCEL) && env.VERCEL !== '0';
  const isCloudflare = env.TRUSTED_PROXY_PLATFORM === 'cloudflare';
  let value;

  if (isVercel) value = request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim();
  if (isCloudflare) value = request.headers.get('cf-connecting-ip')?.trim();

  if (env.TRUSTED_PROXY_PLATFORM === 'none' && isVercel) {
    // `none` collapses every client into one bucket, so anonymous traffic could lock
    // out admin login. It is only for proxy-less hosts; on Vercel the
    // real client IP is available, so ignore it.
    if (!warnedIgnoredNone) {
      warnedIgnoredNone = true;
      log('warn', 'rate_limit.none_ignored', {
        message: 'TRUSTED_PROXY_PLATFORM=none is ignored on Vercel; using the platform client IP header',
      });
    }
  }

  if (isVercel || isCloudflare) {
    if (value && isIP(value)) return value;
    throw new TrustedClientIpError('Trusted proxy did not provide a valid client IP');
  }

  if (env.TRUSTED_PROXY_PLATFORM === 'none') {
    // Explicit operator opt-in for production deployments with no trusted proxy
    // (plain Docker, `next start`). All clients share one bucket, which is
    // strict but safe: no client-controlled header is ever trusted.
    if (!warnedUntrustedProxy) {
      warnedUntrustedProxy = true;
      log('warn', 'rate_limit.untrusted_proxy', {
        message: 'TRUSTED_PROXY_PLATFORM=none: all clients share one global rate-limit bucket',
      });
    }
    return 'untrusted-proxy-global';
  }

  if (env.NODE_ENV === 'production') {
    log('error', 'rate_limit.proxy_unconfigured', {
      message: 'Set VERCEL=1, TRUSTED_PROXY_PLATFORM=cloudflare, or TRUSTED_PROXY_PLATFORM=none for production',
    });
    throw new TrustedClientIpError('No trusted proxy platform is configured');
  }

  return 'local-development';
}
