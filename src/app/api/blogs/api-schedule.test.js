import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
    countWhere: null,
    rowsWhere: null,
    orderings: [],
    limit: null,
    offset: null,
    rows: [],
    total: 0,
}));

const tables = vi.hoisted(() => ({
    blogs: {
        id: 'blogs.id',
        title: 'blogs.title',
        description: 'blogs.description',
        slug: 'blogs.slug',
        author: 'blogs.author',
        tags: 'blogs.tags',
        image_url: 'blogs.image_url',
        published_at: 'blogs.published_at',
        updated_at: 'blogs.updated_at',
        is_published: 'blogs.is_published',
        is_featured: 'blogs.is_featured',
        featured_slot: 'blogs.featured_slot',
    },
}));

vi.mock('../../../../db/schema.js', () => tables);
vi.mock('drizzle-orm', () => ({
    eq: (left, right) => ({ op: 'eq', left, right }),
    and: (...conditions) => ({ op: 'and', conditions }),
    lte: (left, right) => ({ op: 'lte', left, right }),
    desc: (column) => ({ op: 'desc', column }),
    sql: (strings, ...values) => ({ op: 'sql', text: strings.join('?'), values }),
}));

const db = vi.hoisted(() => ({ select: vi.fn() }));
vi.mock('@/lib/drizzle', () => ({ default: db }));
vi.mock('@/lib/constants', () => ({ FEATURED_SLOTS: [], isValidFeaturedSlot: () => true }));
vi.mock('@/lib/blogApiAuth', () => ({ requireBlogApiAuth: () => null }));
vi.mock('@/lib/schemas', () => ({ blogSchema: {}, validateBody: vi.fn() }));
vi.mock('@/lib/rateLimit', () => ({ checkRateLimit: vi.fn(), getClientIp: vi.fn(), TrustedClientIpError: class extends Error {} }));
vi.mock('@/lib/dateUtils', () => ({ parseBlogDateToUtc: vi.fn() }));
vi.mock('@/lib/revalidateBlogs', () => ({ revalidateBlogPaths: vi.fn() }));
vi.mock('@/lib/blogTransactions', () => ({ runFeaturedSlotTransaction: vi.fn() }));

import { GET } from './route.js';

beforeEach(() => {
    Object.assign(state, {
        countWhere: null,
        rowsWhere: null,
        orderings: [],
        limit: null,
        offset: null,
        rows: [],
        total: 0,
    });

    db.select.mockImplementation((selection) => ({
        from: () => ({
            where: (whereClause) => {
                if ('total' in selection) {
                    state.countWhere = whereClause;
                    return Promise.resolve([{ total: state.total }]);
                }

                state.rowsWhere = whereClause;
                return {
                    orderBy: (...orderings) => {
                        state.orderings = orderings;
                        return {
                            limit: (limit) => {
                                state.limit = limit;
                                return {
                                    offset: async (offset) => {
                                        state.offset = offset;
                                        return state.rows;
                                    },
                                };
                            },
                        };
                    },
                };
            },
        }),
    }));
});

describe('GET /api/blogs scheduling', () => {
    it('uses one database-time visibility predicate for both the count and listed posts', async () => {
        state.total = 1;
        state.rows = [{ id: 1, tags: null }];

        const response = await GET(new Request('https://example.test/api/blogs'));

        expect(response.status).toBe(200);
        expect(state.countWhere).toBe(state.rowsWhere);
        expect(state.rowsWhere).toEqual({
            op: 'and',
            conditions: [
                { op: 'eq', left: tables.blogs.is_published, right: true },
                {
                    op: 'lte',
                    left: tables.blogs.published_at,
                    right: { op: 'sql', text: 'NOW()', values: [] },
                },
            ],
        });
    });

    it('orders scheduled posts newest first and preserves requested pagination', async () => {
        state.total = 5;
        state.rows = [{ id: 3, tags: ['scheduled'] }];

        const response = await GET(new Request('https://example.test/api/blogs?page=2&limit=2'));

        expect(await response.json()).toMatchObject({
            data: [{ id: 3, tags: ['scheduled'] }],
            meta: { page: 2, limit: 2, total: 5, pages: 3 },
        });
        expect(state.orderings).toEqual([{ op: 'desc', column: tables.blogs.published_at }]);
        expect(state.limit).toBe(2);
        expect(state.offset).toBe(2);
    });
});
