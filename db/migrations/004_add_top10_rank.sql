ALTER TABLE jokes
ADD COLUMN IF NOT EXISTS top10_rank INTEGER;

ALTER TABLE jokes
DROP CONSTRAINT IF EXISTS jokes_top10_rank_check;

ALTER TABLE jokes
ADD CONSTRAINT jokes_top10_rank_check
CHECK (top10_rank IS NULL OR (top10_rank >= 1 AND top10_rank <= 10));

CREATE UNIQUE INDEX IF NOT EXISTS jokes_top10_rank_unique
ON jokes(top10_rank)
WHERE top10_rank IS NOT NULL;
