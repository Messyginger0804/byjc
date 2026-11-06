import { sortBlogs } from '@/utils';
import { FEATURED_SLOT_MAIN, FEATURED_SLOT_SECONDARY_1, FEATURED_SLOT_SECONDARY_2 } from '@/lib/constants';

const SLOT_ORDER = [FEATURED_SLOT_MAIN, FEATURED_SLOT_SECONDARY_1, FEATURED_SLOT_SECONDARY_2];

/**
 * Assign blogs to the featured slots. The newest post is the hero (excluded); posts with a
 * matching `featured_slot` take their slot, and empty slots fall back to the newest unused posts.
 */
export function assignFeaturedSlots(blogs) {
    const sortedBlogs = Array.isArray(blogs) ? sortBlogs(blogs) : [];
    const used = new Set(sortedBlogs.length ? [sortedBlogs[0].id] : []);
    const slotMap = Object.fromEntries(SLOT_ORDER.map((slot) => [slot, null]));

    for (const blog of sortedBlogs) {
        if (SLOT_ORDER.includes(blog.featured_slot) && !used.has(blog.id)) {
            slotMap[blog.featured_slot] = blog;
            used.add(blog.id);
        }
    }

    const fallbackPool = sortedBlogs.filter((b) => !used.has(b.id));
    for (const slot of SLOT_ORDER) {
        if (!slotMap[slot] && fallbackPool.length > 0) slotMap[slot] = fallbackPool.shift();
    }
    return slotMap;
}
