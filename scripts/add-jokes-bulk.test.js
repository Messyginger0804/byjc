import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
    parseArgs, parseJokesJson, validateJoke, normalizeJoke, classifyJokes,
    fetchExistingJokes, postJoke, safeOrigin, run, sleep, MAX_SETUP, MAX_PUNCHLINE,
} from './add-jokes-bulk.js';

const res = (status, body, headers = {}) => ({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k) => headers[k.toLowerCase()] ?? null },
    json: async () => {
        if (body === undefined) throw new Error('no body');
        return body;
    },
});

describe('parseArgs', () => {
    it('reads flags', () => {
        expect(parseArgs(['--file', 'a.json', '--dry-run', '--delay-ms', '10'])).toEqual({ file: 'a.json', dryRun: true, delayMs: 10 });
    });
    it('falls back to env', () => {
        expect(parseArgs([], { JOKES_FILE: 'e.json', JOKES_BULK_DELAY_MS: '7' })).toEqual({ file: 'e.json', dryRun: false, delayMs: 7 });
    });
    it('defaults delay to 3000', () => {
        expect(parseArgs(['--file', 'a.json']).delayMs).toBe(3000);
    });
    it('requires a file', () => {
        expect(() => parseArgs([])).toThrow(/No input file/);
        expect(() => parseArgs(['--file'])).toThrow(/No input file/);
    });
    it('rejects bad delay and unknown args', () => {
        expect(() => parseArgs(['--file', 'a', '--delay-ms', 'x'])).toThrow(/delay-ms/);
        expect(() => parseArgs(['--file', 'a', '--delay-ms', '-1'])).toThrow(/delay-ms/);
        expect(() => parseArgs(['--file', 'a', '--nope'])).toThrow(/Unknown argument/);
    });
});

describe('parseJokesJson', () => {
    it('parses an array', () => expect(parseJokesJson('[{"a":1}]')).toEqual([{ a: 1 }]));
    it('rejects bad JSON and non-arrays', () => {
        expect(() => parseJokesJson('{')).toThrow(/not valid JSON/);
        expect(() => parseJokesJson('{}')).toThrow(/JSON array/);
    });
});

describe('validateJoke', () => {
    it('trims valid jokes', () => {
        expect(validateJoke({ setup: ' a ', punchline: ' b ' })).toEqual({ joke: { setup: 'a', punchline: 'b' } });
    });
    it('rejects non-objects', () => {
        for (const v of [null, 'x', 3, []]) expect(validateJoke(v).error).toMatch(/not an object/);
    });
    it('rejects empty or non-string fields', () => {
        expect(validateJoke({ setup: '  ', punchline: 'b' }).error).toMatch(/setup/);
        expect(validateJoke({ setup: 1, punchline: 'b' }).error).toMatch(/setup/);
        expect(validateJoke({ setup: 'a', punchline: '' }).error).toMatch(/punchline/);
        expect(validateJoke({ setup: 'a' }).error).toMatch(/punchline/);
    });
    it('enforces API length limits', () => {
        expect(validateJoke({ setup: 'a'.repeat(MAX_SETUP), punchline: 'b'.repeat(MAX_PUNCHLINE) }).joke).toBeDefined();
        expect(validateJoke({ setup: 'a'.repeat(MAX_SETUP + 1), punchline: 'b' }).error).toMatch(/500/);
        expect(validateJoke({ setup: 'a', punchline: 'b'.repeat(MAX_PUNCHLINE + 1) }).error).toMatch(/1000/);
    });
});

