import { unstable_cache } from 'next/cache';
import { getPublishedBlogs } from '@/lib/queries/blogs';
import { BLOG_CACHE_TAG } from '@/lib/revalidateBlogs';
import { log } from '@/lib/logger';

const FETCH_LIMIT = 8;

// Cached with the blogs tag so publishing a post invalidates it immediately. The home page is statically
// generated with ISR; a failed query throws out of unstable_cache, so the fallback is never cached as data.
const getCachedLatest = unstable_cache(() => getPublishedBlogs(FETCH_LIMIT), ['home-latest-posts'], {
    revalidate: 300,
    tags: [BLOG_CACHE_TAG],
});

// CI builds have no database. Only the build fails soft; at runtime a failed query must throw so ISR
// keeps serving the last good page instead of replacing it with the empty fallback.
const isBuildPhase = () => process.env.NEXT_PHASE === 'phase-production-build';

/**
 * Latest published posts for the home page, newest first. During `next build` a database failure logs a
 * warning and returns [] so the page prerenders its fallback. At runtime the error propagates, and Next.js
 * keeps serving the previously generated page when a revalidation throws.
 *
 * @param {number} [count=4]
 * @returns {Promise<object[]>}
 */
export async function loadLatestPosts(count = 4) {
    try {
        const rows = await getCachedLatest();
        return Array.isArray(rows) ? rows.slice(0, count) : [];
    } catch (error) {
        if (!isBuildPhase()) throw error;
        log('warn', 'home.latest_posts.failed', { error });
        return [];
    }
}
