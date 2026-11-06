DROP INDEX "blogs_slug_idx";--> statement-breakpoint
DROP INDEX "jokes_top10_rank_idx";--> statement-breakpoint
DROP INDEX "jokes_jc_starred_idx";--> statement-breakpoint
ALTER TABLE "blogs" ALTER COLUMN "published_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "blogs_published_idx" ON "blogs" USING btree ("published_at","id") WHERE "blogs"."is_published" = true;--> statement-breakpoint
CREATE INDEX "blogs_featured_lookup_idx" ON "blogs" USING btree ("featured_slot","published_at") WHERE "blogs"."is_published" = true;--> statement-breakpoint
CREATE INDEX "comments_blog_created_idx" ON "comments" USING btree ("blog_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "jokes_top10_rank_unique" ON "jokes" USING btree ("top10_rank") WHERE "jokes"."top10_rank" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "featured_slot_check" CHECK ("blogs"."featured_slot" IS NULL OR "blogs"."featured_slot" IN ('january','february','march','april','may','june','july','august','september','october','november','december'));--> statement-breakpoint
ALTER TABLE "jokes" ADD CONSTRAINT "top10_rank_check" CHECK ("jokes"."top10_rank" IS NULL OR ("jokes"."top10_rank" >= 1 AND "jokes"."top10_rank" <= 10));