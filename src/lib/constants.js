export const FEATURED_SLOTS = [
    'featured-main',
    'featured-secondary-1',
    'featured-secondary-2',
];

export const FEATURED_SLOT_MAIN = 'featured-main';
export const FEATURED_SLOT_SECONDARY_1 = 'featured-secondary-1';
export const FEATURED_SLOT_SECONDARY_2 = 'featured-secondary-2';

export function isValidFeaturedSlot(slot) {
    return slot === null || FEATURED_SLOTS.includes(slot);
}