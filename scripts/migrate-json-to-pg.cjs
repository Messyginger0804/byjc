#!/usr/bin/env node
// Migrates blogs from blog.json to PostgreSQL

const { Pool } = require('pg');

const blogs = [
    {
        title: "Welcome to Blogs By JC",
        description: "Creating a Blog Site for Web and Software Developers",
        image: "/blog-images/emile-perron-xrVDYZRGdw4-unsplash.jpg",
        publishedAt: "2023-10-24T00:00:00Z",
        updatedAt: "2023-10-24T00:00:00Z",
        author: "JC Ashley",
        isPublished: true,
        tags: ["intro blog", "new beginning", "software development", "web development"],
        content: "# Creating a Blog Site for Web and Software Developers 🚀\n\nIf you're eager to explore the realm of web and software development, you've come to the right place..."
    },
    {
        title: "Why you should use TailwindCSS",
        description: "An introduction to TailwindCSS | What is TailwindCSS? | Why is my TailwindCSS not working?",
        image: "/blog-images/tailwindcss.png",
        publishedAt: "2024-02-06T00:00:00Z",
        updatedAt: "2024-01-16T00:00:00Z",
        author: "JC Ashley",
        isPublished: true,
        tags: ["TailwindCSS", "software development", "web development", "responsive design", "css styling", "front-end development"],
        content: "In the world of web development, creating beautiful, responsive websites can be a daunting task. Meeting the demands of various screen sizes while maintaining clean and maintainable code can be challenging..."
    },
    {
        title: "🚀A Shift In Developers Online Tools",
        description: "ChatGPT's Impact and the Anticipated Arrival of Stack OverflowAI🎉",
        image: "/blog-images/AIimage.png",
        publishedAt: "2023-11-20T00:00:00Z",
        updatedAt: "2023-11-20T00:00:00Z",
        author: "JC Ashley",
        isPublished: true,
        tags: ["AI for Developers", "chatgpt", "learning to code"],
        content: "In the world of software development, Stack Overflow has long been the go-to platform for developers seeking answers to their coding questions. It's been the treasure chest of programming knowledge..."
    }
];

function makeSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

// Never deletes rows: comments reference blogs with ON DELETE CASCADE, so a
// DELETE FROM blogs would wipe every comment. Existing slugs are left alone
// unless --overwrite is passed, in which case they are updated in place (ids,
// and therefore comments, are preserved).
const OVERWRITE_FLAG = '--overwrite';

function shouldOverwrite(args) {
    return args.includes(OVERWRITE_FLAG);
}

async function migrate(client, sourceBlogs = blogs, logger = console, { overwrite = false } = {}) {
    try {
        await client.query('BEGIN');

        // Create table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS blogs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(500) NOT NULL,
                description TEXT,
                content TEXT,
                image_url TEXT,
                author VARCHAR(255) DEFAULT 'JC Ashley',
                tags TEXT[],
                slug VARCHAR(255) UNIQUE,
                is_published BOOLEAN DEFAULT true,
                published_at TIMESTAMP,
                updated_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        logger.log('✅ Table ready');

        const onConflict = overwrite
            ? `ON CONFLICT (slug) DO UPDATE SET
                    title = EXCLUDED.title, description = EXCLUDED.description,
                    content = EXCLUDED.content, image_url = EXCLUDED.image_url,
                    author = EXCLUDED.author, tags = EXCLUDED.tags,
                    is_published = EXCLUDED.is_published,
                    published_at = EXCLUDED.published_at, updated_at = EXCLUDED.updated_at`
            : 'ON CONFLICT (slug) DO NOTHING';

        // Insert each blog
        for (const blog of sourceBlogs) {
            const slug = makeSlug(blog.title);
            await client.query(
                `INSERT INTO blogs (title, description, content, image_url, author, tags, slug, is_published, published_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 ${onConflict}`,
                [
                    blog.title,
                    blog.description,
                    blog.content,
                    blog.image,
                    blog.author,
                    blog.tags,
                    slug,
                    blog.isPublished,
                    blog.publishedAt,
                    blog.updatedAt
                ]
            );
            logger.log(`✅ Inserted: ${blog.title}`);
        }

        await client.query('COMMIT');
        logger.log('\n🎉 Migration complete!');
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            err.rollbackError = rollbackError;
        }
        throw err;
    }
}

async function main(args = process.argv.slice(2)) {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
        throw new Error('Missing DATABASE_URL environment variable.');
    }

    // Shared policy: verified TLS for remote hosts; plain connections only for
    // localhost/db (or DATABASE_SSL_MODE=disable, which is rejected for remote hosts).
    const { getDatabaseConfig } = await import('../src/lib/databaseConfig.js');
    const pool = new Pool(getDatabaseConfig());
    let client;

    try {
        client = await pool.connect();
        await migrate(client, blogs, console, { overwrite: shouldOverwrite(args) });
    } finally {
        client?.release();
        await pool.end();
    }
}

if (require.main === module) {
    main().catch((err) => {
        console.error('Migration failed:', err.message);
        if (err.rollbackError) console.error('Rollback also failed:', err.rollbackError.message);
        process.exitCode = 1;
    });
}

module.exports = { OVERWRITE_FLAG, shouldOverwrite, makeSlug, migrate, main };
