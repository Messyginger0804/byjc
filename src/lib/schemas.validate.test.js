import { describe, expect, it } from 'vitest';
import { blogSchema, blogPatchSchema, commentSchema, validateBody } from './schemas.js';

const validBlog = {
    title: 'T', description: 'D', content: 'C', slug: 'a-b-1',
};
const errorsFor = async (schema, body) => {
    const r = await validateBody(schema, body);
    return r.ok ? null : r.errors;
};

describe('validate: body shape', () => {
    it('rejects non-objects with "Must be a JSON object"', () => {
        for (const bad of [null, undefined, 'x', 1, true, []]) {
            try {
                commentSchema.validate(bad);
                throw new Error('should throw');
            } catch (err) {
                expect(err.message).toBe('Validation failed');
                expect(err.errors).toEqual(['Must be a JSON object']);
            }
        }
    });

    it('keeps unknown keys unless stripUnknown, and strips them when set', () => {
        const body = { name: 'a', body: 'b', extra: 1 };
        expect(commentSchema.validate(body)).toEqual({ name: 'a', body: 'b', extra: 1 });
        expect(commentSchema.validate(body, { stripUnknown: true })).toEqual({ name: 'a', body: 'b' });
    });

    it('collects every field error in field order', async () => {
        expect(await errorsFor(commentSchema, {})).toEqual(['This field is required', 'This field is required']);
        expect(await errorsFor(commentSchema, { name: 1, body: '' })).toEqual(['Must be a string', 'This field is required']);
    });
});

describe('validate: string rules', () => {
    it('requires missing, null and blank required fields', async () => {
        expect(await errorsFor(commentSchema, { body: 'b' })).toEqual(['This field is required']);
        expect(await errorsFor(commentSchema, { name: null, body: 'b' })).toEqual(['This field is required']);
        expect(await errorsFor(commentSchema, { name: '   ', body: 'b' })).toEqual(['This field is required']);
    });

    it('trims values and enforces min/max on the trimmed length', async () => {
        const r = await validateBody(commentSchema, { name: '  bob  ', body: 'b' });
        expect(r).toEqual({ ok: true, value: { name: 'bob', body: 'b' } });
        expect((await validateBody(commentSchema, { name: ` ${'a'.repeat(80)} `, body: 'b' })).ok).toBe(true);
        expect(await errorsFor(commentSchema, { name: 'a'.repeat(81), body: 'b' })).toEqual(['Must be at most 80 characters']);
        expect(await errorsFor(blogSchema, { ...validBlog, content: '' })).toEqual(['This field is required']);
    });

    it('reports min length for non-required fields', async () => {
        const schema = { ...blogPatchSchema };
        expect(await errorsFor(schema, { title: 'x'.repeat(201) })).toEqual(['Must be at most 200 characters']);
    });

    it('validates the slug format after trimming', async () => {
        expect((await validateBody(blogSchema, { ...validBlog, slug: ' ok-1 ' })).value.slug).toBe('ok-1');
        expect(await errorsFor(blogSchema, { ...validBlog, slug: 'Bad_Slug' })).toEqual(['Invalid format']);
        expect(await errorsFor(blogSchema, { ...validBlog, slug: 'a'.repeat(121) })).toEqual(['Must be at most 120 characters']);
    });

    it('optional strings: undefined stays undefined, empty string is allowed', async () => {
        const r = await validateBody(blogSchema, { ...validBlog, author: '   ' });
        expect(r.value.author).toBe('');
        expect(r.value.image_url).toBeUndefined();
    });

    it('null is only accepted for nullable strings', async () => {
        expect((await validateBody(blogSchema, { ...validBlog, image_url: null })).value.image_url).toBeNull();
        expect(await errorsFor(blogSchema, { ...validBlog, author: null })).toEqual(['Must be a string']);
        expect(await errorsFor(blogPatchSchema, { author: null })).toEqual(['Must be a string']);
    });

    it('rejects non-string values', async () => {
        for (const bad of [1, true, {}, []]) {
            expect(await errorsFor(commentSchema, { name: bad, body: 'b' })).toEqual(['Must be a string']);
        }
    });
});

describe('validate: arrays, booleans, datetimes', () => {
    it('validates arrays', async () => {
        expect(await errorsFor(blogSchema, { ...validBlog, tags: 'x' })).toEqual(['Must be an array']);
        expect(await errorsFor(blogSchema, { ...validBlog, tags: Array(21).fill('a') })).toEqual(['Must have at most 20 items']);
        expect(await errorsFor(blogSchema, { ...validBlog, tags: ['a'.repeat(41)] })).toEqual(['Must be at most 40 characters']);
        expect((await validateBody(blogSchema, { ...validBlog, tags: [' a ', 'b'] })).value.tags).toEqual(['a', 'b']);
        expect((await validateBody(blogSchema, validBlog)).value.tags).toBeUndefined();
    });

    it('validates booleans', async () => {
        expect(await errorsFor(blogSchema, { ...validBlog, is_featured: 'true' })).toEqual(['Must be a boolean']);
        expect((await validateBody(blogSchema, { ...validBlog, is_featured: false })).value.is_featured).toBe(false);
    });

    it('validates datetimes', async () => {
        expect(await errorsFor(blogSchema, { ...validBlog, published_at: 'nope' })).toEqual(['Must be a valid ISO date or datetime']);
        expect(await errorsFor(blogSchema, { ...validBlog, published_at: 5 })).toEqual(['Must be a string']);
        const ok = await validateBody(blogSchema, { ...validBlog, published_at: ' 2026-07-15T10:00 ' });
        expect(ok.value.published_at).toBe('2026-07-15T10:00');
        expect((await validateBody(blogSchema, { ...validBlog, published_at: null })).value.published_at).toBeNull();
        expect((await validateBody(blogSchema, validBlog)).value.published_at).toBeUndefined();
    });
});

describe('validateBody', () => {
    it('falls back to err.message when the error has no errors list', async () => {
        const r = await validateBody({ validate() { throw new Error('boom'); } }, {});
        expect(r).toEqual({ ok: false, errors: ['boom'] });
    });
});
