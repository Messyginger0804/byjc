export const BLOG_TIME_ZONE = 'America/Chicago';

const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?(?:(Z)|([+-])(\d{2}):?(\d{2}))?$/;

function validParts({ year, month, day, hour, minute, second, millisecond }) {
    if (year < 1000 || month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59 || millisecond > 999) return false;
    return day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function zonedParts(date, timeZone) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hourCycle: 'h23',
    });
    return Object.fromEntries(formatter.formatToParts(date)
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, Number(part.value)]));
}

function localTimeToUtc(parts, timeZone) {
    const localAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, parts.millisecond);
    let candidate = localAsUtc;
    for (let attempt = 0; attempt < 2; attempt += 1) {
        const observed = zonedParts(new Date(candidate), timeZone);
        const observedAsUtc = Date.UTC(observed.year, observed.month - 1, observed.day, observed.hour, observed.minute, observed.second, new Date(candidate).getUTCMilliseconds());
        candidate -= observedAsUtc - localAsUtc;
    }

    const observed = zonedParts(new Date(candidate), timeZone);
    const matches = ['year', 'month', 'day', 'hour', 'minute', 'second']
        .every((key) => observed[key] === parts[key]);
    if (!matches) return null;
    const result = new Date(candidate);
    const year = result.getUTCFullYear();
    return year >= 0 && year <= 9999 ? result.toISOString() : null;
}

/**
 * Parse a strict ISO date/datetime. Naive values use America/Chicago.
 * Ambiguous fall-back local times (e.g. 2026-11-01T01:30:00) resolve to the
 * earlier (daylight-time, UTC-5) occurrence; nonexistent spring-forward times
 * return null. Results outside UTC years 0000-9999 return null.
 */
export function parseBlogDateToUtc(dateStr) {
    if (typeof dateStr !== 'string') return null;
    const match = DATE_TIME_PATTERN.exec(dateStr);
    if (!match) return null;

    const hasTime = match[4] !== undefined;
    const hasZone = Boolean(match[8] || match[9]);
    if (hasZone && !hasTime) return null;

    const parts = {
        year: Number(match[1]), month: Number(match[2]), day: Number(match[3]),
        hour: Number(match[4] || 0), minute: Number(match[5] || 0), second: Number(match[6] || 0),
        millisecond: Number((match[7] || '').padEnd(3, '0') || 0),
    };
    if (!validParts(parts)) return null;

    if (!hasZone) return localTimeToUtc(parts, BLOG_TIME_ZONE);

    const offsetHour = Number(match[10] || 0);
    const offsetMinute = Number(match[11] || 0);
    if (offsetHour > 14 || offsetMinute > 59 || (offsetHour === 14 && offsetMinute !== 0)) return null;
    const offset = (offsetHour * 60 + offsetMinute) * 60_000 * (match[9] === '-' ? -1 : 1);
    const result = new Date(Date.UTC(
        parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, parts.millisecond
    ) - offset);
    const year = result.getUTCFullYear();
    return year >= 0 && year <= 9999 ? result.toISOString() : null;
}
