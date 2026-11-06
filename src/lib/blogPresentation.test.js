import { describe, expect, it } from 'vitest';
import {
    DEFAULT_BLOG_IMAGE,
    DEFAULT_BLOG_TAG,
    getBlogImage,
    getPrimaryBlogTag,
} from './blogPresentation';

describe('blog presentation fallbacks', () => {
    it('uses a stable local image when the database image is missing or blank', () => {
        expect(getBlogImage(null)).toBe(DEFAULT_BLOG_IMAGE);
        expect(getBlogImage({ image_url: '   ' })).toBe(DEFAULT_BLOG_IMAGE);
        expect(getBlogImage({ image_url: '/blog-images/css.jpg' })).toBe('/blog-images/css.jpg');
    });

    it('uses the first non-empty tag or a readable fallback', () => {
        expect(getPrimaryBlogTag({ tags: ['', '  ', 'Next.js'] })).toBe('Next.js');
        expect(getPrimaryBlogTag({ tags: [] })).toBe(DEFAULT_BLOG_TAG);
        expect(getPrimaryBlogTag({})).toBe(DEFAULT_BLOG_TAG);
    });
});
