import { describe, expect, it } from 'vitest';
import { BLOG_TIME_ZONE, parseBlogDateToUtc } from './dateUtils.js';

describe('parseBlogDateToUtc', () => {
    it('uses the America/Chicago IANA zone including daylight saving time', () => {
        expect(BLOG_TIME_ZONE).toBe('America/Chicago');
        expect(parseBlogDateToUtc('2026-01-15T10:00:00')).toBe('2026-01-15T16:00:00.000Z');
        expect(parseBlogDateToUtc('2026-07-15T10:00:00')).toBe('2026-07-15T15:00:00.000Z');
    });

    it('accepts minute-precision timestamps', () => {
        expect(parseBlogDateToUtc('2026-07-15T10:00')).toBe('2026-07-15T15:00:00.000Z');
        expect(parseBlogDateToUtc('2026-07-15T10:00Z')).toBe('2026-07-15T10:00:00.000Z');
        expect(parseBlogDateToUtc('2026-07-15T10:00-05:00')).toBe('2026-07-15T15:00:00.000Z');
    });

    it('preserves milliseconds when converting naive timestamps', () => {
        expect(parseBlogDateToUtc('2026-07-15T10:00:00.123')).toBe('2026-07-15T15:00:00.123Z');
        expect(parseBlogDateToUtc('2026-07-15T10:00:00.400')).toBe('2026-07-15T15:00:00.400Z');
        expect(parseBlogDateToUtc('2026-01-15T10:00:00.5')).toBe('2026-01-15T16:00:00.500Z');
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

    it('resolves the fall-back overlap to the earlier (daylight-time) occurrence', () => {
        expect(parseBlogDateToUtc('2026-11-01T01:30:00')).toBe('2026-11-01T06:30:00.000Z');
    });

    it('rejects instants outside the four-digit UTC year range', () => {
        expect(parseBlogDateToUtc('9999-12-31T23:30:00')).toBeNull();
        expect(parseBlogDateToUtc('9999-12-31T23:30:00-05:00')).toBeNull();
        expect(parseBlogDateToUtc('9999-12-31T18:59:59-05:00')).toBe('9999-12-31T23:59:59.000Z');
    });
});
