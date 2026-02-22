CREATE SCHEMA IF NOT EXISTS drizzle;
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
)

INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at) VALUES (1, '97f3f85fb87a38a2d771386d40c6ec5ff84be5c802d16d8a80b1e0f5b4c30399', 1767078400000);
