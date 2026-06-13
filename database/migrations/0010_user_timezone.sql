-- Migration 0010: user locale/timezone preferences

ALTER TABLE users ADD COLUMN country_code TEXT NOT NULL DEFAULT 'TR';
ALTER TABLE users ADD COLUMN timezone TEXT NOT NULL DEFAULT 'Europe/Istanbul';

CREATE INDEX idx_users_timezone ON users(timezone);
