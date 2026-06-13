-- Migration 0005: numeric-only public IDs for client accounts

ALTER TABLE users ADD COLUMN client_numeric_id TEXT NOT NULL DEFAULT '';

-- Backfill existing clients with deterministic numeric IDs. The internal UUID remains unchanged.
UPDATE users
SET client_numeric_id = printf('%08d', rowid)
WHERE role_id = 'user' AND client_numeric_id = '';

CREATE UNIQUE INDEX idx_users_client_numeric_id
ON users(client_numeric_id)
WHERE client_numeric_id <> '';
