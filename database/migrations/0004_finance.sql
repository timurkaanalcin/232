-- Finance platform: instruments, quotes, candles, watchlists, news, videos.

CREATE TABLE instruments (
  id              TEXT PRIMARY KEY,
  symbol          TEXT NOT NULL UNIQUE,
  yahoo_symbol    TEXT NOT NULL,
  name            TEXT NOT NULL,
  name_tr         TEXT NOT NULL DEFAULT '',
  type            TEXT NOT NULL CHECK (type IN ('index','stock','etf','crypto','fx','commodity')),
  region          TEXT NOT NULL DEFAULT 'us',
  exchange        TEXT NOT NULL DEFAULT '',
  currency        TEXT NOT NULL DEFAULT 'USD',
  sector          TEXT NOT NULL DEFAULT '',
  description     TEXT NOT NULL DEFAULT '',
  description_tr  TEXT NOT NULL DEFAULT '',
  market_cap      REAL,
  pe_ratio        REAL,
  dividend_yield  REAL,
  week52_high     REAL,
  week52_low      REAL,
  avg_volume      REAL,
  is_featured     INTEGER NOT NULL DEFAULT 0,
  is_active       INTEGER NOT NULL DEFAULT 1,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX idx_instruments_type ON instruments(type, is_active, sort_order);
CREATE INDEX idx_instruments_region ON instruments(region, is_active);
CREATE INDEX idx_instruments_featured ON instruments(is_featured, is_active);

CREATE TABLE quotes (
  instrument_id TEXT PRIMARY KEY REFERENCES instruments(id) ON DELETE CASCADE,
  price         REAL NOT NULL,
  change_abs    REAL NOT NULL DEFAULT 0,
  change_pct    REAL NOT NULL DEFAULT 0,
  open          REAL,
  high          REAL,
  low           REAL,
  prev_close    REAL,
  volume        REAL,
  source        TEXT NOT NULL DEFAULT 'seed',
  updated_at    INTEGER NOT NULL
);

CREATE TABLE candles (
  instrument_id TEXT NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
  range_key     TEXT NOT NULL,
  ts            INTEGER NOT NULL,
  open          REAL NOT NULL,
  high          REAL NOT NULL,
  low           REAL NOT NULL,
  close         REAL NOT NULL,
  volume        REAL,
  PRIMARY KEY (instrument_id, range_key, ts)
);

CREATE INDEX idx_candles_lookup ON candles(instrument_id, range_key, ts);

CREATE TABLE watchlists (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT 'İzleme listem',
  created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX idx_watchlists_user ON watchlists(user_id);

CREATE TABLE watchlist_items (
  watchlist_id   TEXT NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  instrument_id  TEXT NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
  added_at       INTEGER NOT NULL,
  PRIMARY KEY (watchlist_id, instrument_id)
);

CREATE TABLE finance_news (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  category      TEXT NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT NOT NULL,
  body          TEXT NOT NULL DEFAULT '',
  author        TEXT NOT NULL DEFAULT '',
  image_url     TEXT NOT NULL DEFAULT '',
  source_url    TEXT NOT NULL DEFAULT '',
  ticker        TEXT,
  breaking      INTEGER NOT NULL DEFAULT 0,
  is_published  INTEGER NOT NULL DEFAULT 1,
  is_featured   INTEGER NOT NULL DEFAULT 0,
  published_at  INTEGER NOT NULL,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,
  created_by    TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_finance_news_pub ON finance_news(is_published, published_at DESC);
CREATE INDEX idx_finance_news_cat ON finance_news(category, published_at DESC);

CREATE TABLE finance_news_instruments (
  news_id        TEXT NOT NULL REFERENCES finance_news(id) ON DELETE CASCADE,
  instrument_id  TEXT NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
  PRIMARY KEY (news_id, instrument_id)
);

CREATE TABLE finance_videos (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  channel       TEXT NOT NULL DEFAULT '',
  youtube_id    TEXT NOT NULL,
  duration      TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'Piyasa',
  is_published  INTEGER NOT NULL DEFAULT 1,
  is_featured   INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE INDEX idx_finance_videos_pub ON finance_videos(is_published, sort_order);

CREATE TABLE finance_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO permissions (role_id, permission) VALUES
  ('super_admin', 'finance.manage'),
  ('admin', 'finance.manage');
