-- Migration 0008: Client detail notes and additional info

ALTER TABLE users ADD COLUMN extra_info TEXT NOT NULL DEFAULT '';

CREATE TABLE crm_client_comments (
  id           TEXT PRIMARY KEY,
  client_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  author_name  TEXT NOT NULL DEFAULT '',
  author_email TEXT NOT NULL DEFAULT '',
  body         TEXT NOT NULL,
  created_at   INTEGER NOT NULL
);

CREATE INDEX idx_client_comments_client ON crm_client_comments(client_id, created_at DESC);
CREATE INDEX idx_client_comments_author ON crm_client_comments(author_id, created_at DESC);
