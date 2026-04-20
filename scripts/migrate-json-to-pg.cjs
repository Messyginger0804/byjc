#!/usr/bin/env node
// Migrates blogs from blog.json to PostgreSQL

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Missing DATABASE_URL environment variable.');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

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

async function migrate() {
    const client = await pool.connect();
    
    try {
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
        console.log('✅ Table ready');

        // Clear existing blogs (optional)
        await client.query('DELETE FROM blogs');
        
        // Insert each blog
        for (const blog of blogs) {
            const slug = makeSlug(blog.title);
            await client.query(
                `INSERT INTO blogs (title, description, content, image_url, author, tags, slug, is_published, published_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
            console.log(`✅ Inserted: ${blog.title}`);
        }

        console.log('\n🎉 Migration complete!');
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
