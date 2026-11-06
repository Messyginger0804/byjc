import { describe, it, expect } from 'vitest';
import { parseBlogDateToUtc } from '../../../lib/dateUtils.js';

describe('parseBlogDateToUtc', () => {
    it('uses daylight time for an America/Chicago spring date', () => {
        expect(parseBlogDateToUtc('2026-04-20T10:00:00')).toBe('2026-04-20T15:00:00.000Z');
    });

    it('preserves UTC timezone when Z suffix provided', () => {
        const result = parseBlogDateToUtc('2026-04-20T10:00:00Z');
        
        expect(result).toBeTruthy();
        expect(result).toBe('2026-04-20T10:00:00.000Z');
    });

    it('preserves explicit offset timezone', () => {
        const result = parseBlogDateToUtc('2026-04-20T10:00:00+00:00');
        
        expect(result).toBeTruthy();
        expect(result).toBe('2026-04-20T10:00:00.000Z');
    });

    it('returns null for null input', () => {
        expect(parseBlogDateToUtc(null)).toBeNull();
        expect(parseBlogDateToUtc(undefined)).toBeNull();
    });

    it('returns null for invalid date string', () => {
        expect(parseBlogDateToUtc('not-a-date')).toBeNull();
        expect(parseBlogDateToUtc('2026-03-08T02:30:00')).toBeNull();
    });

    it('handles date-only strings as midnight CST', () => {
        const result = parseBlogDateToUtc('2026-04-20');
        
        expect(result).toBeTruthy();
        const parsed = new Date(result);
        expect(parsed.getUTCHours()).toBe(5);
    });

    it('converts 8am CST to 2pm UTC', () => {
        const result = parseBlogDateToUtc('2026-04-20T08:00:00');
        
        expect(result).toBeTruthy();
        expect(result).toBe('2026-04-20T13:00:00.000Z');
    });
});

describe('scheduling logic', () => {
    it('future CST date should not be visible yet', () => {
        const futureCst = '2099-12-31T23:59:59';
        const utc = parseBlogDateToUtc(futureCst);
        
        expect(utc).toBeTruthy();
        expect(new Date(utc) > new Date()).toBe(true);
    });

    it('past CST date should be visible', () => {
        const pastCst = '2020-01-01T12:00:00';
        const utc = parseBlogDateToUtc(pastCst);
        
        expect(utc).toBeTruthy();
        expect(new Date(utc) < new Date()).toBe(true);
    });

    it('null published_at results in null (API will default to NOW())', () => {
        expect(parseBlogDateToUtc(null)).toBeNull();
    });
});
