import { revalidatePath } from 'next/cache';
import { log } from './logger.js';

/** Drop cached (ISR) blog pages after a write so publish/schedule changes show immediately. */
export function revalidateBlogPaths(...slugs) {
    try {
        revalidatePath('/blogs');
        revalidatePath('/');
        for (const slug of new Set(slugs.filter(Boolean))) {
            revalidatePath(`/blogs/${slug}`);
        }
    } catch (error) {
        log('warn', 'blogs.revalidate.failed', { error });
    }
}
