import { describe, expect, it } from 'vitest';
import { blogPatchSchema, validateBody } from './schemas.js';

describe('blogPatchSchema', () => {
    it('preserves omission instead of requiring or defaulting unrelated fields', async () => {
        const result = await validateBody(blogPatchSchema, { featured_slot: 'featured-main' });

        expect(result).toEqual({
            ok: true,
            value: {
                title: undefined,
                description: undefined,
                content: undefined,
                slug: undefined,
                author: undefined,
                tags: undefined,
                image_url: undefined,
                is_published: undefined,
                is_featured: undefined,
                featured_slot: 'featured-main',
                published_at: undefined,
            },
        });
    });

    it('still rejects an explicitly empty required-on-create field', async () => {
        const result = await validateBody(blogPatchSchema, { title: '   ' });
        expect(result.ok).toBe(false);
    });

    it('rejects coercible values with the wrong JSON type', async () => {
        const result = await validateBody(blogPatchSchema, {
            title: 123,
            is_published: 'false',
            tags: ['valid', 42],
        });

        expect(result.ok).toBe(false);
        expect(result.errors).toContain('Must be a string');
        expect(result.errors).toContain('Must be a boolean');
    });

    it('rejects nulls for non-nullable fields and non-object payloads', async () => {
        expect(() => blogPatchSchema.validate(null)).toThrow('Validation failed');
        for (const payload of [{ title: null }, { tags: null }, { is_published: null }]) {
            const result = await validateBody(blogPatchSchema, payload);
            expect(result.ok).toBe(false);
        }
    });

    it('returns normalized array items', async () => {
        const result = await validateBody(blogPatchSchema, { tags: ['  one  ', 'two '] });
        expect(result.ok).toBe(true);
        expect(result.value.tags).toEqual(['one', 'two']);
    });

    it('accepts minute-precision published_at values', async () => {
        const result = await validateBody(blogPatchSchema, { published_at: '2026-07-15T10:00' });
        expect(result.ok).toBe(true);
    });

    it('rejects invalid calendar dates', async () => {
        const result = await validateBody(blogPatchSchema, { published_at: '2026-02-30T10:00:00' });
        expect(result.ok).toBe(false);
    });
});

import { blogSchema, commentSchema, jokeSchema } from './schemas.js';

describe('stringField rules via blogSchema', () => {
    const base = { title: 't', description: 'd', content: 'c', slug: 'ok-slug' };

    it('accepts a minimal valid blog and trims strings', async () => {
        const r = await validateBody(blogSchema, { ...base, title: '  padded  ' });
        expect(r.ok).toBe(true);
        expect(r.value.title).toBe('padded');
    });

    it('reports every missing required field', async () => {
        const r = await validateBody(blogSchema, {});
        expect(r.ok).toBe(false);
        expect(r.errors.filter((e) => e === 'This field is required')).toHaveLength(4);
    });

    it('treats null required field as required and null optional non-nullable as a type error', async () => {
        const r1 = await validateBody(blogSchema, { ...base, title: null });
        expect(r1.errors).toEqual(['This field is required']);
        const r2 = await validateBody(blogSchema, { ...base, author: null });
        expect(r2.errors).toEqual(['Must be a string']);
    });

    it('accepts null for nullable fields', async () => {
        const r = await validateBody(blogSchema, { ...base, image_url: null, featured_slot: null, published_at: null });
        expect(r.ok).toBe(true);
        expect(r.value.image_url).toBeNull();
    });

    it('rejects whitespace-only required strings', async () => {
        const r = await validateBody(blogSchema, { ...base, content: '   ' });
        expect(r.errors).toEqual(['This field is required']);
    });

    it('enforces max length', async () => {
        const r = await validateBody(blogSchema, { ...base, title: 'x'.repeat(201) });
        expect(r.errors).toEqual(['Must be at most 200 characters']);
    });

    it('enforces min length', async () => {
        const r = await validateBody(commentSchema, { name: 'a', body: '' });
        expect(r.errors).toContain('This field is required');
        const custom = await validateBody(jokeSchema, { setup: 'ok', punchline: 'ok' });
        expect(custom.ok).toBe(true);
    });

    it('enforces the slug format', async () => {
        for (const slug of ['Has Caps', 'under_score', 'a/b']) {
            const r = await validateBody(blogSchema, { ...base, slug });
            expect(r.errors).toEqual(['Invalid format']);
        }
    });
});

describe('arrayField / booleanField / dateTimeField via blogSchema', () => {
    const base = { title: 't', description: 'd', content: 'c', slug: 'ok' };

    it('rejects a non-array tags value', async () => {
        const r = await validateBody(blogSchema, { ...base, tags: 'a,b' });
        expect(r.errors).toEqual(['Must be an array']);
    });

    it('rejects too many tags', async () => {
        const r = await validateBody(blogSchema, { ...base, tags: Array.from({ length: 21 }, (_, i) => `t${i}`) });
        expect(r.errors).toEqual(['Must have at most 20 items']);
    });

    it('rejects an over-long tag', async () => {
        const r = await validateBody(blogSchema, { ...base, tags: ['x'.repeat(41)] });
        expect(r.errors).toEqual(['Must be at most 40 characters']);
    });

    it('rejects non-boolean flags', async () => {
        const r = await validateBody(blogSchema, { ...base, is_featured: 1 });
        expect(r.errors).toEqual(['Must be a boolean']);
    });

    it('accepts boolean flags and valid dates', async () => {
        const r = await validateBody(blogSchema, { ...base, is_published: false, published_at: '2026-01-01' });
        expect(r.ok).toBe(true);
        expect(r.value.is_published).toBe(false);
    });

    it('rejects unparseable dates and non-string dates', async () => {
        const r = await validateBody(blogSchema, { ...base, published_at: 'tomorrow' });
        expect(r.errors).toEqual(['Must be a valid ISO date or datetime']);
        const r2 = await validateBody(blogSchema, { ...base, published_at: 5 });
        expect(r2.errors).toEqual(['Must be a string']);
    });
});

describe('buildValidator body handling', () => {
    it('rejects arrays and primitives as bodies', async () => {
        for (const body of [[], 'str', 5, null, undefined]) {
            const r = await validateBody(commentSchema, body);
            expect(r).toEqual({ ok: false, errors: ['Must be a JSON object'] });
        }
    });

    it('strips unknown keys via validateBody but keeps them when validate is called directly', async () => {
        const body = { name: 'n', body: 'b', extra: 1 };
        expect((await validateBody(commentSchema, body)).value).toEqual({ name: 'n', body: 'b' });
        expect(commentSchema.validate(body)).toEqual({ name: 'n', body: 'b', extra: 1 });
    });

    it('falls back to err.message when the thrown error has no errors array', async () => {
        const r = await validateBody({ validate: () => { throw new Error('kaboom'); } }, {});
        expect(r).toEqual({ ok: false, errors: ['kaboom'] });
    });
});
