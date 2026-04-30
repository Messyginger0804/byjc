CREATE TABLE IF NOT EXISTS jokes (
  id         SERIAL PRIMARY KEY,
  title      TEXT,
  body       TEXT NOT NULL,
  source     TEXT,
  jc_starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
