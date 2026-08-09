-- Migration 0007: CRM-linked demo trading workspace

CREATE TABLE crm_trade_orders (
  id          TEXT PRIMARY KEY,
  client_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  actor_email TEXT NOT NULL DEFAULT '',
  symbol      TEXT NOT NULL,
  market      TEXT NOT NULL DEFAULT 'US',
  side        TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  order_type  TEXT NOT NULL CHECK (order_type IN ('market', 'limit')),
  quantity    REAL NOT NULL CHECK (quantity > 0),
  price       REAL NOT NULL CHECK (price > 0),
  status      TEXT NOT NULL DEFAULT 'filled' CHECK (status IN ('filled', 'rejected')),
  notional    REAL NOT NULL,
  pnl         REAL NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);

CREATE INDEX idx_trade_orders_client ON crm_trade_orders(client_id, created_at DESC);
CREATE INDEX idx_trade_orders_created ON crm_trade_orders(created_at DESC);
CREATE INDEX idx_trade_orders_symbol ON crm_trade_orders(symbol, created_at DESC);

INSERT OR IGNORE INTO permissions (role_id, permission) VALUES
  ('super_admin', 'trading.access'),
  ('super_admin', 'trading.order'),
  ('shift', 'trading.access'),
  ('shift', 'trading.order'),
  ('admin', 'trading.access'),
  ('admin', 'trading.order'),
  ('operator', 'trading.access'),
  ('operator', 'trading.order'),
  ('viewer', 'trading.access'),
  ('viewer', 'trading.order'),
  ('retention', 'trading.access'),
  ('sale', 'trading.access'),
  ('sale', 'trading.order');
