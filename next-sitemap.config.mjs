import siteMetadata from './src/utils/metaData.js';

/** @type {import('next-sitemap').IConfig} */
export default {
    siteUrl: siteMetadata.siteUrl,
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
        const paths = [];

        try {
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
        } catch (err) {
            console.error('[next-sitemap] Error fetching blog slugs:', err);
        }

        return paths;
    },
};