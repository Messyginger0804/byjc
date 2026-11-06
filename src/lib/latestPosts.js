import { unstable_cache } from 'next/cache';
import { getPublishedBlogs } from '@/lib/queries/blogs';
import { BLOG_CACHE_TAG } from '@/lib/revalidateBlogs';
import { log } from '@/lib/logger';

const FETCH_LIMIT = 8;

// Cached lazily at request time (the home page is dynamic, like /blogs) and shared with the blogs tag
// so publishing a post invalidates it immediately.
const getCachedLatest = unstable_cache(() => getPublishedBlogs(FETCH_LIMIT), ['home-latest-posts'], {
    revalidate: 60,
    tags: [BLOG_CACHE_TAG],
});

/**
 * Latest published posts for the home page, newest first. Never throws: if the database is
 * unreachable the home page must still render, so failures log a warning and return [].
 *
 * @param {number} [count=4]
 * @returns {Promise<object[]>}
 */
export async function loadLatestPosts(count = 4) {
    try {
        const rows = await getCachedLatest();
        return Array.isArray(rows) ? rows.slice(0, count) : [];
    } catch (error) {
        log('warn', 'home.latest_posts.failed', { error });
        return [];
    }
}
