import {
    pgTable,
    serial,
    varchar,
    text,
    boolean,
    timestamp,
    integer,
    index,
    uniqueIndex,
    check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const blogs = pgTable('blogs', {
    id:           serial('id').primaryKey(),
    title:        varchar('title').notNull(),
    description:  text('description').notNull(),
    content:      text('content').notNull(),
    slug:         varchar('slug').unique().notNull(),
    author:       varchar('author').default('JC Ashley'),
    tags:         text('tags').array().default([]),
    image_url:    text('image_url'),
    is_published: boolean('is_published').default(true),
    is_featured:  boolean('is_featured').default(false),
    published_at: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
    featured_slot: varchar('featured_slot', { length: 50 }),
    updated_at:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    index('blogs_published_at_idx').on(table.published_at),
    index('blogs_featured_slot_idx').on(table.featured_slot),
    // Composite: blog listing — published posts sorted by date
    index('blogs_published_idx')
        .on(table.published_at, table.id)
        .where(sql`${table.is_published} = true`),
    // Composite: featured blog lookup
    index('blogs_featured_lookup_idx')
        .on(table.featured_slot, table.published_at)
        .where(sql`${table.is_published} = true`),
    // CHECK: featured_slot must be a valid slot value or null
    check('featured_slot_check',
        sql`${table.featured_slot} IS NULL OR ${table.featured_slot} IN ('january','february','march','april','may','june','july','august','september','october','november','december')`),
]);

export const comments = pgTable('comments', {
    id:         serial('id').primaryKey(),
    blog_id:    integer('blog_id').references(() => blogs.id, { onDelete: 'cascade' }).notNull(),
    name:       text('name').notNull(),
    body:       text('body').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('comments_blog_id_idx').on(table.blog_id),
    // Composite: comment listing per blog, ordered by date
    index('comments_blog_created_idx').on(table.blog_id, table.created_at),
]);

export const jokes = pgTable('jokes', {
    id:         serial('id').primaryKey(),
    setup:      text('setup').notNull(),
    punchline:  text('punchline').notNull(),
    jc_starred: boolean('jc_starred').default(false),
    top10_rank: integer('top10_rank'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    // Partial unique index: only one joke per rank, only when rank is set
    uniqueIndex('jokes_top10_rank_unique')
        .on(table.top10_rank)
        .where(sql`${table.top10_rank} IS NOT NULL`),
    // CHECK: top10_rank must be 1-10 or null
    check('top10_rank_check',
        sql`${table.top10_rank} IS NULL OR (${table.top10_rank} >= 1 AND ${table.top10_rank} <= 10)`),
]);
