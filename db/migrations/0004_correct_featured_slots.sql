-- Replace the accidentally generated month constraint with the slots used by the app.
ALTER TABLE public.blogs DROP CONSTRAINT IF EXISTS featured_slot_check;
--> statement-breakpoint
UPDATE public.blogs
SET featured_slot = NULL
WHERE featured_slot IS NOT NULL
  AND featured_slot NOT IN ('featured-main', 'featured-secondary-1', 'featured-secondary-2');
--> statement-breakpoint
WITH duplicate_slots AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY featured_slot
               ORDER BY updated_at DESC NULLS LAST, published_at DESC NULLS LAST, id DESC
           ) AS slot_position
    FROM public.blogs
    WHERE featured_slot IS NOT NULL
)
UPDATE public.blogs AS blogs
SET featured_slot = NULL
FROM duplicate_slots
WHERE blogs.id = duplicate_slots.id
  AND duplicate_slots.slot_position > 1;
--> statement-breakpoint
ALTER TABLE public.blogs
    ADD CONSTRAINT featured_slot_check
    CHECK (featured_slot IS NULL OR featured_slot IN ('featured-main', 'featured-secondary-1', 'featured-secondary-2'));
--> statement-breakpoint
DROP INDEX IF EXISTS public.blogs_featured_slot_idx;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS blogs_featured_slot_unique
    ON public.blogs USING btree (featured_slot)
    WHERE featured_slot IS NOT NULL;
