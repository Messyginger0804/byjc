#!/usr/bin/env node
// Usage:
//   npm run blog:feature -- --slug "some-post" --slot featured-main
//   npm run blog:feature -- --slug "some-post" --slot featured-secondary-1
//   npm run blog:feature -- --slug "some-post" --slot featured-secondary-2
//   npm run blog:feature -- --slug "some-post" --clear
//   npm run blog:feature -- --list

const FEATURED_SLOTS = ['featured-main', 'featured-secondary-1', 'featured-secondary-2'];

const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) {
        options.slug = args[i + 1];
        i++;
    } else if (args[i] === '--slot' && args[i + 1]) {
        options.slot = args[i + 1];
        i++;
    } else if (args[i] === '--clear') {
        options.clear = true;
    } else if (args[i] === '--list') {
        options.list = true;
    }
}

if (options.list) {
    listFeatured();
} else if (options.slug && (options.slot || options.clear)) {
    setFeaturedSlot(options.slug, options.clear ? null : options.slot);
} else {
    console.error('Usage:');
    console.error('  npm run blog:feature -- --slug "some-post" --slot featured-main');
    console.error('  npm run blog:feature -- --slug "some-post" --slot featured-secondary-1');
    console.error('  npm run blog:feature -- --slug "some-post" --slot featured-secondary-2');
    console.error('  npm run blog:feature -- --slug "some-post" --clear');
    console.error('  npm run blog:feature -- --list');
    process.exit(1);
}

async function setFeaturedSlot(slug, slot) {
    if (slot !== null && !FEATURED_SLOTS.includes(slot)) {
        console.error(`Invalid slot: ${slot}. Must be one of: ${FEATURED_SLOTS.join(', ')}`);
        process.exit(1);
    }

    const baseUrl = process.env.BLOG_API_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    try {
        const res = await fetch(`${baseUrl}/api/blogs/${slug}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ featured_slot: slot }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error(`❌ Failed: ${data.error}`);
            process.exit(1);
        }

        if (slot) {
            console.log(`✅ Assigned "${slug}" to slot: ${slot}`);
        } else {
            console.log(`✅ Cleared featured slot for: ${slug}`);
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

async function listFeatured() {
    const baseUrl = process.env.BLOG_API_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    try {
        const res = await fetch(`${baseUrl}/api/blogs`);
        const blogs = await res.json();

        console.log('Current featured assignments:\n');

        const featured = blogs
            .filter(b => b.featured_slot)
            .sort((a, b) => FEATURED_SLOTS.indexOf(a.featured_slot) - FEATURED_SLOTS.indexOf(b.featured_slot));

        if (featured.length === 0) {
            console.log('No posts are featured.\n');
        } else {
            for (const blog of featured) {
                console.log(`  ${blog.featured_slot} → ${blog.title} (/blogs/${blog.slug})`);
            }
            console.log('');
        }

        const heroBlog = blogs[0];
        if (heroBlog) {
            console.log(`Hero (latest post): ${heroBlog.title} (/blogs/${heroBlog.slug})`);
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}
