-- Enforce the featured slots the app actually uses (src/lib/constants.js).
--
-- Existing rows are repaired first: unrecognised slot values and all but the
-- newest holder of each slot are cleared. Nothing is discarded silently: every
-- cleared (id, featured_slot) pair is recorded in blogs_featured_slot_backup_0004.
-- Back up production before running this migration.
--
-- To undo for a post (only if its slot is free):
--   UPDATE public.blogs b SET featured_slot = k.featured_slot
--   FROM public.blogs_featured_slot_backup_0004 k
--   WHERE k.id = b.id AND k.reason = 'duplicate_slot'
--     AND NOT EXISTS (SELECT 1 FROM public.blogs x WHERE x.featured_slot = k.featured_slot);
-- (rows with reason 'invalid_slot' hold values the app never used; review by hand)
ALTER TABLE public.blogs DROP CONSTRAINT IF EXISTS featured_slot_check;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS public.blogs_featured_slot_backup_0004 (
    id integer NOT NULL,
    featured_slot varchar(50),
    reason text NOT NULL,
    backed_up_at timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- One statement: rows are cleared and audited together via UPDATE ... RETURNING, so
-- correctness does not depend on transaction boundaries or on NOW() equality.
WITH ranked AS (
    SELECT id,
           featured_slot,
           CASE
               WHEN featured_slot NOT IN ('featured-main', 'featured-secondary-1', 'featured-secondary-2')
                   THEN 'invalid_slot'
               WHEN ROW_NUMBER() OVER (
                        PARTITION BY featured_slot
                        ORDER BY (is_published IS TRUE AND published_at IS NOT NULL AND published_at <= now()) DESC,
                                 updated_at DESC NULLS LAST, published_at DESC NULLS LAST, id DESC
                    ) > 1
                   THEN 'duplicate_slot'
           END AS reason
    FROM public.blogs
    WHERE featured_slot IS NOT NULL
), cleared AS (
    UPDATE public.blogs b
    SET featured_slot = NULL
    FROM ranked r
    WHERE b.id = r.id AND r.reason IS NOT NULL
    RETURNING r.id, r.featured_slot, r.reason
)
INSERT INTO public.blogs_featured_slot_backup_0004 (id, featured_slot, reason)
SELECT id, featured_slot, reason FROM cleared;
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
