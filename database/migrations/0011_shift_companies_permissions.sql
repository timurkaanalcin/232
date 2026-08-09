-- Migration 0011: Shift companies and client permission hardening

ALTER TABLE users ADD COLUMN company_name TEXT NOT NULL DEFAULT '';

-- Clients must not be able to access admin/customer-management APIs.
DELETE FROM permissions WHERE role_id = 'user' AND permission = 'customers.manage';

INSERT OR IGNORE INTO permissions (role_id, permission) VALUES
  ('user', 'trading.access'),
  ('user', 'trading.order');

CREATE INDEX idx_users_company_name ON users(company_name);
