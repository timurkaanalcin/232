-- Migration 0002: in-app notifications + security events

CREATE TABLE notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,                 -- e.g. 'session.started', 'security.alert'
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  metadata   TEXT NOT NULL DEFAULT '{}',
  read_at    INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at);

CREATE TABLE security_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type  TEXT NOT NULL,                -- e.g. 'auth.login_failed', 'rate_limit.exceeded'
  severity    TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  actor_id    TEXT,
  actor_email TEXT NOT NULL DEFAULT '',
  ip          TEXT NOT NULL DEFAULT '',
  user_agent  TEXT NOT NULL DEFAULT '',
  metadata    TEXT NOT NULL DEFAULT '{}',
  created_at  INTEGER NOT NULL
);

CREATE INDEX idx_security_events_created ON security_events(created_at DESC);
CREATE INDEX idx_security_events_type ON security_events(event_type, created_at DESC);
CREATE INDEX idx_security_events_severity ON security_events(severity, created_at DESC);
