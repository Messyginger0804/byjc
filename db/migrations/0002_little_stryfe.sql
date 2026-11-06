-- Hardening pass 1. Written to apply cleanly to databases that already hold
-- legacy data (nullable timestamps, duplicate/out-of-range joke ranks).
-- The featured_slot constraint is NOT created here; 0004 owns it, after it has
-- repaired and audited existing slot values.
DROP INDEX IF EXISTS "blogs_slug_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "jokes_top10_rank_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "jokes_jc_starred_idx";--> statement-breakpoint
UPDATE "blogs" SET "published_at" = COALESCE("updated_at", NOW()) WHERE "published_at" IS NULL;--> statement-breakpoint
UPDATE "comments" SET "created_at" = NOW() WHERE "created_at" IS NULL;--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "published_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jokes_top10_rank_backup_0002" (
	"id" integer NOT NULL,
	"top10_rank" integer,
	"reason" text NOT NULL,
	"backed_up_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
WITH ranked AS (
	SELECT "id", "top10_rank",
		CASE
			WHEN "top10_rank" < 1 OR "top10_rank" > 10 THEN 'out_of_range'
			WHEN ROW_NUMBER() OVER (PARTITION BY "top10_rank" ORDER BY "id") > 1 THEN 'duplicate_rank'
		END AS "reason"
	FROM "jokes"
	WHERE "top10_rank" IS NOT NULL
)
INSERT INTO "jokes_top10_rank_backup_0002" ("id", "top10_rank", "reason")
SELECT "id", "top10_rank", "reason" FROM ranked WHERE "reason" IS NOT NULL;--> statement-breakpoint
UPDATE "jokes" SET "top10_rank" = NULL
WHERE "id" IN (SELECT "id" FROM "jokes_top10_rank_backup_0002" WHERE "backed_up_at" = NOW());--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blogs_published_idx" ON "blogs" USING btree ("published_at","id") WHERE "blogs"."is_published" = true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blogs_featured_lookup_idx" ON "blogs" USING btree ("featured_slot","published_at") WHERE "blogs"."is_published" = true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_blog_created_idx" ON "comments" USING btree ("blog_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "jokes_top10_rank_unique" ON "jokes" USING btree ("top10_rank") WHERE "jokes"."top10_rank" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "jokes" DROP CONSTRAINT IF EXISTS "top10_rank_check";--> statement-breakpoint
ALTER TABLE "jokes" ADD CONSTRAINT "top10_rank_check" CHECK ("jokes"."top10_rank" IS NULL OR ("jokes"."top10_rank" >= 1 AND "jokes"."top10_rank" <= 10));
