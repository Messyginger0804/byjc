import { describe, expect, it } from 'vitest';
import { runFeaturedSlotTransaction } from './blogTransactions.js';

function createSerializedFakeDb() {
    let releasePrevious = Promise.resolve();

    return {
        transaction: async (callback) => {
            let release;
            const previous = releasePrevious;
            releasePrevious = new Promise((resolve) => { release = resolve; });
            let locked = false;
            const tx = {
                execute: async () => {
                    await previous;
                    locked = true;
                },
            };
            try {
                return await callback(tx);
            } finally {
                if (locked) release();
            }
        },
    };
}

describe('runFeaturedSlotTransaction', () => {
    it('serializes concurrent clear-and-assign operations so the last transaction wins', async () => {
        const db = createSerializedFakeDb();
        const slots = new Map([['featured-main', 'original']]);
        const events = [];
        const assign = (blog, delay) => runFeaturedSlotTransaction(db, async () => {
            events.push(`${blog}:clear`);
            slots.delete('featured-main');
            await new Promise((resolve) => setTimeout(resolve, delay));
            expect(slots.has('featured-main')).toBe(false);
            slots.set('featured-main', blog);
            events.push(`${blog}:assign`);
        });

        await Promise.all([assign('first', 15), assign('second', 0)]);

        expect(events).toEqual(['first:clear', 'first:assign', 'second:clear', 'second:assign']);
        expect(slots.get('featured-main')).toBe('second');
    });

    it('does not let a failed transaction block the next assignment', async () => {
        const db = createSerializedFakeDb();
        await expect(runFeaturedSlotTransaction(db, async () => {
            throw new Error('mutation failed');
        })).rejects.toThrow('mutation failed');
        await expect(runFeaturedSlotTransaction(db, async () => 'ok')).resolves.toBe('ok');
    });
});
