import { describe, it, expect } from 'vitest';
import {
    MAX_STAGED_TOP10,
    validateJoke,
    getSavedTop10Ids,
    filterJokes,
    addToDraft,
    moveInDraft,
    top10SavedMessage,
} from './jokeHelpers';

describe('validateJoke', () => {
    it('flags missing setup first, then punchline', () => {
        expect(validateJoke({ setup: ' ', punchline: '' })).toBe('Setup is required');
        expect(validateJoke({ setup: 'a', punchline: ' ' })).toBe('Punchline is required');
        expect(validateJoke({ setup: 'a', punchline: 'b' })).toBe('');
    });
});

describe('getSavedTop10Ids', () => {
    it('returns ids of ranked jokes ordered by rank', () => {
        const rows = [
            { id: 1, top10_rank: 2 },
            { id: 2, top10_rank: null },
            { id: 3, top10_rank: 1 },
        ];
        expect(getSavedTop10Ids(rows)).toEqual([3, 1]);
    });
});

describe('filterJokes', () => {
    const jokes = [
        { id: 1, setup: 'Why Cat', punchline: 'meow' },
        { id: 2, setup: 'Dog', punchline: 'WOOF' },
    ];
    it('returns all when no term', () => expect(filterJokes(jokes, '')).toBe(jokes));
    it('matches case-insensitively on either field', () => {
        expect(filterJokes(jokes, 'woof').map((j) => j.id)).toEqual([2]);
        expect(filterJokes(jokes, 'CAT').map((j) => j.id)).toEqual([1]);
    });
});

describe('addToDraft', () => {
    it('ignores duplicates and respects the cap', () => {
        expect(addToDraft([1], 1)).toEqual([1]);
        expect(addToDraft([1], 2)).toEqual([1, 2]);
        const full = Array.from({ length: MAX_STAGED_TOP10 }, (_, i) => i);
        expect(addToDraft(full, 99)).toBe(full);
    });
});

describe('moveInDraft', () => {
    it('swaps neighbours and ignores out-of-range moves', () => {
        expect(moveInDraft([1, 2, 3], 2, 'up')).toEqual([2, 1, 3]);
        expect(moveInDraft([1, 2, 3], 2, 'down')).toEqual([1, 3, 2]);
        const list = [1, 2];
        expect(moveInDraft(list, 1, 'up')).toBe(list);
        expect(moveInDraft(list, 2, 'down')).toBe(list);
        expect(moveInDraft(list, 9, 'up')).toBe(list);
    });
});

describe('top10SavedMessage', () => {
    it('mentions dropped items only when there are some', () => {
        expect(top10SavedMessage(2)).toBe('Saved top 10. Dropped 2 staged item(s).');
        expect(top10SavedMessage(0)).toBe('Saved top 10 order.');
    });
});
