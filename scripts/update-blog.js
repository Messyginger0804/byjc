#!/usr/bin/env node
// Usage: npm run blog:update ./content/18-ReactHooks/index.mdx

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const filePath = process.argv[2] || process.env.BLOG_POST_PATH;
if (!filePath) {
    console.error('Usage: npm run blog:update <path-to-md-file>');
    process.exit(1);
}

const fullPath = path.resolve(filePath);
if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
}

const fileContent = fs.readFileSync(fullPath, 'utf-8');
const { data: frontmatter, content } = matter(fileContent);

const { title, description, tags, image_url, author, is_published, publishedAt } = frontmatter;

if (!title || !description) {
    console.error('Missing required frontmatter: title, description');
    process.exit(1);
}

// The existing slug selects the post; derive nothing from the title.
// Set `newSlug` in the frontmatter only when the post should be renamed.
const { slug, newSlug } = frontmatter;
if (!slug) {
    console.error('Missing required frontmatter: slug (the existing post slug)');
    process.exit(1);
}

// Omitted frontmatter fields are left out so the PATCH preserves stored values.
const payload = {
    title,
    description,
    content,
    ...(author !== undefined ? { author } : {}),
    ...(tags !== undefined ? { tags } : {}),
    ...(image_url !== undefined ? { image_url } : {}),
    ...(newSlug ? { slug: newSlug } : {}),
    ...(is_published !== undefined ? { is_published } : {}),
    ...(publishedAt !== undefined ? { published_at: publishedAt } : {}),
};

const baseUrl = process.env.BLOG_API_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const blogApiSecret = process.env.BLOG_API_SECRET;

fetch(`${baseUrl}/api/blogs/${slug}`, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        ...(blogApiSecret ? { 'x-blog-secret': blogApiSecret } : {}),
    },
    body: JSON.stringify(payload),
})
    .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Failed to update blog (HTTP ${res.status})`);
        console.log(`✅ Blog updated: "${data.title}" (slug: ${data.slug})`);
    })
    .catch((err) => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
