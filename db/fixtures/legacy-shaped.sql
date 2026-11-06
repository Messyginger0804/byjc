-- Synthetic data shaped like pre-hardening production (state deployed by main:
-- migrations 0000-0001 only). Used by scripts/verify-legacy-migration.mjs.
INSERT INTO blogs (title, description, content, slug, featured_slot, published_at) VALUES
  ('a', 'd', 'c', 'a', 'featured-main', now()),
  ('b', 'd', 'c', 'b', 'featured-main', now()),
  ('c', 'd', 'c', 'c', 'featured-secondary-1', now()),
  ('d', 'd', 'c', 'd', 'legacy-bogus', now()),
  ('e', 'd', 'c', 'e', NULL, NULL);
INSERT INTO comments (blog_id, name, body, created_at) VALUES
  (1, 'n', 'null timestamp', NULL),
  (1, 'n', 'ok', now());
INSERT INTO jokes (setup, punchline, top10_rank) VALUES
  ('s1', 'p', 1), ('s2', 'p', 1), ('s3', 'p', 2), ('s4', 'p', 99), ('s5', 'p', 0), ('s6', 'p', NULL);
