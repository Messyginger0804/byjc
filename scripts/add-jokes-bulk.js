#!/usr/bin/env node
// Bulk-load jokes from a JSON file, skipping invalid entries and anything the
// target already has.
//
//   npm run jokes:add-bulk -- --file jokes.json --dry-run
//   npm run jokes:add-bulk -- --file jokes.json
//   npm run jokes:add-bulk:prod -- --file jokes.json --dry-run
//
// The file is a JSON array of { "setup": "...", "punchline": "..." }.
// Flags: --file <path> (or JOKES_FILE), --dry-run, --delay-ms <n> (or JOKES_BULK_DELAY_MS, default 3000).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const MAX_SETUP = 500;
export const MAX_PUNCHLINE = 1000;
export const DEFAULT_DELAY_MS = 3000;
export const MAX_RETRIES = 3;
const PAGE_LIMIT = 200;

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseArgs(argv, env = {}) {
    const opts = {
        file: env.JOKES_FILE || null,
        dryRun: false,
        delayMs: Number.parseInt(env.JOKES_BULK_DELAY_MS || String(DEFAULT_DELAY_MS), 10),
    };
    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === '--dry-run') opts.dryRun = true;
        else if (arg === '--file') opts.file = argv[++i] ?? null;
        else if (arg === '--delay-ms') opts.delayMs = Number.parseInt(argv[++i], 10);
        else throw new Error(`Unknown argument: ${arg}`);
    }
    if (!opts.file) throw new Error('No input file. Pass --file <path> or set JOKES_FILE.');
    if (!Number.isFinite(opts.delayMs) || opts.delayMs < 0) {
        throw new Error('--delay-ms must be a non-negative number.');
    }
    return opts;
}

export function parseJokesJson(text) {
    let data;
    try {
        data = JSON.parse(text);
    } catch (err) {
        throw new Error(`Input file is not valid JSON: ${err.message}`);
    }
    if (!Array.isArray(data)) throw new Error('Input file must be a JSON array of { setup, punchline }.');
    return data;
}

/** Returns { joke } (trimmed) or { error }. */
export function validateJoke(entry) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return { error: 'not an object' };
    const { setup, punchline } = entry;
    if (typeof setup !== 'string' || !setup.trim()) return { error: 'setup must be a non-empty string' };
    if (typeof punchline !== 'string' || !punchline.trim()) return { error: 'punchline must be a non-empty string' };
    if (setup.trim().length > MAX_SETUP) return { error: `setup is longer than ${MAX_SETUP} characters` };
    if (punchline.trim().length > MAX_PUNCHLINE) return { error: `punchline is longer than ${MAX_PUNCHLINE} characters` };
    return { joke: { setup: setup.trim(), punchline: punchline.trim() } };
}

