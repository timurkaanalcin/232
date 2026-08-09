-- Migration 0009: Client detail modules and live support messages

CREATE TABLE crm_trade_accounts (
  id         TEXT PRIMARY KEY,
  client_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_no TEXT NOT NULL,
  name       TEXT NOT NULL DEFAULT '',
  account_type TEXT NOT NULL DEFAULT 'live' CHECK (account_type IN ('live', 'demo')),
  currency   TEXT NOT NULL DEFAULT 'USD',
  balance    REAL NOT NULL DEFAULT 0,
  credit     REAL NOT NULL DEFAULT 0,
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX idx_trade_accounts_no ON crm_trade_accounts(account_no);
CREATE INDEX idx_trade_accounts_client ON crm_trade_accounts(client_id, created_at DESC);

CREATE TABLE crm_money_transactions (
  id           TEXT PRIMARY KEY,
  client_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tx_type      TEXT NOT NULL CHECK (tx_type IN ('deposit', 'withdrawal', 'bonus', 'commission', 'swap', 'transfer')),
  amount       REAL NOT NULL CHECK (amount >= 0),
  currency     TEXT NOT NULL DEFAULT 'USD',
  method       TEXT NOT NULL DEFAULT '',
  tx_status    TEXT NOT NULL DEFAULT 'pending' CHECK (tx_status IN ('pending', 'approved', 'rejected')),
  reference_no TEXT NOT NULL DEFAULT '',
  note         TEXT NOT NULL DEFAULT '',
  created_at   INTEGER NOT NULL
);

CREATE INDEX idx_money_transactions_client ON crm_money_transactions(client_id, created_at DESC);

CREATE TABLE crm_documents (
  id           TEXT PRIMARY KEY,
  client_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'verification',
  file_url     TEXT NOT NULL DEFAULT '',
  doc_status   TEXT NOT NULL DEFAULT 'pending' CHECK (doc_status IN ('pending', 'approved', 'rejected')),
  created_at   INTEGER NOT NULL
);

CREATE INDEX idx_documents_client ON crm_documents(client_id, created_at DESC);

CREATE TABLE crm_support_messages (
  id           TEXT PRIMARY KEY,
  client_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  sender_name  TEXT NOT NULL DEFAULT '',
  sender_email TEXT NOT NULL DEFAULT '',
  sender_role  TEXT NOT NULL DEFAULT '',
  body         TEXT NOT NULL,
  created_at   INTEGER NOT NULL
);

CREATE INDEX idx_support_messages_client ON crm_support_messages(client_id, created_at DESC);
CREATE INDEX idx_support_messages_sender ON crm_support_messages(sender_id, created_at DESC);
