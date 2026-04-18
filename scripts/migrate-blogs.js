#!/usr/bin/env node
// Migrates all MDX files from /content into PostgreSQL via the API
// Usage: node scripts/migrate-blogs.js

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function makeSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

function resolveImageUrl(imagePath) {
    if (!imagePath) return null;
    // contentlayer stores image as ../../public/blog-images/...
    return imagePath.replace('../../public', '');
}

async function migrateBlog(mdxPath, folderName) {
    const raw = fs.readFileSync(mdxPath, 'utf-8');
    const { data: fm, content } = matter(raw);

    const slug = makeSlug(fm.title);
    const payload = {
        title: fm.title,
        description: fm.description,
        content,
        author: fm.author || 'JC Ashley',
        tags: fm.tags || [],
        image_url: resolveImageUrl(fm.image),
        slug,
        is_published: fm.isPublished !== false,
    };

    const res = await fetch(`${BASE_URL}/api/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
        console.error(`❌ Failed [${folderName}]: ${data.error}`);
    } else {
        console.log(`✅ Migrated: "${data.title}" → /blogs/${data.slug}`);
    }
}

async function main() {
    const folders = fs.readdirSync(CONTENT_DIR).filter((f) =>
        fs.statSync(path.join(CONTENT_DIR, f)).isDirectory()
    );

    console.log(`Found ${folders.length} blog(s) to migrate...\n`);

    for (const folder of folders) {
        const mdxPath = path.join(CONTENT_DIR, folder, 'index.mdx');
        if (!fs.existsSync(mdxPath)) {
            console.warn(`⚠️  Skipping ${folder} (no index.mdx)`);
            continue;
        }
        await migrateBlog(mdxPath, folder);
    }

    console.log('\nMigration complete.');
}

main().catch((err) => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
