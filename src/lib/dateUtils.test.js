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

describe('parseBlogDateToUtc input formats', () => {
    it('accepts date-only values as Chicago midnight', () => {
        expect(parseBlogDateToUtc('2026-01-15')).toBe('2026-01-15T06:00:00.000Z');
        expect(parseBlogDateToUtc('2026-07-15')).toBe('2026-07-15T05:00:00.000Z');
    });

    it('rejects zones on date-only values', () => {
        expect(parseBlogDateToUtc('2026-07-15Z')).toBeNull();
        expect(parseBlogDateToUtc('2026-07-15+05:00')).toBeNull();
    });

    it('accepts Z and numeric offsets with or without a colon', () => {
        expect(parseBlogDateToUtc('2026-07-15T10:00:00Z')).toBe('2026-07-15T10:00:00.000Z');
        expect(parseBlogDateToUtc('2026-07-15T10:00:00+0530')).toBe('2026-07-15T04:30:00.000Z');
        expect(parseBlogDateToUtc('2026-07-15T10:00:00+05:30')).toBe('2026-07-15T04:30:00.000Z');
        expect(parseBlogDateToUtc('2026-07-15T10:00:00-0500')).toBe('2026-07-15T15:00:00.000Z');
        expect(parseBlogDateToUtc('2026-07-15T10:00:00.250Z')).toBe('2026-07-15T10:00:00.250Z');
        expect(parseBlogDateToUtc('2026-07-15T10:00:00.25+01:00')).toBe('2026-07-15T09:00:00.250Z');
    });

    it('enforces offset limits', () => {
        expect(parseBlogDateToUtc('2026-07-15T10:00:00+14:00')).toBe('2026-07-14T20:00:00.000Z');
        expect(parseBlogDateToUtc('2026-07-15T10:00:00-14:00')).toBe('2026-07-16T00:00:00.000Z');
        expect(parseBlogDateToUtc('2026-07-15T10:00:00+15:00')).toBeNull();
        expect(parseBlogDateToUtc('2026-07-15T10:00:00+05:60')).toBeNull();
        expect(parseBlogDateToUtc('2026-07-15T10:00:00-14:30')).toBeNull();
    });

    it('rejects malformed strings and non-strings', () => {
        for (const bad of ['', ' 2026-07-15', '2026-07-15 ', '2026-7-15', '26-07-15', '2026-07-15T10', '2026-07-15T10:00:00.1234', '2026-07-15T10:00:00+5', 'garbage']) {
            expect(parseBlogDateToUtc(bad)).toBeNull();
        }
        for (const bad of [null, undefined, {}, [], new Date()]) {
            expect(parseBlogDateToUtc(bad)).toBeNull();
        }
    });

    it('rejects out-of-range components', () => {
        for (const bad of ['0999-01-01', '2026-00-10', '2026-13-10', '2026-01-00', '2026-04-31', '2026-01-01T24:00:00', '2026-01-01T10:60:00', '2026-01-01T10:00:60']) {
            expect(parseBlogDateToUtc(bad)).toBeNull();
        }
        expect(parseBlogDateToUtc('2024-02-29')).not.toBeNull();
        expect(parseBlogDateToUtc('2026-02-29')).toBeNull();
        expect(parseBlogDateToUtc('2026-01-01T23:59:59.999Z')).toBe('2026-01-01T23:59:59.999Z');
    });

    it('rejects results before year 0 and keeps the earliest valid year-1000 floor', () => {
        expect(parseBlogDateToUtc('1000-01-01T00:00:00Z')).toBe('1000-01-01T00:00:00.000Z');
    });
});
