import { describe, it, expect } from 'vitest';
import {
    buildPaginationMeta,
    escapeLike,
    parseJokeEdit,
    parsePagination,
    parseTopTenIds,
    toPublicJoke,
} from './jokesApi';

describe('escapeLike', () => {
    it('escapes %, _ and backslash', () => {
        expect(escapeLike('a%b_c\\d')).toBe('a\\%b\\_c\\\\d');
    });
});

describe('parsePagination', () => {
    const params = (q) => new URLSearchParams(q);
    it('defaults to page 1, limit 50', () => {
        expect(parsePagination(params(''))).toEqual({ page: 1, limit: 50 });
    });
    it('clamps values', () => {
        expect(parsePagination(params('page=-3&limit=999'))).toEqual({ page: 1, limit: 200 });
        expect(parsePagination(params('page=4&limit=10'))).toEqual({ page: 4, limit: 10 });
    });
});

describe('buildPaginationMeta', () => {
    it('computes pages and tolerates missing total', () => {
        expect(buildPaginationMeta({ page: 1, limit: 10, total: 25 })).toEqual({ page: 1, limit: 10, total: 25, pages: 3 });
        expect(buildPaginationMeta({ page: 1, limit: 10, total: undefined })).toEqual({ page: 1, limit: 10, total: 0, pages: 0 });
    });
});

describe('parseTopTenIds', () => {
    it('treats missing jokeIds as empty', () => {
        expect(parseTopTenIds(null)).toEqual({ ok: true, ids: [] });
        expect(parseTopTenIds({ jokeIds: 'x' })).toEqual({ ok: true, ids: [] });
    });
    it('dedupes preserving order and parses strings', () => {
        expect(parseTopTenIds({ jokeIds: [3, '1', 3, 2, 1] })).toEqual({ ok: true, ids: [3, 1, 2] });
    });
    it('rejects more than 15 entries', () => {
        const res = parseTopTenIds({ jokeIds: Array.from({ length: 16 }, (_, i) => i + 1) });
        expect(res).toEqual({ ok: false, error: 'You can only stage up to 15 jokes before saving.' });
    });
    it('rejects non-positive or non-numeric ids', () => {
        const error = 'jokeIds must contain valid positive integers.';
        expect(parseTopTenIds({ jokeIds: [1, 0] })).toEqual({ ok: false, error });
        expect(parseTopTenIds({ jokeIds: ['abc'] })).toEqual({ ok: false, error });
    });
});

describe('parseJokeEdit', () => {
    it('trims valid input', () => {
        expect(parseJokeEdit({ setup: ' a ', punchline: ' b ' })).toEqual({ ok: true, value: { setup: 'a', punchline: 'b' } });
    });
    it('requires setup before punchline', () => {
        expect(parseJokeEdit({ setup: ' ', punchline: '' })).toEqual({ ok: false, error: 'Setup is required' });
        expect(parseJokeEdit({ setup: 'a' })).toEqual({ ok: false, error: 'Punchline is required' });
    });
});

describe('toPublicJoke', () => {
    it('returns punchline for two-liners', () => {
        expect(toPublicJoke({ setup: 's', punchline: 'p' })).toEqual({ setup: 's', punchline: 'p', isOneLiner: false });
    });
    it('flags one-liners', () => {
        expect(toPublicJoke({ setup: 's', punchline: '  ' })).toEqual({ setup: 's', punchline: null, isOneLiner: true });
        expect(toPublicJoke({ setup: 's', punchline: null }).isOneLiner).toBe(true);
    });
});
