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
