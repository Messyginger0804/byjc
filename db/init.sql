CREATE TABLE IF NOT EXISTS blogs (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR NOT NULL,
  description  TEXT NOT NULL,
  content      TEXT NOT NULL,
  slug         VARCHAR UNIQUE NOT NULL,
  author       VARCHAR DEFAULT 'JC Ashley',
  tags         TEXT[] DEFAULT '{}',
  image_url    TEXT,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  featured_slot VARCHAR(50),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blogs_slug_idx        ON blogs(slug);
CREATE INDEX IF NOT EXISTS blogs_published_at_idx ON blogs(published_at DESC);
CREATE INDEX IF NOT EXISTS blogs_featured_slot_idx ON blogs(featured_slot);
