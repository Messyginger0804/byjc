import { describe, expect, it } from 'vitest';
import { BLOG_TIME_ZONE, parseBlogDateToUtc } from './dateUtils.js';

describe('parseBlogDateToUtc', () => {
    it('uses the America/Chicago IANA zone including daylight saving time', () => {
        expect(BLOG_TIME_ZONE).toBe('America/Chicago');
        expect(parseBlogDateToUtc('2026-01-15T10:00:00')).toBe('2026-01-15T16:00:00.000Z');
        expect(parseBlogDateToUtc('2026-07-15T10:00:00')).toBe('2026-07-15T15:00:00.000Z');
    });

    it('rejects normalized and nonexistent local dates', () => {
        expect(parseBlogDateToUtc('2026-02-30T10:00:00')).toBeNull();
        expect(parseBlogDateToUtc('2026-03-08T02:30:00')).toBeNull();
    });

    it('strictly validates explicit offsets', () => {
        expect(parseBlogDateToUtc('2026-07-15T10:00:00-05:00')).toBe('2026-07-15T15:00:00.000Z');
        expect(parseBlogDateToUtc('2026-07-15 10:00:00')).toBeNull();
        expect(parseBlogDateToUtc('2026-07-15T10:00:00+14:30')).toBeNull();
        expect(parseBlogDateToUtc(123)).toBeNull();
    });
});
