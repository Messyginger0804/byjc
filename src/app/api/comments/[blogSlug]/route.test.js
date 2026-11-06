import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
    blog: null,
    wheres: [],
    locks: [],
    commentRows: [],
    storedComments: [],
    conditions: [],
    orderings: [],
    limit: null,
    tail: Promise.resolve(),
    nextId: 1,
    publicationLockModes: [],
    beforePublicationRead: null,
    identityFailure: false,
}));

const freshBlog = () => ({
    id: 7,
    slug: 'published-blog',
    is_published: true,
    published_at: new Date(Date.now() - 60_000),
});

// Evaluates the predicates the handlers actually build against the blog fixture.
function matches(condition, blog) {
    if (!blog) return false;
    if (condition.op === 'and') return condition.conditions.every((c) => matches(c, blog));
    const field = String(condition.left).split('.')[1];
    if (condition.op === 'eq') return blog[field] === condition.right;
    if (condition.op === 'lte') {
        const isNow = condition.right?.op === 'sql' && condition.right.text.trim() === 'NOW()';
        return isNow && blog[field] <= new Date();
    }
    throw new Error(`Unexpected predicate ${condition.op}`);
}

const tables = vi.hoisted(() => ({
    blogs: { id: 'blogs.id', slug: 'blogs.slug', is_published: 'blogs.is_published', published_at: 'blogs.published_at' },
    comments: { id: 'comments.id', blog_id: 'comments.blog_id', name: 'comments.name', body: 'comments.body', created_at: 'comments.created_at' },
}));

vi.mock('../../../../../db/schema.js', () => tables);
vi.mock('@/lib/schemas', async () => import('../../../../lib/schemas.js'));
vi.mock('@/lib/rateLimit', () => {
    class TrustedClientIpError extends Error {}
    return {
        checkRateLimit: vi.fn(async () => ({ ok: true })),
        getClientIp: vi.fn(() => {
            if (state.identityFailure) throw new TrustedClientIpError('missing trusted identity');
            return '203.0.113.10';
        }),
        TrustedClientIpError,
    };
});
vi.mock('drizzle-orm', () => ({
    eq: (left, right) => ({ op: 'eq', left, right }),
    gt: (left, right) => ({ op: 'gt', left, right }),
    lte: (left, right) => {
        const condition = { op: 'lte', left, right };
        state.conditions.push(condition);
        return condition;
    },
    and: (...conditions) => ({ op: 'and', conditions }),
    desc: (column) => ({ op: 'desc', column }),
    sql: (strings, ...values) => ({ op: 'sql', text: strings.join('?'), values }),
}));

function selectBuilder(table) {
    if (table === tables.comments) {
        return {
            innerJoin: () => ({
                where: (predicate) => ({
                    orderBy: (...ordering) => {
                        state.orderings = ordering;
                        state.wheres.push(predicate);
                        return {
                            limit: async (limit) => {
                                state.limit = limit;
                                return matches(predicate, state.blog) ? [...state.commentRows] : [];
                            },
                        };
                    },
                }),
            }),
            where: async () => state.storedComments.length ? [{ id: state.storedComments[0].id }] : [],
        };
    }
    return {
        where: (predicate) => ({
            for: async (mode) => {
                state.publicationLockModes.push(mode);
                state.wheres.push(predicate);
                if (state.beforePublicationRead) await state.beforePublicationRead();
                return matches(predicate, state.blog) ? [{ id: state.blog.id }] : [];
            },
        }),
    };
}

function transactionClient(previous, release) {
    return {
        execute: async (query) => {
            // Serialize only on the advisory-lock statement, keyed by its argument.
            if (query?.text?.includes('pg_advisory_xact_lock')) {
                state.locks.push({ text: query.text, key: query.values[0] });
                await previous;
            }
        },
        select: () => ({ from: (table) => selectBuilder(table) }),
        insert: () => ({
            values: (value) => ({
                returning: async () => {
                    const created = { id: state.nextId++, name: value.name, body: value.body, created_at: new Date() };
                    state.storedComments.push(created);
                    return [created];
                },
            }),
        }),
        release,
    };
}

const db = vi.hoisted(() => ({
    select: vi.fn(() => ({ from: (table) => selectBuilder(table) })),
    transaction: vi.fn(async (callback) => {
        let release;
        const previous = state.tail;
        state.tail = new Promise((resolve) => { release = resolve; });
        const tx = transactionClient(previous, release);
        try {
            return await callback(tx);
        } finally {
            tx.release();
        }
    }),
}));
vi.mock('@/lib/drizzle', () => ({ default: db }));

import { GET, POST } from './route.js';

