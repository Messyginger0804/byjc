export const revalidate = 3600;

import db from '@/lib/drizzle';
import { blogs } from '../../../db/schema.js';
import { eq, and, lte, desc, sql } from 'drizzle-orm';
import siteMetadata from '@/utils/metaData';

export async function GET() {
    let items = [];

    try {
        const rows = await db.select({
            title: blogs.title,
            description: blogs.description,
            slug: blogs.slug,
            author: blogs.author,
            published_at: blogs.published_at,
            updated_at: blogs.updated_at,
        }).from(blogs).where(
            and(eq(blogs.is_published, true), lte(blogs.published_at, sql`NOW()`))
        ).orderBy(desc(blogs.published_at)).limit(25);

        items = rows;
    } catch (err) {
        console.error('[RSS] Error fetching blogs:', err);
    }

    const rssItems = items.map(item => {
        const pubDate = new Date(item.published_at).toUTCString();
        const link = `${siteMetadata.siteUrl}/blogs/${item.slug}`;
        return `    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${item.author || siteMetadata.email} (${item.author || siteMetadata.author})</author>
    </item>`;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteMetadata.title} - Blog</title>
    <link>${siteMetadata.siteUrl}</link>
    <description>${siteMetadata.description}</description>
    <language>${siteMetadata.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteMetadata.siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <managingEditor>${siteMetadata.email} (${siteMetadata.author})</managingEditor>
    <webMaster>${siteMetadata.email} (${siteMetadata.author})</webMaster>
${rssItems}
  </channel>
</rss>`;

    return new Response(rss, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
        },
    });
}