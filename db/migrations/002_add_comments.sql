CREATE TABLE IF NOT EXISTS comments (
  id         SERIAL PRIMARY KEY,
  blog_id    INTEGER REFERENCES blogs(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_blog_id_idx ON comments(blog_id);
