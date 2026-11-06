import { describe, it, expect } from 'vitest';
import {
    featuredSlotError,
    uniqueViolationResponse,
    buildBlogUpdates,
    resolvePublishedAt,
    normalizeTags,
} from './blogApi';
import { FEATURED_SLOTS } from './constants';

describe('featuredSlotError', () => {
    it('accepts undefined, null and valid slots', () => {
        expect(featuredSlotError(undefined)).toBeNull();
        expect(featuredSlotError(null)).toBeNull();
        expect(featuredSlotError(FEATURED_SLOTS[0])).toBeNull();
    });
    it('rejects invalid slots with the slot list', () => {
        expect(featuredSlotError('bogus')).toBe(
            'Invalid featured_slot. Must be null or one of: ' + FEATURED_SLOTS.join(', ')
        );
    });
});

describe('uniqueViolationResponse', () => {
    it('returns null for non-unique errors', () => {
        expect(uniqueViolationResponse(new Error('x'))).toBeNull();
        expect(uniqueViolationResponse(undefined)).toBeNull();
    });
    it('maps slug conflicts, including via err.cause', () => {
        const expected = { status: 409, error: 'Blog slug already in use' };
        expect(uniqueViolationResponse({ code: '23505' })).toEqual(expected);
        expect(uniqueViolationResponse({ cause: { code: '23505', constraint: 'blogs_slug_key' } })).toEqual(expected);
    });
    it('maps featured slot conflicts', () => {
        expect(uniqueViolationResponse({ cause: { code: '23505', constraint: 'blogs_featured_slot_unique' } })).toEqual({
            status: 409,
            error: 'Featured slot assignment conflicted; retry the request',
        });
    });
});

describe('buildBlogUpdates', () => {
    it('always sets updated_at and only includes provided fields', () => {
        const updates = buildBlogUpdates({ title: 'T', is_featured: false, featured_slot: null });
        expect(Object.keys(updates).sort()).toEqual(['featured_slot', 'is_featured', 'title', 'updated_at']);
        expect(updates.is_featured).toBe(false);
        expect(updates.featured_slot).toBeNull();
    });
    it('maps slug and ignores unknown keys', () => {
        const updates = buildBlogUpdates({ slug: 'new', other: 1 });
        expect(updates.slug).toBe('new');
        expect('other' in updates).toBe(false);
        expect('published_at' in updates).toBe(false);
    });
    it('parses published_at into a Date and skips unparseable values', () => {
        expect(buildBlogUpdates({ published_at: '2024-01-02T03:04:05Z' }).published_at).toBeInstanceOf(Date);
        expect('published_at' in buildBlogUpdates({ published_at: 'not a date' })).toBe(false);
    });
});

describe('resolvePublishedAt', () => {
    it('returns the parsed date when valid', () => {
        expect(resolvePublishedAt('2024-01-02T03:04:05Z').toISOString()).toBe('2024-01-02T03:04:05.000Z');
    });
    it('falls back to now when missing or invalid', () => {
        const before = Date.now();
        expect(resolvePublishedAt(undefined).getTime()).toBeGreaterThanOrEqual(before);
        expect(resolvePublishedAt('garbage').getTime()).toBeGreaterThanOrEqual(before);
    });
});

describe('normalizeTags', () => {
    it('passes arrays through and coerces everything else to []', () => {
        expect(normalizeTags(['a'])).toEqual(['a']);
        expect(normalizeTags(null)).toEqual([]);
        expect(normalizeTags('a')).toEqual([]);
    });
});
