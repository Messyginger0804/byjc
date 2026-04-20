#!/usr/bin/env node
// Usage: npm run blog:create ./path/to/post.md

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const filePath = process.argv[2] || process.env.BLOG_POST_PATH;
if (!filePath) {
    console.error('Usage: npm run blog:create <path-to-md-file>');
    process.exit(1);
}

const fullPath = path.resolve(filePath);
if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
}

const fileContent = fs.readFileSync(fullPath, 'utf-8');
const { data: frontmatter, content } = matter(fileContent);

const { title, description, tags, image_url, author, is_published, featuredSlot, publishedAt } = frontmatter;

if (!title || !description) {
    console.error('Missing required frontmatter: title, description');
    process.exit(1);
}

const FEATURED_SLOTS = ['featured-main', 'featured-secondary-1', 'featured-secondary-2'];
if (featuredSlot !== undefined && featuredSlot !== null && !FEATURED_SLOTS.includes(featuredSlot)) {
    console.error('Invalid featuredSlot. Must be null or one of: ' + FEATURED_SLOTS.join(', '));
    process.exit(1);
}

// Auto-generate slug from title
const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const payload = {
    title,
    description,
    content,
    author: author || 'JC Ashley',
    tags: tags || [],
    image_url: image_url || null,
    slug,
    is_published: is_published !== false,
    featured_slot: featuredSlot || null,
    published_at: publishedAt || null,
};

const baseUrl = process.env.BLOG_API_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const blogApiSecret = process.env.BLOG_API_SECRET;

fetch(`${baseUrl}/api/blogs`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        ...(blogApiSecret ? { 'x-blog-secret': blogApiSecret } : {}),
    },
    body: JSON.stringify(payload),
})
    .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create blog');
        console.log(`✅ Blog created: "${data.title}" (slug: ${data.slug})`);
    })
    .catch((err) => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
