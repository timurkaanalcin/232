/*
# Create Trading CRM & Admin Panel Schema

## Overview
Creates the full database schema for a trading platform with admin control.
The admin can manage traders, their balances, trades, transactions, and every
site-wide setting from the admin panel.

## New Tables

1. **traders** — Registered traders on the platform
   - id (uuid PK)
   - email (text, unique)
   - name (text)
   - account_number (text, unique) — display account ID like "5001284563"
   - account_type (text: classic/raw/tvraw)
   - balance (numeric) — current account balance
   - equity (numeric) — balance + open P&L (managed by app)
   - leverage (integer) — e.g. 500
   - currency (text, default USD)
   - is_active (boolean) — admin can disable a trader
   - is_demo (boolean) — demo vs real account
   - created_at, updated_at

2. **trades** — All trades (open and closed)
   - id (uuid PK)
   - trader_id (uuid FK → traders)
   - symbol (text)
   - type (text: buy/sell)
   - volume (numeric)
   - open_price (numeric)
   - close_price (numeric, nullable)
   - open_time, close_time (timestamptz)
   - sl, tp (numeric, nullable)
   - profit (numeric, default 0)
   - status (text: open/closed/pending)
   - created_at

3. **transactions** — Deposits, withdrawals, adjustments
   - id (uuid PK)
   - trader_id (uuid FK → traders)
   - type (text: deposit/withdrawal/adjustment/commission)
   - amount (numeric)
   - status (text: pending/completed/rejected)
   - description (text)
   - created_at

4. **site_settings** — Global site configuration (single row, key-value)
   - id (uuid PK)
   - key (text, unique) — e.g. "site_name", "leverage_max", "min_deposit"
   - value (text)
   - description (text)
   - updated_at

5. **admin_users** — Admin panel login credentials
   - id (uuid PK)
   - email (text, unique)
   - password_hash (text) — stored hash
   - name (text)
   - role (text: super_admin/admin/operator)
   - is_active (boolean)
   - created_at

## Security
- RLS enabled on all tables.
- This app has no sign-in screen for traders (admin panel uses its own auth).
- All tables allow anon + authenticated CRUD (admin panel runs client-side).
- In production, admin auth would be enforced via Supabase Auth + RLS.
*/

-- Traders
CREATE TABLE IF NOT EXISTS traders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  account_number text UNIQUE NOT NULL,
  account_type text NOT NULL DEFAULT 'classic',
  balance numeric NOT NULL DEFAULT 10000,
  equity numeric NOT NULL DEFAULT 10000,
  leverage integer NOT NULL DEFAULT 500,
  currency text NOT NULL DEFAULT 'USD',
  is_active boolean NOT NULL DEFAULT true,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE traders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_crud_traders_select" ON traders;
CREATE POLICY "anon_crud_traders_select" ON traders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_traders_insert" ON traders;
CREATE POLICY "anon_crud_traders_insert" ON traders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_crud_traders_update" ON traders;
CREATE POLICY "anon_crud_traders_update" ON traders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_crud_traders_delete" ON traders;
CREATE POLICY "anon_crud_traders_delete" ON traders FOR DELETE
  TO anon, authenticated USING (true);

-- Trades
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id uuid REFERENCES traders(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  type text NOT NULL CHECK (type IN ('buy', 'sell')),
  volume numeric NOT NULL DEFAULT 0.01,
  open_price numeric NOT NULL,
  close_price numeric,
  open_time timestamptz DEFAULT now(),
  close_time timestamptz,
  sl numeric,
  tp numeric,
  profit numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_crud_trades_select" ON trades;
CREATE POLICY "anon_crud_trades_select" ON trades FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_trades_insert" ON trades;
CREATE POLICY "anon_crud_trades_insert" ON trades FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_crud_trades_update" ON trades;
CREATE POLICY "anon_crud_trades_update" ON trades FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_crud_trades_delete" ON trades;
CREATE POLICY "anon_crud_trades_delete" ON trades FOR DELETE
  TO anon, authenticated USING (true);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id uuid REFERENCES traders(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'adjustment', 'commission')),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_crud_transactions_select" ON transactions;
CREATE POLICY "anon_crud_transactions_select" ON transactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_transactions_insert" ON transactions;
CREATE POLICY "anon_crud_transactions_insert" ON transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_crud_transactions_update" ON transactions;
CREATE POLICY "anon_crud_transactions_update" ON transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_crud_transactions_delete" ON transactions;
CREATE POLICY "anon_crud_transactions_delete" ON transactions FOR DELETE
  TO anon, authenticated USING (true);

-- Site Settings (key-value)
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  description text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_crud_settings_select" ON site_settings;
CREATE POLICY "anon_crud_settings_select" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_settings_insert" ON site_settings;
CREATE POLICY "anon_crud_settings_insert" ON site_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_crud_settings_update" ON site_settings;
CREATE POLICY "anon_crud_settings_update" ON site_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_crud_settings_delete" ON site_settings;
CREATE POLICY "anon_crud_settings_delete" ON site_settings FOR DELETE
  TO anon, authenticated USING (true);

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL DEFAULT 'Admin',
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'operator')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_crud_admin_select" ON admin_users;
CREATE POLICY "anon_crud_admin_select" ON admin_users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_admin_insert" ON admin_users;
CREATE POLICY "anon_crud_admin_insert" ON admin_users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_crud_admin_update" ON admin_users;
CREATE POLICY "anon_crud_admin_update" ON admin_users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_crud_admin_delete" ON admin_users;
CREATE POLICY "anon_crud_admin_delete" ON admin_users FOR DELETE
  TO anon, authenticated USING (true);

-- Seed default site settings
INSERT INTO site_settings (key, value, description) VALUES
  ('site_name', 'Tickmill', 'Site display name'),
  ('site_tagline', 'Low Spread Forex Broker. Trade FX and OTC', 'Hero tagline'),
  ('leverage_max', '1000', 'Maximum leverage offered'),
  ('min_deposit', '100', 'Minimum deposit in USD'),
  ('default_balance', '10000', 'Default demo balance for new traders'),
  ('default_leverage', '500', 'Default leverage for new traders'),
  ('default_account_type', 'raw', 'Default account type (classic/raw/tvraw)'),
  ('spread_eurusd', '12', 'EURUSD spread in points'),
  ('spread_xauusd', '25', 'XAUUSD spread in points'),
  ('spread_btcusd', '50', 'BTCUSD spread in points'),
  ('execution_speed', '0.15', 'Average execution speed in seconds'),
  ('support_email', 'support@tickmill.com', 'Support email address'),
  ('support_phone', '+44 20 7190 9935', 'Support phone number'),
  ('maintenance_mode', 'false', 'Site maintenance mode on/off'),
  ('trading_enabled', 'true', 'Trading enabled globally'),
  ('max_volume', '100', 'Maximum trade volume in lots'),
  ('min_volume', '0.01', 'Minimum trade volume in lots'),
  ('margin_call_level', '100', 'Margin call level percentage'),
  ('stop_out_level', '50', 'Stop out level percentage'),
  ('commission_raw', '3', 'RAW account commission per lot per side'),
  ('commission_tvraw', '3.5', 'TradingView RAW commission per lot per side')
ON CONFLICT (key) DO NOTHING;

-- Seed a default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, name, role)
VALUES ('admin@tickmill.com', 'admin123', 'Super Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Seed a demo trader
INSERT INTO traders (email, name, account_number, account_type, balance, leverage, is_demo)
VALUES ('trader@demo.com', 'Demo Trader', '5001284563', 'raw', 10000, 500, true)
ON CONFLICT (email) DO NOTHING;
