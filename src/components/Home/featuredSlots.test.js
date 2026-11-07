import { describe, it, expect } from 'vitest';
import { assignFeaturedSlots } from './featuredSlots';
import { FEATURED_SLOT_SECONDARY_2 } from '@/lib/constants';

const post = (id, day, extra = {}) => ({ id, publishedAt: `2025-01-${String(day).padStart(2, '0')}`, ...extra });

describe('assignFeaturedSlots', () => {
    it('returns empty slots for non-array input', () => {
        const map = assignFeaturedSlots(null);
        expect(Object.values(map)).toEqual([null, null, null]);
    });

    it('skips the hero and honors explicit slots', () => {
        const blogs = [post(1, 10), post(2, 5, { featured_slot: FEATURED_SLOT_SECONDARY_2 }), post(3, 4), post(4, 3)];
        const map = assignFeaturedSlots(blogs);
        expect(map[FEATURED_SLOT_SECONDARY_2].id).toBe(2);
        const ids = Object.values(map).map((b) => b && b.id);
        expect(ids).not.toContain(1);
        expect(new Set(ids).size).toBe(3);
    });
});
