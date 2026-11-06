import { parsePositiveInt } from '@/lib/apiRequest';

const MAX_STAGED_JOKES = 15;
export const TOP_TEN_SIZE = 10;

/**
 * Escape LIKE metacharacters so user input can't inject wildcards.
 * Note: backslash escaping is PostgreSQL-specific (requires standard_conforming_strings=on).
 */
export function escapeLike(str) {
    return str.replace(/[%_\\]/g, '\\$&');
}

/** Page/limit query params with defaults (1 / 50) and a 200 cap. */
export function parsePagination(searchParams) {
    const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit'), 10) || 50));
    return { page, limit };
}

/** Pagination meta block for list responses. */
export function buildPaginationMeta({ page, limit, total }) {
    const count = total || 0;
    return { page, limit, total: count, pages: Math.ceil(count / limit) };
}

/**
 * Validate and de-duplicate staged top-10 ids (order preserved).
 * Returns `{ ok: true, ids }` or `{ ok: false, error }`.
 */
export function parseTopTenIds(body) {
    const incoming = Array.isArray(body?.jokeIds) ? body.jokeIds : [];
    if (incoming.length > MAX_STAGED_JOKES) {
        return { ok: false, error: `You can only stage up to ${MAX_STAGED_JOKES} jokes before saving.` };
    }

    const ids = new Set();
    for (const value of incoming) {
        const parsed = parsePositiveInt(value);
        if (parsed === null) {
            return { ok: false, error: 'jokeIds must contain valid positive integers.' };
        }
        ids.add(parsed);
    }
    return { ok: true, ids: [...ids] };
}

/**
 * Validate the setup/punchline of an edit payload (throws on a null payload, like destructuring).
 * Returns `{ ok: true, value: { setup, punchline } }` (trimmed) or `{ ok: false, error }`.
 */
export function parseJokeEdit(payload) {
    const { setup, punchline } = payload;
    if (!setup?.trim()) return { ok: false, error: 'Setup is required' };
    if (!punchline?.trim()) return { ok: false, error: 'Punchline is required' };
    return { ok: true, value: { setup: setup.trim(), punchline: punchline.trim() } };
}

/** Public shape for the random-joke endpoint. */
export function toPublicJoke(joke) {
    const isOneLiner = !joke.punchline || joke.punchline.trim() === '';
    return {
        setup: joke.setup,
        punchline: isOneLiner ? null : joke.punchline,
        isOneLiner,
    };
}
