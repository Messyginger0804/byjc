#!/usr/bin/env node
// Usage:
//   npm run joke:add "Setup text" "Punchline text"
//   npm run joke:add:prod "Setup text" "Punchline text"

const setup = process.argv[2];
const punchline = process.argv[3];

if (!setup || !punchline) {
    console.error('Usage: npm run joke:add "<setup>" "<punchline>"');
    process.exit(1);
}

const baseUrl = process.env.JOKES_API_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const secret = process.env.BLOG_API_SECRET;

if (!secret) {
    console.error('ERROR: BLOG_API_SECRET is not set.');
    process.exit(1);
}

fetch(`${baseUrl}/api/jokes`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-blog-secret': secret,
    },
    body: JSON.stringify({ setup: setup.trim(), punchline: punchline.trim() }),
})
    .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add joke');
        console.log(`✅ Joke added (id: ${data.id})`);
        console.log(`   Setup:     ${data.setup}`);
        console.log(`   Punchline: ${data.punchline}`);
    })
    .catch((err) => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
