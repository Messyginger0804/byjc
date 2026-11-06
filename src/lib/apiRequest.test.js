import { describe, it, expect } from 'vitest';
import { parsePositiveInt, readJsonBody, readValidatedBody } from './apiRequest';
import { jokeSchema } from './schemas';

const req = (json) => ({ json: json instanceof Error ? async () => { throw json; } : async () => json });

describe('parsePositiveInt', () => {
    it('parses positive integers', () => {
        expect(parsePositiveInt('12')).toBe(12);
        expect(parsePositiveInt(7)).toBe(7);
    });
    it('returns null for invalid values', () => {
        for (const v of ['0', '-1', 'abc', undefined, null, '']) expect(parsePositiveInt(v)).toBeNull();
    });
});

describe('readJsonBody', () => {
    it('returns the parsed value', async () => {
        expect(await readJsonBody(req({ a: 1 }))).toEqual({ ok: true, value: { a: 1 } });
    });
    it('returns a 400 response on bad JSON', async () => {
        const res = await readJsonBody(req(new SyntaxError('bad')));
        expect(res.ok).toBe(false);
        expect(res.response.status).toBe(400);
        expect(await res.response.json()).toEqual({ error: 'Invalid JSON' });
    });
});

describe('readValidatedBody', () => {
    it('returns a 400 with errors when validation fails', async () => {
        const res = await readValidatedBody(req({}), jokeSchema);
        expect(res.ok).toBe(false);
        expect(res.response.status).toBe(400);
        const json = await res.response.json();
        expect(json.error).toBe('Validation failed');
        expect(json.errors).toBeDefined();
    });
    it('passes through invalid JSON response', async () => {
        const res = await readValidatedBody(req(new SyntaxError('x')), jokeSchema);
        expect(res.response.status).toBe(400);
    });
});
