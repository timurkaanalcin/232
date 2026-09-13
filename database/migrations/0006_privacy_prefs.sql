-- Migration 0006: consent-first privacy + notification preferences

CREATE TABLE user_privacy_prefs (
  user_id                   TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notify_session            INTEGER NOT NULL DEFAULT 1 CHECK (notify_session IN (0, 1)),
  notify_security           INTEGER NOT NULL DEFAULT 1 CHECK (notify_security IN (0, 1)),
  notify_consent            INTEGER NOT NULL DEFAULT 1 CHECK (notify_consent IN (0, 1)),
  marketing_opt_in          INTEGER NOT NULL DEFAULT 0 CHECK (marketing_opt_in IN (0, 1)),
  location_retention_days   INTEGER NOT NULL DEFAULT 0 CHECK (location_retention_days IN (0, 30, 90, 365)),
  updated_at                INTEGER NOT NULL
);

CREATE INDEX idx_privacy_prefs_updated ON user_privacy_prefs(updated_at DESC);
