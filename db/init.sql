-- Local Docker bootstrap schema. Mounted into postgres:16-alpine via
-- docker-entrypoint-initdb.d by docker-compose.yml, so it only ever runs
-- once against a brand-new database volume.
--
-- This file is a hand-maintained snapshot of `db/schema.js` (via
-- `db/migrations/*.sql`), kept here so `npm run dev:local` / `dev:docker*`
-- can spin up a working local Postgres without needing prod credentials.
-- `db/schema.js` is the authoritative source of truth — see README.md for
-- how to regenerate this file and the migrations after a schema change.
-- `dev:local` and `dev:docker` also run `drizzle-kit push` after the
-- container is healthy, so this file only needs to be "close enough" to
-- get the container past its first boot; push reconciles the rest.

CREATE TABLE IF NOT EXISTS blogs (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR NOT NULL,
  description   TEXT NOT NULL,
  content       TEXT NOT NULL,
  slug          VARCHAR UNIQUE NOT NULL,
  author        VARCHAR DEFAULT 'JC Ashley',
  tags          TEXT[] DEFAULT '{}',
  image_url     TEXT,
  is_published  BOOLEAN DEFAULT true,
  is_featured   BOOLEAN DEFAULT false,
  published_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  featured_slot VARCHAR(50),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT featured_slot_check CHECK (
    featured_slot IS NULL OR featured_slot IN (
      'january','february','march','april','may','june',
      'july','august','september','october','november','december'
    )
  )
);

CREATE INDEX IF NOT EXISTS blogs_published_at_idx ON blogs(published_at);
CREATE INDEX IF NOT EXISTS blogs_featured_slot_idx ON blogs(featured_slot);
-- Composite: blog listing — published posts sorted by date
CREATE INDEX IF NOT EXISTS blogs_published_idx ON blogs(published_at, id) WHERE is_published = true;
-- Composite: featured blog lookup
CREATE INDEX IF NOT EXISTS blogs_featured_lookup_idx ON blogs(featured_slot, published_at) WHERE is_published = true;
-- Partial unique index: only one blog per featured slot, only when a slot is set
CREATE UNIQUE INDEX IF NOT EXISTS blogs_featured_slot_unique ON blogs(featured_slot) WHERE featured_slot IS NOT NULL;

CREATE TABLE IF NOT EXISTS comments (
  id         SERIAL PRIMARY KEY,
  blog_id    INTEGER REFERENCES blogs(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS comments_blog_id_idx ON comments(blog_id);
-- Composite: comment listing per blog, ordered by date
CREATE INDEX IF NOT EXISTS comments_blog_created_idx ON comments(blog_id, created_at);

CREATE TABLE IF NOT EXISTS jokes (
  id         SERIAL PRIMARY KEY,
  setup      TEXT NOT NULL,
  punchline  TEXT NOT NULL,
  jc_starred BOOLEAN DEFAULT false,
  top10_rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT top10_rank_check CHECK (top10_rank IS NULL OR (top10_rank >= 1 AND top10_rank <= 10))
);

-- Partial unique index: only one joke per rank, only when rank is set
CREATE UNIQUE INDEX IF NOT EXISTS jokes_top10_rank_unique ON jokes(top10_rank) WHERE top10_rank IS NOT NULL;

-- Trigger function to auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON jokes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
