import { sql } from 'drizzle-orm';

// A single lock is deliberate: with only three slots, serializing assignments
// also avoids deadlocks when concurrent requests swap two occupied slots.
export const FEATURED_SLOT_LOCK_KEY = 47201984;

export function runFeaturedSlotTransaction(db, mutation) {
    return db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(${FEATURED_SLOT_LOCK_KEY})`);
        return mutation(tx);
    });
}
