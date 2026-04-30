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
  published_at  TIMESTAMPTZ DEFAULT NOW(),
  featured_slot VARCHAR(50),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blogs_slug_idx         ON blogs(slug);
CREATE INDEX IF NOT EXISTS blogs_published_at_idx ON blogs(published_at DESC);
CREATE INDEX IF NOT EXISTS blogs_featured_slot_idx ON blogs(featured_slot);

CREATE TABLE IF NOT EXISTS comments (
  id         SERIAL PRIMARY KEY,
  blog_id    INTEGER REFERENCES blogs(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_blog_id_idx ON comments(blog_id);

CREATE TABLE IF NOT EXISTS jokes (
  id         SERIAL PRIMARY KEY,
  setup      TEXT NOT NULL,
  punchline  TEXT NOT NULL,
  jc_starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
