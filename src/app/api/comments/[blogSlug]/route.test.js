import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
    blogRows: [{ id: 7 }],
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
                where: () => ({
                    orderBy: (...ordering) => {
                        state.orderings = ordering;
                        return {
                            limit: async (limit) => {
                                state.limit = limit;
                                return [...state.commentRows];
                            },
                        };
                    },
                }),
            }),
            where: async () => state.storedComments.length ? [{ id: state.storedComments[0].id }] : [],
        };
    }
    return {
        where: () => ({
            for: async (mode) => {
                state.publicationLockModes.push(mode);
                if (state.beforePublicationRead) await state.beforePublicationRead();
                return state.blogRows;
            },
        }),
    };
}

function transactionClient(previous, release) {
    return {
        execute: async () => {
            await previous;
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
const postRequest = (body) => new Request('https://example.test/api/comments/published-blog', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
});

beforeEach(() => {
    state.blogRows = [{ id: 7 }];
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
        expect(state.conditions.some((condition) => condition.left === tables.blogs.published_at)).toBe(true);
        expect(state.orderings).toEqual([
            { op: 'desc', column: tables.comments.created_at },
            { op: 'desc', column: tables.comments.id },
        ]);
        expect(state.limit).toBe(100);
    });

    it('requires published_at <= NOW() for writes', async () => {
        const response = await POST(postRequest({ name: 'Alice', body: 'Hello' }), context);
        expect(response.status).toBe(201);
        expect(state.conditions.some((condition) => condition.left === tables.blogs.published_at)).toBe(true);
        expect(state.publicationLockModes).toEqual(['share']);
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
        state.blogRows = [];
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
    });
});
