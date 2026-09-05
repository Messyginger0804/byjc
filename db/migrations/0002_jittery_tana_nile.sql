-- Reconciles db/migrations with db/schema.js (see README.md). Notes on
-- production safety for a table of this app's size:
--   * The CREATE/DROP INDEX and ADD CONSTRAINT statements below take brief
--     locks (not CONCURRENTLY) — acceptable for this app's row counts, but
--     worth knowing if this table ever grows large.
--   * The two new unique indexes (blogs_featured_slot_unique,
--     jokes_top10_rank_unique) and the two CHECK constraints will fail loudly
--     — not corrupt data — if any existing row already violates them (e.g. two
--     blogs sharing a featured_slot). The app's own write paths never produce
--     that state, but if this ever fails when applied, resolve the offending
--     rows manually and re-run rather than loosening the constraint.
DROP INDEX "blogs_slug_idx";--> statement-breakpoint
DROP INDEX "jokes_top10_rank_idx";--> statement-breakpoint
DROP INDEX "jokes_jc_starred_idx";--> statement-breakpoint
-- Backfill any legacy NULLs before enforcing NOT NULL below — both columns have
-- always defaulted to NOW() at the application layer, so this should be a no-op
-- on a healthy database, but it keeps the migration from aborting if an old row
-- ever slipped through without one.
UPDATE "blogs" SET "published_at" = NOW() WHERE "published_at" IS NULL;--> statement-breakpoint
UPDATE "comments" SET "created_at" = NOW() WHERE "created_at" IS NULL;--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "published_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "blogs_published_idx" ON "blogs" USING btree ("published_at","id") WHERE "blogs"."is_published" = true;--> statement-breakpoint
CREATE INDEX "blogs_featured_lookup_idx" ON "blogs" USING btree ("featured_slot","published_at") WHERE "blogs"."is_published" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "blogs_featured_slot_unique" ON "blogs" USING btree ("featured_slot") WHERE "blogs"."featured_slot" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "comments_blog_created_idx" ON "comments" USING btree ("blog_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "jokes_top10_rank_unique" ON "jokes" USING btree ("top10_rank") WHERE "jokes"."top10_rank" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "featured_slot_check" CHECK ("blogs"."featured_slot" IS NULL OR "blogs"."featured_slot" IN ('featured-main','featured-secondary-1','featured-secondary-2'));--> statement-breakpoint
ALTER TABLE "jokes" ADD CONSTRAINT "top10_rank_check" CHECK ("jokes"."top10_rank" IS NULL OR ("jokes"."top10_rank" >= 1 AND "jokes"."top10_rank" <= 10));