-- Migration 0004: admin risk and compliance event inbox
-- Events are append-friendly operational records; administrator responses are tracked in-place.

CREATE TABLE risk_events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  source          TEXT NOT NULL,                 -- e.g. 'ai_risk_engine', 'wallet_monitor', 'trading_terminal'
  event_type      TEXT NOT NULL,                 -- e.g. 'risk.limit_breached', 'wallet.withdrawal_flagged'
  severity        TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
  risk_score      INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  subject_type    TEXT NOT NULL DEFAULT '',      -- 'client' | 'wallet' | 'position' | 'tenant' | ...
  subject_id      TEXT NOT NULL DEFAULT '',
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  metadata        TEXT NOT NULL DEFAULT '{}',
  operator_note   TEXT NOT NULL DEFAULT '',
  acknowledged_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at INTEGER,
  resolved_by     TEXT REFERENCES users(id) ON DELETE SET NULL,
  resolved_at     INTEGER,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX idx_risk_events_status_created ON risk_events(status, created_at DESC);
CREATE INDEX idx_risk_events_severity_created ON risk_events(severity, created_at DESC);
CREATE INDEX idx_risk_events_type_created ON risk_events(event_type, created_at DESC);
CREATE INDEX idx_risk_events_subject ON risk_events(subject_type, subject_id, created_at DESC);
