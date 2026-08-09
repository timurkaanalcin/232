-- Migration 0006: Sale/Retention status workflows, ad source, and Shift role

ALTER TABLE users ADD COLUMN sale_status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE users ADD COLUMN sale_status_scheduled_at INTEGER;
ALTER TABLE users ADD COLUMN retention_status_scheduled_at INTEGER;
ALTER TABLE users ADD COLUMN ad_source TEXT NOT NULL DEFAULT '';

-- Normalize earlier branch-only retention values into the CRM status list.
UPDATE users SET retention_status = 'new' WHERE retention_status = 'pending';
UPDATE users SET retention_status = 'low_potential' WHERE retention_status = 'at_risk';
UPDATE users SET retention_status = 'active' WHERE retention_status = 'retained';
UPDATE users SET retention_status = 'trash' WHERE retention_status = 'lost';

CREATE INDEX idx_users_sale_status ON users(sale_status);
CREATE INDEX idx_users_retention_status_schedule ON users(retention_status_scheduled_at);
CREATE INDEX idx_users_sale_status_schedule ON users(sale_status_scheduled_at);
CREATE INDEX idx_users_ad_source ON users(ad_source);

INSERT OR IGNORE INTO roles (id, name, description, created_at) VALUES
  ('shift', 'Shift', 'Admin-level CRM access without site settings; manages Head and below', unixepoch() * 1000);

INSERT OR IGNORE INTO permissions (role_id, permission) VALUES
  ('shift', 'admin.access'),
  ('shift', 'admin.panel'),
  ('shift', 'stats.view'),
  ('shift', 'map.live_view'),
  ('shift', 'sessions.view'),
  ('shift', 'sessions.manage'),
  ('shift', 'users.view'),
  ('shift', 'users.create'),
  ('shift', 'users.manage'),
  ('shift', 'roles.assign'),
  ('shift', 'audit.view'),
  ('shift', 'customers.manage'),
  ('shift', 'tickets.manage'),
  ('shift', 'documents.manage'),
  ('shift', 'reports.view');
