import siteMetadata from './src/utils/metaData.js';

export function resolveSitemapSiteUrl(env = process.env) {
    const canonicalUrl = env.NEXT_PUBLIC_PROD_URL?.trim();
    if (env.NODE_ENV === 'production' && !canonicalUrl) {
        throw new Error('NEXT_PUBLIC_PROD_URL is required to generate the production sitemap.');
    }

    return canonicalUrl || env.NEXT_PUBLIC_SITE_URL?.trim() || siteMetadata.siteUrl;
}

/** @type {import('next-sitemap').IConfig} */
export default {
    siteUrl: resolveSitemapSiteUrl(),
    generateRobotsTxt: true,
    exclude: ['/admin/*', '/api/*'],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
        ],
        additionalSitemaps: [],
    },
    additionalPaths: async (config) => {
        // Image/CI builds intentionally have no database credentials. Runtime
        // routes remain canonical; skip database-derived URLs in that case.
        if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
            if (process.env.NODE_ENV === 'production') {
                console.warn('[next-sitemap] No database credentials; skipping database-derived blog URLs in the sitemap.');
            }
            return [];
        }

        const paths = [];

        const { default: db } = await import('./src/lib/drizzle.js');
        const { blogs } = await import('./db/schema.js');
        const { eq, and, lte, sql, desc } = await import('drizzle-orm');

        const rows = await db.select({
            slug: blogs.slug,
            updated_at: blogs.updated_at,
            published_at: blogs.published_at,
        }).from(blogs).where(
            and(eq(blogs.is_published, true), lte(blogs.published_at, sql`NOW()`))
        ).orderBy(desc(blogs.published_at));

        for (const row of rows) {
            paths.push({
                loc: `/blogs/${row.slug}`,
                lastmod: row.updated_at ? new Date(row.updated_at).toISOString() : new Date(row.published_at).toISOString(),
                changefreq: 'weekly',
                priority: 0.7,
            });
        }

        return paths;
    },
};
