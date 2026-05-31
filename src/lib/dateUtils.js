/**
 * Parse a date string assumed to be in CST (UTC-6) and return an ISO UTC string.
 *
 * Handles three formats:
 *   1. Full ISO 8601 with timezone (e.g. "2024-01-15T10:30:00Z")
 *   2. Date-only (e.g. "2024-01-15") — treated as midnight CST
 *   3. Datetime without timezone (e.g. "2024-01-15T10:30:00") — treated as CST
 *
 * @param {string|null|undefined} dateStr
 * @returns {string|null} ISO 8601 UTC string, or null if invalid/empty
 */
export function parseCstToUtc(dateStr) {
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

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}