describe('normalizeJoke / classifyJokes', () => {
    it('ignores case, punctuation and whitespace', () => {
        expect(normalizeJoke({ setup: 'Why, hello?', punchline: "It's me!" }))
            .toBe(normalizeJoke({ setup: 'why hello', punchline: '  ITS  me ' }));
    });
    it('skips existing, in-file duplicates and invalid entries', () => {
        const existing = new Set([normalizeJoke({ setup: 'Old?', punchline: 'Joke.' })]);
        const out = classifyJokes([
            { setup: 'old', punchline: 'JOKE' },
            { setup: 'New?', punchline: 'One.' },
            { setup: 'new', punchline: 'one' },
            { setup: '', punchline: 'x' },
        ], existing);
        expect(out.toInsert).toEqual([{ setup: 'New?', punchline: 'One.' }]);
        expect(out.duplicates).toHaveLength(2);
        expect(out.invalid).toEqual([{ index: 3, reason: expect.any(String) }]);
    });
});

describe('fetchExistingJokes', () => {
    it('follows pagination', async () => {
        const f = vi.fn()
            .mockResolvedValueOnce(res(200, { data: [{ id: 1 }], meta: { pages: 2 } }))
            .mockResolvedValueOnce(res(200, { data: [{ id: 2 }], meta: { pages: 2 } }));
        expect(await fetchExistingJokes('http://x', 's', f)).toEqual([{ id: 1 }, { id: 2 }]);
        expect(f.mock.calls[1][0]).toContain('page=2');
        expect(f.mock.calls[0][1].headers['x-blog-secret']).toBe('s');
    });
    it('tolerates missing data/meta', async () => {
        expect(await fetchExistingJokes('http://x', 's', async () => res(200, {}))).toEqual([]);
    });
    it('throws on failure', async () => {
        await expect(fetchExistingJokes('http://x', 's', async () => res(401, {}))).rejects.toThrow(/401/);
    });
});

describe('postJoke', () => {
    const joke = { setup: 'a', punchline: 'b' };
    it('returns the inserted row', async () => {
        const f = vi.fn().mockResolvedValue(res(201, { id: 9 }));
        expect(await postJoke('http://x', 's', joke, { fetchImpl: f })).toEqual({ id: 9 });
        expect(JSON.parse(f.mock.calls[0][1].body)).toEqual(joke);
    });
    it('retries 429 with retry-after, then succeeds', async () => {
        const sl = vi.fn().mockResolvedValue();
        const f = vi.fn()
            .mockResolvedValueOnce(res(429, {}, { 'retry-after': '2' }))
            .mockResolvedValueOnce(res(429, {}))
            .mockResolvedValueOnce(res(201, { id: 1 }));
        await postJoke('http://x', 's', joke, { fetchImpl: f, sleepImpl: sl, baseBackoffMs: 100 });
        expect(sl.mock.calls.map((c) => c[0])).toEqual([2000, 200]);
    });
    it('gives up after 3 retries', async () => {
        const sl = vi.fn().mockResolvedValue();
        const f = vi.fn().mockResolvedValue(res(429, { error: 'slow down' }));
        await expect(postJoke('http://x', 's', joke, { fetchImpl: f, sleepImpl: sl })).rejects.toThrow('slow down');
        expect(f).toHaveBeenCalledTimes(4);
        expect(sl).toHaveBeenCalledTimes(3);
    });
    it('uses a status message when the body is unreadable', async () => {
        const f = async () => res(500, undefined);
        await expect(postJoke('http://x', 's', joke, { fetchImpl: f })).rejects.toThrow(/status 500/);
    });
});

describe('safeOrigin / sleep', () => {
    it('drops credentials and path', () => {
        expect(safeOrigin('https://user:pw@example.com:8080/a?token=1')).toBe('https://example.com:8080');
        expect(safeOrigin('nonsense')).toBe('(invalid URL)');
    });
    it('sleep resolves', async () => {
        vi.useFakeTimers();
        const p = sleep(5);
        await vi.advanceTimersByTimeAsync(5);
        await p;
        vi.useRealTimers();
    });
});

