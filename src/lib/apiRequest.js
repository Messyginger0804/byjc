import { NextResponse } from 'next/server';
import { validateBody } from '@/lib/schemas';
import { checkRateLimit, getClientIp, TrustedClientIpError } from '@/lib/rateLimit';

export function errorResponse(message, status, extra = {}) {
    return NextResponse.json({ error: message, ...extra }, { status });
}

/** Parse a positive integer route/body value; returns null when invalid. */
export function parsePositiveInt(raw) {
    const parsed = Number.parseInt(raw, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/** Read the JSON body. Returns `{ ok: true, value }` or `{ ok: false, response }` (400). */
export async function readJsonBody(request) {
    try {
        return { ok: true, value: await request.json() };
    } catch {
        return { ok: false, response: errorResponse('Invalid JSON', 400) };
    }
}

/** Read and validate a JSON body against a schema. Returns `{ ok, value }` or `{ ok: false, response }`. */
export async function readValidatedBody(request, schema) {
    const parsed = await readJsonBody(request);
    if (!parsed.ok) return parsed;

    const validated = await validateBody(schema, parsed.value);
    if (!validated.ok) {
        return { ok: false, response: errorResponse('Validation failed', 400, { errors: validated.errors }) };
    }
    return { ok: true, value: validated.value };
}

/** Per-IP rate limit (5 requests, refilled over a minute). Returns a 429 response or null. */
export async function rateLimitByIp(request, prefix) {
    const limit = await checkRateLimit(`${prefix}:${getClientIp(request)}`, { capacity: 5, refillPerSec: 5 / 60 });
    if (limit.ok) return null;
    return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
}

/** 503 response for TrustedClientIpError, otherwise null. */
export function trustedClientIpErrorResponse(err) {
    if (!(err instanceof TrustedClientIpError)) return null;
    return errorResponse('Unable to establish trusted client identity', 503);
}
