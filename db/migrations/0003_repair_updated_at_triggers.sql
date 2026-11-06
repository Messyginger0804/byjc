-- Recreate both triggers safely so databases with a missing or misbound trigger converge.
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
--> statement-breakpoint
DROP TRIGGER IF EXISTS set_updated_at ON public.blogs;
--> statement-breakpoint
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.blogs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
--> statement-breakpoint
DROP TRIGGER IF EXISTS set_updated_at ON public.jokes;
--> statement-breakpoint
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.jokes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
