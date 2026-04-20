import { describe, it, expect } from 'vitest';

function parseCstToUtc(dateStr) {
    if (!dateStr) return null;
    
    const hasTimezone = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/.test(dateStr);
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    
    let date;
    if (hasTimezone) {
        date = new Date(dateStr);
    } else if (isDateOnly) {
        date = new Date(dateStr + 'T00:00:00-06:00');
    } else {
        date = new Date(dateStr + '-06:00');
    }
    
    if (isNaN(date.getTime())) {
        return null;
    }
    
    return date.toISOString();
}

describe('parseCstToUtc', () => {
    it('converts CST date without timezone to UTC', () => {
        const result = parseCstToUtc('2026-04-20T10:00:00');
        
        expect(result).toBeTruthy();
        expect(result).toBe('2026-04-20T16:00:00.000Z');
    });

    it('preserves UTC timezone when Z suffix provided', () => {
        const result = parseCstToUtc('2026-04-20T10:00:00Z');
        
        expect(result).toBeTruthy();
        expect(result).toBe('2026-04-20T10:00:00.000Z');
    });

    it('preserves explicit offset timezone', () => {
        const result = parseCstToUtc('2026-04-20T10:00:00+00:00');
        
        expect(result).toBeTruthy();
        expect(result).toBe('2026-04-20T10:00:00.000Z');
    });

    it('returns null for null input', () => {
        expect(parseCstToUtc(null)).toBeNull();
        expect(parseCstToUtc(undefined)).toBeNull();
    });

    it('returns null for invalid date string', () => {
        expect(parseCstToUtc('not-a-date')).toBeNull();
    });

    it('handles date-only strings as midnight CST', () => {
        const result = parseCstToUtc('2026-04-20');
        
        expect(result).toBeTruthy();
        const parsed = new Date(result);
        expect(parsed.getUTCHours()).toBe(6);
    });

    it('converts 8am CST to 2pm UTC', () => {
        const result = parseCstToUtc('2026-04-20T08:00:00');
        
        expect(result).toBeTruthy();
        expect(result).toBe('2026-04-20T14:00:00.000Z');
    });
});

describe('scheduling logic', () => {
    it('future CST date should not be visible yet', () => {
        const futureCst = '2099-12-31T23:59:59';
        const utc = parseCstToUtc(futureCst);
        
        expect(utc).toBeTruthy();
        expect(new Date(utc) > new Date()).toBe(true);
    });

    it('past CST date should be visible', () => {
        const pastCst = '2020-01-01T12:00:00';
        const utc = parseCstToUtc(pastCst);
        
        expect(utc).toBeTruthy();
        expect(new Date(utc) < new Date()).toBe(true);
    });

    it('null published_at results in null (API will default to NOW())', () => {
        expect(parseCstToUtc(null)).toBeNull();
    });
});