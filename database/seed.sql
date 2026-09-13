-- Seed: roles and role permissions. Idempotent.

INSERT OR IGNORE INTO roles (id, name, description, created_at) VALUES
  ('super_admin', 'Super Admin', 'Full system access including role assignment', unixepoch() * 1000),
  ('admin',       'Admin',       'Manage users, sessions and view audit logs',   unixepoch() * 1000),
  ('operator',    'Operator',    'Monitor live map and manage location sessions', unixepoch() * 1000),
  ('viewer',      'Viewer',      'Read-only access to live map and statistics',  unixepoch() * 1000),
  ('user',        'User',        'Standard user - can share own location',       unixepoch() * 1000);

INSERT OR IGNORE INTO permissions (role_id, permission) VALUES
  -- super_admin
  ('super_admin', 'admin.access'),
  ('super_admin', 'stats.view'),
  ('super_admin', 'map.live_view'),
  ('super_admin', 'sessions.view'),
  ('super_admin', 'sessions.manage'),
  ('super_admin', 'users.view'),
  ('super_admin', 'users.create'),
  ('super_admin', 'users.manage'),
  ('super_admin', 'roles.assign'),
  ('super_admin', 'audit.view'),
  ('super_admin', 'risk.view'),
  ('super_admin', 'risk.manage'),
  ('super_admin', 'wallets.view'),
  ('super_admin', 'wallets.manage'),
  -- admin
  ('admin', 'admin.access'),
  ('admin', 'stats.view'),
  ('admin', 'map.live_view'),
  ('admin', 'sessions.view'),
  ('admin', 'sessions.manage'),
  ('admin', 'users.view'),
  ('admin', 'users.create'),
  ('admin', 'users.manage'),
  ('admin', 'audit.view'),
  ('admin', 'risk.view'),
  ('admin', 'risk.manage'),
  ('admin', 'wallets.view'),
  ('admin', 'wallets.manage'),
  -- operator
  ('operator', 'admin.access'),
  ('operator', 'stats.view'),
  ('operator', 'map.live_view'),
  ('operator', 'sessions.view'),
  ('operator', 'sessions.manage'),
  ('operator', 'risk.view'),
  ('operator', 'wallets.view'),
  -- viewer
  ('viewer', 'admin.access'),
  ('viewer', 'stats.view'),
  ('viewer', 'map.live_view'),
  ('viewer', 'sessions.view'),
  ('viewer', 'risk.view'),
  ('viewer', 'wallets.view');
