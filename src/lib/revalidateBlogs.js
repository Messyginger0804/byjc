import { revalidatePath, revalidateTag } from 'next/cache';
import { log } from './logger.js';

/** Tag shared by the explicitly cached (unstable_cache) blog list and RSS feed queries. */
export const BLOG_CACHE_TAG = 'blogs';

/**
 * Drop cached blog pages and data after a write so publish/schedule changes show
 * immediately: the home page, /blogs, the post itself, the RSS feed, and every
 * category page. Category slugs derive from tags, which may have just changed
 * (old and new), so the whole /categories/[slug] route is invalidated rather
 * than individual slugs. /sitemap.xml is generated at build time by next-sitemap
 * (postbuild), so it is not a runtime-cached path.
 */
export function revalidateBlogPaths(...slugs) {
    try {
        revalidateTag(BLOG_CACHE_TAG, { expire: 0 });
        revalidatePath('/blogs');
        revalidatePath('/');
        revalidatePath('/feed.xml');
        revalidatePath('/categories/[slug]', 'page');
        for (const slug of new Set(slugs.filter(Boolean))) {
            revalidatePath(`/blogs/${slug}`);
        }
    } catch (error) {
        log('warn', 'blogs.revalidate.failed', { error });
    }
}
