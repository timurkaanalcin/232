-- Migration 0005: internal wallet control plane
-- Amounts are stored as integer minor units to avoid floating point money math.

CREATE TABLE wallets (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_type   TEXT NOT NULL CHECK (wallet_type IN ('main', 'trading', 'bonus', 'credit', 'crypto', 'multi_currency')),
  currency      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'archived')),
  balance_minor INTEGER NOT NULL DEFAULT 0 CHECK (balance_minor >= 0),
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,
  UNIQUE (user_id, wallet_type, currency)
);

CREATE INDEX idx_wallets_user ON wallets(user_id, created_at DESC);
CREATE INDEX idx_wallets_status ON wallets(status, created_at DESC);
CREATE INDEX idx_wallets_currency ON wallets(currency, created_at DESC);

CREATE TABLE wallet_transfers (
  id             TEXT PRIMARY KEY,
  from_wallet_id TEXT NOT NULL REFERENCES wallets(id),
  to_wallet_id   TEXT NOT NULL REFERENCES wallets(id),
  amount_minor   INTEGER NOT NULL CHECK (amount_minor > 0),
  currency       TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('posted', 'reversed')),
  memo           TEXT NOT NULL DEFAULT '',
  created_by     TEXT REFERENCES users(id) ON DELETE SET NULL,
  reversed_by    TEXT REFERENCES users(id) ON DELETE SET NULL,
  reversed_at    INTEGER,
  created_at     INTEGER NOT NULL
);

CREATE INDEX idx_wallet_transfers_created ON wallet_transfers(created_at DESC);
CREATE INDEX idx_wallet_transfers_from ON wallet_transfers(from_wallet_id, created_at DESC);
CREATE INDEX idx_wallet_transfers_to ON wallet_transfers(to_wallet_id, created_at DESC);
CREATE INDEX idx_wallet_transfers_status ON wallet_transfers(status, created_at DESC);

CREATE TABLE wallet_transactions (
  id                  TEXT PRIMARY KEY,
  wallet_id           TEXT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transfer_id         TEXT REFERENCES wallet_transfers(id),
  transaction_type    TEXT NOT NULL CHECK (transaction_type IN ('wallet.created', 'wallet.status_changed', 'transfer', 'transfer.reversal')),
  direction           TEXT NOT NULL CHECK (direction IN ('credit', 'debit', 'neutral')),
  amount_minor        INTEGER NOT NULL DEFAULT 0 CHECK (amount_minor >= 0),
  currency            TEXT NOT NULL,
  balance_after_minor INTEGER NOT NULL CHECK (balance_after_minor >= 0),
  related_wallet_id   TEXT REFERENCES wallets(id),
  actor_id            TEXT REFERENCES users(id) ON DELETE SET NULL,
  memo                TEXT NOT NULL DEFAULT '',
  metadata            TEXT NOT NULL DEFAULT '{}',
  created_at          INTEGER NOT NULL
);

CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id, created_at DESC);
CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id, created_at DESC);
CREATE INDEX idx_wallet_transactions_transfer ON wallet_transactions(transfer_id, created_at DESC);
