import { describe, expect, it } from 'vitest';
import { resolveSitemapSiteUrl } from '../../next-sitemap.config.mjs';

describe('sitemap canonical URL', () => {
    it('requires an explicit canonical URL in production', () => {
        expect(() => resolveSitemapSiteUrl({ NODE_ENV: 'production' })).toThrow(
            'NEXT_PUBLIC_PROD_URL is required'
        );
    });

    it('allows a local URL outside production', () => {
        expect(resolveSitemapSiteUrl({
            NODE_ENV: 'test',
            NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
        })).toBe('http://localhost:3000');
    });

    it('prefers a trimmed NEXT_PUBLIC_PROD_URL in production over NEXT_PUBLIC_SITE_URL', () => {
        expect(resolveSitemapSiteUrl({
            NODE_ENV: 'production',
            NEXT_PUBLIC_PROD_URL: '  https://byjc.dev  ',
            NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
        })).toBe('https://byjc.dev');
    });

    it('prefers NEXT_PUBLIC_PROD_URL outside production', () => {
        expect(resolveSitemapSiteUrl({
            NODE_ENV: 'test',
            NEXT_PUBLIC_PROD_URL: 'https://byjc.dev',
            NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
        })).toBe('https://byjc.dev');
    });

    it('rejects a whitespace-only production URL', () => {
        expect(() => resolveSitemapSiteUrl({
            NODE_ENV: 'production',
            NEXT_PUBLIC_PROD_URL: '   ',
        })).toThrow('NEXT_PUBLIC_PROD_URL is required');
    });
});
