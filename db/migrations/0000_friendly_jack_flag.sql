CREATE TABLE "blogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"slug" varchar NOT NULL,
	"author" varchar DEFAULT 'JC Ashley',
	"tags" text[] DEFAULT '{}',
	"image_url" text,
	"is_published" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"published_at" timestamp with time zone DEFAULT now(),
	"featured_slot" varchar(50),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"blog_id" integer NOT NULL,
	"name" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jokes" (
	"id" serial PRIMARY KEY NOT NULL,
	"setup" text NOT NULL,
	"punchline" text NOT NULL,
	"jc_starred" boolean DEFAULT false,
	"top10_rank" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blogs_slug_idx" ON "blogs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blogs_published_at_idx" ON "blogs" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "blogs_featured_slot_idx" ON "blogs" USING btree ("featured_slot");--> statement-breakpoint
CREATE INDEX "comments_blog_id_idx" ON "comments" USING btree ("blog_id");--> statement-breakpoint
CREATE INDEX "jokes_top10_rank_idx" ON "jokes" USING btree ("top10_rank");--> statement-breakpoint
CREATE INDEX "jokes_jc_starred_idx" ON "jokes" USING btree ("jc_starred");