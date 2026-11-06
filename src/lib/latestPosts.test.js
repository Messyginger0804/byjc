import { beforeEach, describe, expect, it, vi } from 'vitest';

const getPublishedBlogs = vi.fn();
const log = vi.fn();

vi.mock('next/cache', () => ({ unstable_cache: (fn) => fn }));
vi.mock('@/lib/queries/blogs', () => ({ getPublishedBlogs: (...a) => getPublishedBlogs(...a) }));
vi.mock('@/lib/logger', () => ({ log: (...a) => log(...a) }));

const { loadLatestPosts } = await import('./latestPosts.js');

describe('loadLatestPosts', () => {
    beforeEach(() => {
        getPublishedBlogs.mockReset();
        log.mockReset();
    });

    it('returns the newest posts, capped at the requested count', async () => {
        getPublishedBlogs.mockResolvedValue([{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }, { slug: 'd' }, { slug: 'e' }]);
        const posts = await loadLatestPosts(4);
        expect(posts.map((p) => p.slug)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('fails soft: resolves to [] and logs when the database query rejects', async () => {
        getPublishedBlogs.mockRejectedValue(new Error('connection refused'));
        await expect(loadLatestPosts()).resolves.toEqual([]);
        expect(log).toHaveBeenCalledWith('warn', 'home.latest_posts.failed', expect.objectContaining({ error: expect.any(Error) }));
    });

    it('fails soft on an unexpected (non-array) result', async () => {
        getPublishedBlogs.mockResolvedValue(undefined);
        await expect(loadLatestPosts()).resolves.toEqual([]);
    });
});