describe('run', () => {
    let dir;
    let file;
    const out = [];
    const errs = [];
    const io = { log: (m) => out.push(m), error: (m) => errs.push(m) };
    const env = { BLOG_API_SECRET: 'topsecret', JOKES_API_BASE_URL: 'https://u:pw@example.com/' };

    beforeEach(() => {
        out.length = 0;
        errs.length = 0;
        dir = mkdtempSync(path.join(tmpdir(), 'jokes-'));
        file = path.join(dir, 'j.json');
        writeFileSync(file, JSON.stringify([
            ...Array.from({ length: 7 }, (_, i) => ({ setup: `Setup ${i}`, punchline: `Punch ${i}` })),
            { setup: 'Existing!', punchline: 'one' },
            { setup: '', punchline: 'bad' },
        ]));
    });
    afterEach(() => rmSync(dir, { recursive: true, force: true }));

    const listing = () => res(200, { data: [{ setup: 'existing', punchline: 'ONE' }], meta: { pages: 1 } });

    it('dry run reports counts, shows 5, and never POSTs', async () => {
        const f = vi.fn().mockResolvedValue(listing());
        const r = await run({ argv: ['--file', file, '--dry-run'], env, fetchImpl: f, ...io });
        expect(f).toHaveBeenCalledTimes(1);
        expect(f.mock.calls[0][1].method).toBeUndefined();
        expect(r).toMatchObject({ toInsert: 7, duplicates: 1, invalid: 1, inserted: 0 });
        expect(out.join('\n')).toContain('To insert: 7. Skipped duplicate: 1. Invalid: 1.');
        expect(out.filter((l) => /^ {2}\d\. /.test(l))).toHaveLength(5);
        expect(errs[0]).toMatch(/entry #9/);
    });

    it('inserts, paces, counts failures, and never prints the secret or credentials', async () => {
        const sl = vi.fn().mockResolvedValue();
        let n = 0;
        const f = vi.fn(async (url, opts) => {
            if (!opts?.method) return listing();
            n += 1;
            return n === 2 ? res(500, { error: 'boom' }) : res(201, { id: n });
        });
        const r = await run({ argv: ['--file', file, '--delay-ms', '1'], env, fetchImpl: f, sleepImpl: sl, ...io });
        expect(r).toMatchObject({ inserted: 6, failed: 1 });
        expect(sl).toHaveBeenCalledTimes(6);
        const all = [...out, ...errs].join('\n');
        expect(all).not.toContain('topsecret');
        expect(all).not.toContain('pw@');
        expect(all).toContain('https://example.com');
        expect(f.mock.calls[1][0]).toBe('https://u:pw@example.com/api/jokes');
    });

    it('a re-run inserts nothing', async () => {
        const rows = Array.from({ length: 7 }, (_, i) => ({ setup: `setup ${i}`, punchline: `punch ${i}` }));
        rows.push({ setup: 'existing', punchline: 'one' });
        const f = vi.fn().mockResolvedValue(res(200, { data: rows, meta: { pages: 1 } }));
        const r = await run({ argv: ['--file', file], env, fetchImpl: f, ...io });
        expect(r).toMatchObject({ inserted: 0, toInsert: 0, duplicates: 8 });
        expect(f).toHaveBeenCalledTimes(1);
    });

    it('requires the secret and defaults the base URL', async () => {
        await expect(run({ argv: ['--file', file], env: {}, ...io })).rejects.toThrow(/BLOG_API_SECRET/);
        const f = vi.fn().mockResolvedValue(res(200, { data: [], meta: { pages: 1 } }));
        await run({ argv: ['--file', file, '--dry-run'], env: { BLOG_API_SECRET: 's' }, fetchImpl: f, ...io });
        expect(f.mock.calls[0][0]).toMatch(/^http:\/\/localhost:3000\/api\/jokes/);
        f.mockClear();
        await run({ argv: ['--file', file, '--dry-run'], env: { BLOG_API_SECRET: 's', NEXT_PUBLIC_SITE_URL: 'http://site' }, fetchImpl: f, ...io });
        expect(f.mock.calls[0][0]).toMatch(/^http:\/\/site\/api/);
    });
});
