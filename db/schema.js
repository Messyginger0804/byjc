import {
    pgTable,
    serial,
    varchar,
    text,
    boolean,
    timestamp,
    integer,
    index,
} from 'drizzle-orm/pg-core';

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
    published_at: timestamp('published_at', { withTimezone: true }).defaultNow(),
    featured_slot: varchar('featured_slot', { length: 50 }),
    updated_at:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    index('blogs_slug_idx').on(table.slug),
    index('blogs_published_at_idx').on(table.published_at),
    index('blogs_featured_slot_idx').on(table.featured_slot),
]);

export const comments = pgTable('comments', {
    id:         serial('id').primaryKey(),
    blog_id:    integer('blog_id').references(() => blogs.id, { onDelete: 'cascade' }).notNull(),
    name:       text('name').notNull(),
    body:       text('body').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    index('comments_blog_id_idx').on(table.blog_id),
]);

export const jokes = pgTable('jokes', {
    id:         serial('id').primaryKey(),
    setup:      text('setup').notNull(),
    punchline:  text('punchline').notNull(),
    jc_starred: boolean('jc_starred').default(false),
    top10_rank: integer('top10_rank'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
