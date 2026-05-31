-- Trigger function to auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
-- Apply to blogs table
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON "blogs"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
--> statement-breakpoint
-- Apply to jokes table
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON "jokes"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
