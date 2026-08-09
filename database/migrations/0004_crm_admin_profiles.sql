-- Migration 0004: CRM admin profile fields and sales/retention roles

ALTER TABLE users ADD COLUMN phone TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN address TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN date_of_birth TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN department TEXT NOT NULL DEFAULT 'client';
ALTER TABLE users ADD COLUMN retention_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE users ADD COLUMN manager_id TEXT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_retention_status ON users(retention_status);

INSERT OR IGNORE INTO roles (id, name, description, created_at) VALUES
  ('retention', 'Retention', 'CRM retention employee', unixepoch() * 1000),
  ('sale',      'Sale',      'CRM sales employee',     unixepoch() * 1000);

UPDATE roles SET
  name = 'Admin',
  description = 'Full CRM access including role assignment and system settings'
WHERE id = 'super_admin';

UPDATE roles SET
  name = 'Head',
  description = 'Manages all CRM teams and team leaders'
WHERE id = 'admin';

UPDATE roles SET
  name = 'Retention Team Leader',
  description = 'Manages the retention team'
WHERE id = 'operator';

UPDATE roles SET
  name = 'Sale Team Leader',
  description = 'Manages the sales team'
WHERE id = 'viewer';

UPDATE roles SET
  name = 'Client',
  description = 'Client account with read-only CRM access'
WHERE id = 'user';

INSERT OR IGNORE INTO permissions (role_id, permission) VALUES
  -- CRM display/feature areas for Admin
  ('super_admin', 'admin.panel'),
  ('super_admin', 'customers.manage'),
  ('super_admin', 'tickets.manage'),
  ('super_admin', 'documents.manage'),
  ('super_admin', 'reports.view'),
  ('super_admin', 'settings.manage'),
  -- Head
  ('admin', 'roles.assign'),
  ('admin', 'admin.panel'),
  ('admin', 'customers.manage'),
  ('admin', 'tickets.manage'),
  ('admin', 'documents.manage'),
  ('admin', 'reports.view'),
  -- Retention Team Leader
  ('operator', 'users.view'),
  ('operator', 'users.create'),
  ('operator', 'users.manage'),
  ('operator', 'roles.assign'),
  ('operator', 'customers.manage'),
  ('operator', 'tickets.manage'),
  ('operator', 'documents.manage'),
  ('operator', 'reports.view'),
  -- Sale Team Leader
  ('viewer', 'users.view'),
  ('viewer', 'users.create'),
  ('viewer', 'users.manage'),
  ('viewer', 'roles.assign'),
  ('viewer', 'customers.manage'),
  ('viewer', 'tickets.manage'),
  ('viewer', 'reports.view'),
  -- CRM employees
  ('retention', 'customers.manage'),
  ('retention', 'tickets.manage'),
  ('retention', 'documents.manage'),
  ('sale', 'customers.manage'),
  ('sale', 'tickets.manage'),
  -- client
  ('user', 'customers.manage');