const context = { params: Promise.resolve({ blogSlug: 'published-blog' }) };
const publicationPredicate = {
    op: 'and',
    conditions: [
        { op: 'eq', left: tables.blogs.slug, right: 'published-blog' },
        { op: 'eq', left: tables.blogs.is_published, right: true },
        { op: 'lte', left: tables.blogs.published_at, right: { op: 'sql', text: 'NOW()', values: [] } },
    ],
};
const postRequest = (body) => new Request('https://example.test/api/comments/published-blog', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
});

beforeEach(() => {
    state.blog = freshBlog();
    state.wheres = [];
    state.locks = [];
    state.commentRows = [];
    state.storedComments = [];
    state.conditions = [];
    state.orderings = [];
    state.limit = null;
    state.tail = Promise.resolve();
    state.nextId = 1;
    state.publicationLockModes = [];
    state.beforePublicationRead = null;
    state.identityFailure = false;
    vi.clearAllMocks();
});

describe('comments route', () => {
    it('rejects wrong JSON types before touching the database', async () => {
        const response = await POST(postRequest({ name: 123, body: true }), context);
        expect(response.status).toBe(400);
        expect(db.select).not.toHaveBeenCalled();
        expect(db.transaction).not.toHaveBeenCalled();
    });

    it('fails safely when deployed client identity cannot be trusted', async () => {
        state.identityFailure = true;
        const response = await POST(postRequest({ name: 'Alice', body: 'Hello' }), context);
        expect(response.status).toBe(503);
        expect(db.transaction).not.toHaveBeenCalled();
    });

    it('requires published_at <= NOW() for reads and returns the latest 100 chronologically', async () => {
        state.commentRows = [{ id: 3 }, { id: 2 }, { id: 1 }];
        const response = await GET(new Request('https://example.test/api/comments/published-blog'), context);

        expect(await response.json()).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
        expect(state.wheres).toEqual([publicationPredicate]);
        expect(state.orderings).toEqual([
            { op: 'desc', column: tables.comments.created_at },
            { op: 'desc', column: tables.comments.id },
        ]);
        expect(state.limit).toBe(100);
    });

    it('requires published_at <= NOW() for writes', async () => {
        const response = await POST(postRequest({ name: 'Alice', body: 'Hello' }), context);
        expect(response.status).toBe(201);
        expect(state.wheres).toEqual([publicationPredicate]);
        expect(state.publicationLockModes).toEqual(['share']);
    });

    it.each([
        ['unpublished', () => ({ is_published: false })],
        ['scheduled for the future', () => ({ published_at: new Date(Date.now() + 3_600_000) })],
        ['missing', () => null],
    ])('excludes a %s blog from reads and writes', async (_label, change) => {
        state.blog = change() && { ...freshBlog(), ...change() };
        state.commentRows = [{ id: 1 }];

        const read = await GET(new Request('https://example.test/api/comments/published-blog'), context);
        expect(await read.json()).toEqual([]);

        const write = await POST(postRequest({ name: 'Alice', body: 'Hello' }), context);
        expect(write.status).toBe(404);
        expect(state.storedComments).toHaveLength(0);
    });

    it('rechecks publication inside the insertion transaction during a concurrent state change', async () => {
        let signalReadStarted;
        let resumeRead;
        const readStarted = new Promise((resolve) => { signalReadStarted = resolve; });
        const readMayContinue = new Promise((resolve) => { resumeRead = resolve; });
        state.beforePublicationRead = async () => {
            signalReadStarted();
            await readMayContinue;
        };

        const pendingResponse = POST(postRequest({ name: 'Alice', body: 'Too early' }), context);
        await readStarted;
        state.blog.is_published = false;
        resumeRead();
        const response = await pendingResponse;

        expect(response.status).toBe(404);
        expect(db.transaction).toHaveBeenCalledOnce();
        expect(state.publicationLockModes).toEqual(['share']);
        expect(state.storedComments).toHaveLength(0);
    });

    it('serializes duplicate checks so concurrent identical comments create only one row', async () => {
        const [first, second] = await Promise.all([
            POST(postRequest({ name: 'Alice', body: 'Same' }), context),
            POST(postRequest({ name: 'Alice', body: 'Same' }), context),
        ]);

        expect([first.status, second.status].sort()).toEqual([201, 409]);
        expect(state.storedComments).toHaveLength(1);

        const key = JSON.stringify([7, 'Alice', 'Same']);
        expect(state.locks).toHaveLength(2);
        for (const lock of state.locks) {
            expect(lock.text).toContain('pg_advisory_xact_lock(hashtextextended(');
            expect(lock.key).toBe(key);
        }
    });
});
