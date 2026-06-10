-- Migration 0001: initial schema
-- All timestamps are unix epoch milliseconds (INTEGER).

PRAGMA defer_foreign_keys = true;

-- ----------------------------------------------------------------------------
-- Roles & permissions (RBAC)
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
  id          TEXT PRIMARY KEY,             -- 'super_admin' | 'admin' | 'operator' | 'viewer' | 'user'
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at  INTEGER NOT NULL
);

CREATE TABLE permissions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id    TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,                 -- e.g. 'users.manage', 'audit.view'
  UNIQUE (role_id, permission)
);

CREATE INDEX idx_permissions_role ON permissions(role_id);

-- ----------------------------------------------------------------------------
-- Users
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id             TEXT PRIMARY KEY,          -- uuid v4
  email          TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  name           TEXT NOT NULL DEFAULT '',
  image          TEXT,
  password_hash  TEXT,                      -- NULL for OAuth-only accounts
  role_id        TEXT NOT NULL DEFAULT 'user' REFERENCES roles(id),
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL,
  last_login_at  INTEGER
);

CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- ----------------------------------------------------------------------------
-- Device sessions (refresh-token control plane + device management)
-- ----------------------------------------------------------------------------
CREATE TABLE sessions (
  id           TEXT PRIMARY KEY,            -- uuid v4, embedded as `sid` in the JWT
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_agent   TEXT NOT NULL DEFAULT '',
  ip           TEXT NOT NULL DEFAULT '',
  device_name  TEXT NOT NULL DEFAULT '',    -- parsed from user agent at login
  created_at   INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at   INTEGER NOT NULL,
  revoked_at   INTEGER
);

CREATE INDEX idx_sessions_user ON sessions(user_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- Password reset tokens
-- ----------------------------------------------------------------------------
CREATE TABLE password_reset_tokens (
  id         TEXT PRIMARY KEY,              -- uuid v4
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,                 -- sha-256 of the raw token
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at    INTEGER
);

CREATE INDEX idx_prt_user ON password_reset_tokens(user_id);
CREATE INDEX idx_prt_hash ON password_reset_tokens(token_hash);

-- ----------------------------------------------------------------------------
-- Location sharing sessions (consent boundary)
-- ----------------------------------------------------------------------------
CREATE TABLE location_sessions (
  id                 TEXT PRIMARY KEY,      -- uuid v4
  user_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_session_id  TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  status             TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  label              TEXT NOT NULL DEFAULT '',
  consent_granted_at INTEGER NOT NULL,      -- explicit consent timestamp (required)
  started_at         INTEGER NOT NULL,
  ended_at           INTEGER,
  end_reason         TEXT CHECK (end_reason IN ('user', 'admin', 'timeout', 'account_deleted')),
  last_lat           REAL,
  last_lng           REAL,
  last_accuracy      REAL,
  last_update_at     INTEGER,
  points_count       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_loc_sessions_user ON location_sessions(user_id, started_at DESC);
CREATE INDEX idx_loc_sessions_status ON location_sessions(status);

-- ----------------------------------------------------------------------------
-- Location points
-- ----------------------------------------------------------------------------
CREATE TABLE locations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT NOT NULL REFERENCES location_sessions(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lat         REAL NOT NULL,
  lng         REAL NOT NULL,
  accuracy    REAL NOT NULL,                -- meters
  altitude    REAL,
  speed       REAL,
  heading     REAL,
  recorded_at INTEGER NOT NULL,             -- device timestamp
  created_at  INTEGER NOT NULL              -- server timestamp
);

CREATE INDEX idx_locations_session ON locations(session_id, recorded_at);
CREATE INDEX idx_locations_user ON locations(user_id, recorded_at);

-- ----------------------------------------------------------------------------
-- Audit log (append-only)
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id    TEXT,                         -- NULL for anonymous/system events
  actor_email TEXT NOT NULL DEFAULT '',
  action      TEXT NOT NULL,                -- e.g. 'auth.login', 'location.session_started'
  target_type TEXT NOT NULL DEFAULT '',     -- 'user' | 'location_session' | 'session' | ...
  target_id   TEXT NOT NULL DEFAULT '',
  ip          TEXT NOT NULL DEFAULT '',
  user_agent  TEXT NOT NULL DEFAULT '',
  metadata    TEXT NOT NULL DEFAULT '{}',   -- JSON
  created_at  INTEGER NOT NULL
);

CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
