// parseInt(id, 10) alone accepts junk like "1abc" or "1.9" (both parse to 1),
// silently operating on the wrong row instead of rejecting the request.
// Require the whole param to be a plain positive integer first.
const POSITIVE_INT = /^[1-9]\d*$/;

export function parsePositiveIntId(id) {
    if (typeof id !== 'string' || !POSITIVE_INT.test(id)) {
        return null;
    }
    const value = Number(id);
    return Number.isSafeInteger(value) ? value : null;
}
