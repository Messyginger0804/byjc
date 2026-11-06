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

    it('falls back to the legacy image path and treats a blank image_url as missing', () => {
        expect(getBlogImage({ image: { filePath: '../public/blog-images/legacy.jpg' } })).toBe('/blog-images/legacy.jpg');
        // A whitespace-only image_url is truthy, so it wins over image.filePath and then resolves to the default.
        expect(getBlogImage({ image_url: '   ', image: { filePath: '../public/blog-images/legacy.jpg' } })).toBe(DEFAULT_BLOG_IMAGE);
    });

    it('uses the first non-empty tag or a readable fallback', () => {
        expect(getPrimaryBlogTag({ tags: ['', '  ', 'Next.js'] })).toBe('Next.js');
        expect(getPrimaryBlogTag({ tags: [] })).toBe(DEFAULT_BLOG_TAG);
        expect(getPrimaryBlogTag({})).toBe(DEFAULT_BLOG_TAG);
    });

    it('handles string-valued and non-string tags', () => {
        expect(getPrimaryBlogTag({ tags: ' React ' })).toBe('React');
        expect(getPrimaryBlogTag({ tags: '   ' })).toBe(DEFAULT_BLOG_TAG);
        expect(getPrimaryBlogTag({ tags: [42, null, { name: 'x' }, 'CSS'] })).toBe('CSS');
        expect(getPrimaryBlogTag({ tags: [42, null] })).toBe(DEFAULT_BLOG_TAG);
        expect(getPrimaryBlogTag({ tags: 7 })).toBe(DEFAULT_BLOG_TAG);
    });
});
