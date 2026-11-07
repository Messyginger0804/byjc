import { sql } from 'drizzle-orm';
import { FEATURED_SLOTS, isValidFeaturedSlot } from '@/lib/constants';
import { parseBlogDateToUtc } from '@/lib/dateUtils';

const PATCHABLE_FIELDS = [
    'title', 'description', 'content', 'author', 'tags', 'image_url',
    'slug', 'is_published', 'is_featured', 'featured_slot',
];

/** Returns an error message when featured_slot is set to an unsupported value, else null. */
export function featuredSlotError(featuredSlot) {
    if (featuredSlot === undefined || featuredSlot === null || isValidFeaturedSlot(featuredSlot)) {
        return null;
    }
    return 'Invalid featured_slot. Must be null or one of: ' + FEATURED_SLOTS.join(', ');
}

/** Maps a unique-violation DB error to { status, error }, or null for any other error. */
export function uniqueViolationResponse(err) {
    const dbErr = err?.cause ?? err;
    if (dbErr?.code !== '23505') return null;
    if (dbErr.constraint === 'blogs_featured_slot_unique') {
        return { status: 409, error: 'Featured slot assignment conflicted; retry the request' };
    }
    return { status: 409, error: 'Blog slug already in use' };
}

/** Builds the column updates for a PATCH from validated fields; omitted fields are left alone. */
export function buildBlogUpdates(fields) {
    const updates = { updated_at: sql`NOW()` };
    for (const key of PATCHABLE_FIELDS) {
        if (fields[key] !== undefined) updates[key] = fields[key];
    }
    if (fields.published_at !== undefined) {
        const parsedDate = parseBlogDateToUtc(fields.published_at);
        if (parsedDate) updates.published_at = new Date(parsedDate);
    }
    return updates;
}

/** Returns a Date for the given published_at input, defaulting to now when missing or unparseable. */
export function resolvePublishedAt(publishedAt) {
    const publishTime = parseBlogDateToUtc(publishedAt);
    return publishTime ? new Date(publishTime) : new Date();
}

/** Coerces tags to an array. */
export function normalizeTags(tags) {
    return Array.isArray(tags) ? tags : [];
}