/** Lowercase and drop everything but letters and digits, so punctuation/spacing differences collapse. */
export function normalizeJoke({ setup, punchline }) {
    return `${setup}${punchline}`.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

/** Split entries into toInsert / duplicates / invalid. `existingKeys` is a Set of normalized keys. */
export function classifyJokes(entries, existingKeys) {
    const seen = new Set(existingKeys);
    const toInsert = [];
    const duplicates = [];
    const invalid = [];
    entries.forEach((entry, index) => {
        const result = validateJoke(entry);
        if (result.error) {
            invalid.push({ index, reason: result.error });
            return;
        }
        const key = normalizeJoke(result.joke);
        if (seen.has(key)) {
            duplicates.push(result.joke);
            return;
        }
        seen.add(key);
        toInsert.push(result.joke);
    });
    return { toInsert, duplicates, invalid };
}

/** Fetch every existing joke from the target, following pagination. */
export async function fetchExistingJokes(baseUrl, secret, fetchImpl = fetch) {
    const all = [];
    let page = 1;
    let pages = 1;
    do {
        const res = await fetchImpl(`${baseUrl}/api/jokes?page=${page}&limit=${PAGE_LIMIT}`, {
            headers: { 'x-blog-secret': secret },
        });
        if (!res.ok) throw new Error(`Could not list existing jokes (status ${res.status}).`);
        const body = await res.json();
        all.push(...(body.data ?? []));
        pages = body.meta?.pages ?? 1;
        page += 1;
    } while (page <= pages);
    return all;
}

/** POST one joke; on 429 back off and retry up to MAX_RETRIES times. */
export async function postJoke(baseUrl, secret, joke, { fetchImpl = fetch, sleepImpl = sleep, baseBackoffMs = 5000 } = {}) {
    for (let attempt = 0; ; attempt += 1) {
        const res = await fetchImpl(`${baseUrl}/api/jokes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-blog-secret': secret },
            body: JSON.stringify(joke),
        });
        if (res.status === 429 && attempt < MAX_RETRIES) {
            const retryAfter = Number.parseInt(res.headers?.get?.('retry-after') ?? '', 10);
            const wait = Number.isFinite(retryAfter) ? retryAfter * 1000 : baseBackoffMs * 2 ** attempt;
            await sleepImpl(wait);
            continue;
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Request failed with status ${res.status}`);
        return data;
    }
}

/** Scheme + host only: never echo credentials, path, or query from the configured URL. */
export function safeOrigin(baseUrl) {
    try {
        const { protocol, host } = new URL(baseUrl);
        return `${protocol}//${host}`;
    } catch {
        return '(invalid URL)';
    }
}

export async function run({ argv, env, log = console.log, error = console.error, fetchImpl = fetch, sleepImpl = sleep }) {
    const opts = parseArgs(argv, env);
    const secret = env.BLOG_API_SECRET;
    if (!secret) throw new Error('BLOG_API_SECRET is not set.');
    const baseUrl = (env.JOKES_API_BASE_URL || env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

    const entries = parseJokesJson(readFileSync(opts.file, 'utf8'));
    const existing = await fetchExistingJokes(baseUrl, secret, fetchImpl);
    const existingKeys = new Set(existing.map((j) => normalizeJoke(j)));
    const { toInsert, duplicates, invalid } = classifyJokes(entries, existingKeys);

    log(`Target: ${safeOrigin(baseUrl)} (${existing.length} existing joke(s))`);
    invalid.forEach(({ index, reason }) => error(`Skipping invalid entry #${index + 1}: ${reason}`));
    log(`To insert: ${toInsert.length}. Skipped duplicate: ${duplicates.length}. Invalid: ${invalid.length}.`);

    if (opts.dryRun) {
        toInsert.slice(0, 5).forEach((j, i) => log(`  ${i + 1}. ${j.setup} / ${j.punchline}`));
        log('Dry run: nothing was sent.');
        return { inserted: 0, failed: 0, duplicates: duplicates.length, invalid: invalid.length, toInsert: toInsert.length };
    }

    log(`Waiting ${opts.delayMs}ms between requests.`);
    let inserted = 0;
    let failed = 0;
    for (const [index, joke] of toInsert.entries()) {
        const position = index + 1;
        try {
            const row = await postJoke(baseUrl, secret, joke, { fetchImpl, sleepImpl });
            inserted += 1;
            log(`${position}/${toInsert.length} added (id: ${row.id}) - ${joke.setup}`);
        } catch (err) {
            failed += 1;
            error(`${position}/${toInsert.length} failed - ${joke.setup}`);
            error(`   ${err.message}`);
        }
        if (position < toInsert.length) await sleepImpl(opts.delayMs);
    }

    log(`Done. Inserted: ${inserted}. Failed: ${failed}. Skipped duplicate: ${duplicates.length}. Invalid: ${invalid.length}.`);
    return { inserted, failed, duplicates: duplicates.length, invalid: invalid.length, toInsert: toInsert.length };
}

/* v8 ignore start */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    run({ argv: process.argv.slice(2), env: process.env })
        .then((r) => {
            if (r.failed > 0) process.exit(1);
        })
        .catch((err) => {
            console.error(`ERROR: ${err.message}`);
            process.exit(1);
        });
}
/* v8 ignore stop */
