#!/usr/bin/env node
// Usage:
//   npm run jokes:add-bulk
//   npm run jokes:add-bulk:prod

const jokes = [
    {
        setup: 'Why did the chicken cross the playground?',
        punchline: 'To get to the other slide.',
    },
    {
        setup: 'Why did the belt get arrested?',
        punchline: 'It held up a pair of pants.',
    },
    {
        setup: 'Did you hear about the guy who drank invisible ink?',
        punchline: "He's at the hospital waiting to be seen.",
    },
    {
        setup: 'Did you hear about the wig thief who escaped from prison?',
        punchline: 'Police are combing the area to find him.',
    },
    {
        setup: 'I wondered why the baseball was getting closer and closer.',
        punchline: 'Then it hit me.',
    },
    {
        setup: 'Where do surfers go for an education?',
        punchline: 'Boarding school.',
    },
    {
        setup: 'Did you hear about the guy who was addicted to the hokey pokey?',
        punchline: 'He turned himself around.',
    },
    {
        setup: 'Why are libraries so tall?',
        punchline: 'Because they have many stories.',
    },
    {
        setup: 'Why did the Energizer Bunny go to jail?',
        punchline: 'He was charged with battery.',
    },
    {
        setup: 'What do cats eat for breakfast?',
        punchline: 'Mice Krispies.',
    },
    {
        setup: 'What do French hedgehogs see on Groundhog Day?',
        punchline: 'Their chateau.',
    },
    {
        setup: 'What do you get when you cross a fish with an elephant?',
        punchline: 'Swimming trunks.',
    },
    {
        setup: 'How do fish pay for groceries?',
        punchline: 'With sand dollars.',
    },
    {
        setup: "Did you hear about the guy who's afraid of escalators?",
        punchline: 'He takes steps to avoid them.',
    },
    {
        setup: 'How do you find a cheetah in the dark?',
        punchline: 'Use a spotlight.',
    },
    {
        setup: 'Why did the cake cross the road?',
        punchline: 'It saw a fork up ahead.',
    },
    {
        setup: "What do you call a boomerang that won't come back?",
        punchline: 'A stick.',
    },
    {
        setup: 'How do bees get to school?',
        punchline: 'On the school buzz.',
    },
    {
        setup: "What do horses do when it's time for bed?",
        punchline: 'Hit the hay.',
    },
    {
        setup: 'Where do fingers grow?',
        punchline: 'On palm trees.',
    },
    {
        setup: 'What did one eye say to the other?',
        punchline: 'Between us, something smells.',
    },
    {
        setup: 'Why did the pasta go to the dermatologist?',
        punchline: 'It had a big ziti.',
    },
    {
        setup: 'Why are shopping centers boring?',
        punchline: "Because if you've seen one, you've seen the mall.",
    },
    {
        setup: 'Did you hear about the girl who ate a frog?',
        punchline: "They say she's going to croak.",
    },
    {
        setup: 'Bacon and eggs walk into a restaurant.',
        punchline: "The host says, \"Sorry, we don't serve breakfast here.\"",
    },
    {
        setup: 'What did the pirate say on his birthday?',
        punchline: 'Aye, matey!',
    },
    {
        setup: 'Did you hear about the stolen dog collar?',
        punchline: 'Police are looking for leads.',
    },
    {
        setup: 'Have you ever heard of quiet tennis?',
        punchline: "It's the same as regular tennis but without the racket.",
    },
    {
        setup: 'Why should you borrow money from pessimists?',
        punchline: 'They never expect to get it back.',
    },
    {
        setup: 'What did the duck say to the waiter when he brought the check?',
        punchline: 'Put it on my bill.',
    },
    {
        setup: 'Why did the guy get fired from the calendar factory?',
        punchline: 'He took a day off.',
    },
];

const delayMs = Number.parseInt(process.env.JOKES_BULK_DELAY_MS || '3000', 10);
const baseUrl = process.env.JOKES_API_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const secret = process.env.BLOG_API_SECRET;

if (!secret) {
    console.error('ERROR: BLOG_API_SECRET is not set.');
    process.exit(1);
}

if (!Number.isFinite(delayMs) || delayMs < 0) {
    console.error('ERROR: JOKES_BULK_DELAY_MS must be a positive number.');
    process.exit(1);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function addJoke(joke) {
    const res = await fetch(`${baseUrl}/api/jokes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-blog-secret': secret,
        },
        body: JSON.stringify({
            setup: joke.setup.trim(),
            punchline: joke.punchline.trim(),
        }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
}

async function main() {
    let added = 0;
    let failed = 0;

    console.log(`Adding ${jokes.length} joke(s) through ${baseUrl}/api/jokes`);
    console.log(`Waiting ${delayMs}ms between requests.`);

    for (const [index, joke] of jokes.entries()) {
        const position = index + 1;

        try {
            const inserted = await addJoke(joke);
            added += 1;
            console.log(`${position}/${jokes.length} added (id: ${inserted.id}) - ${inserted.setup}`);
        } catch (err) {
            failed += 1;
            console.error(`${position}/${jokes.length} failed - ${joke.setup}`);
            console.error(`   ${err.message}`);
        }

        if (position < jokes.length) {
            await sleep(delayMs);
        }
    }

    console.log(`Done. Added: ${added}. Failed: ${failed}.`);

    if (failed > 0) {
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
