import { INSTRUMENT_CATALOG, NEWS_CATALOG, VIDEO_CATALOG, getInstrumentSeed, searchCatalog } from "@/lib/finance/catalog";
import { fetchYahooChart } from "@/lib/finance/providers";
import { simulateCandles, simulateQuote, sparklineFromCandles } from "@/lib/finance/simulate";
import type {
  CandlePoint,
  ChartRange,
  InstrumentSeed,
  MarketCategory,
  MarketOverviewDTO,
  NewsDTO,
  QuoteDTO,
  QuoteSnapshot,
  QuoteSource,
  VideoDTO,
} from "@/lib/finance/types";

interface InstrumentRow {
  id: string;
  symbol: string;
  yahoo_symbol: string;
  name: string;
  name_tr: string;
  type: InstrumentSeed["type"];
  region: InstrumentSeed["region"];
  exchange: string;
  currency: string;
  sector: string;
  description: string;
  description_tr: string;
  market_cap: number | null;
  pe_ratio: number | null;
  dividend_yield: number | null;
  week52_high: number | null;
  week52_low: number | null;
  avg_volume: number | null;
  is_featured: number;
  is_active: number;
  sort_order: number;
}

interface QuoteRow {
  instrument_id: string;
  price: number;
  change_abs: number;
  change_pct: number;
  open: number | null;
  high: number | null;
  low: number | null;
  prev_close: number | null;
  volume: number | null;
  source: QuoteSource;
  updated_at: number;
}

interface NewsRow {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  body: string;
  author: string;
  image_url: string;
  source_url: string;
  ticker: string | null;
  breaking: number;
  is_published: number;
  is_featured: number;
  published_at: number;
}

interface VideoRow {
  id: string;
  title: string;
  channel: string;
  youtube_id: string;
  duration: string;
  category: string;
  is_published: number;
  is_featured: number;
  sort_order: number;
}

const LIVE_TTL_MS = 60_000;
let memorySeeded = false;
const memoryQuotes = new Map<string, QuoteRow>();
const memoryNews = [...NEWS_CATALOG];
const memoryVideos = [...VIDEO_CATALOG];
const memoryInstruments = [...INSTRUMENT_CATALOG];

function seedToQuote(seed: InstrumentSeed, quote = simulateQuote(seed), source: QuoteSource = quote.source): QuoteDTO {
  const candles = simulateCandles(seed, "1d");
  return {
    instrumentId: seed.id,
    symbol: seed.symbol,
    yahooSymbol: seed.yahooSymbol,
    name: seed.name,
    nameTr: seed.nameTr,
    type: seed.type,
    region: seed.region,
    exchange: seed.exchange,
    currency: seed.currency,
    sector: seed.sector,
    description: seed.description,
    descriptionTr: seed.descriptionTr,
    price: quote.price,
    changeAbs: quote.changeAbs,
    changePct: quote.changePct,
    open: quote.open,
    high: quote.high,
    low: quote.low,
    prevClose: quote.prevClose,
    volume: quote.volume,
    marketCap: seed.marketCap ?? null,
    peRatio: seed.peRatio ?? null,
    dividendYield: seed.dividendYield ?? null,
    week52High: seed.week52High ?? null,
    week52Low: seed.week52Low ?? null,
    avgVolume: seed.avgVolume ?? null,
    featured: Boolean(seed.featured),
    sparkline: sparklineFromCandles(candles),
    source,
    updatedAt: quote.updatedAt,
  };
}

function rowToSeed(row: InstrumentRow): InstrumentSeed {
  return {
    id: row.id,
    symbol: row.symbol,
    yahooSymbol: row.yahoo_symbol,
    name: row.name,
    nameTr: row.name_tr,
    type: row.type,
    region: row.region,
    exchange: row.exchange,
    currency: row.currency,
    sector: row.sector,
    description: row.description,
    descriptionTr: row.description_tr,
    basePrice: memoryQuotes.get(row.id)?.price ?? getInstrumentSeed(row.id)?.basePrice ?? 100,
    marketCap: row.market_cap ?? undefined,
    peRatio: row.pe_ratio ?? undefined,
    dividendYield: row.dividend_yield ?? undefined,
    week52High: row.week52_high ?? undefined,
    week52Low: row.week52_low ?? undefined,
    avgVolume: row.avg_volume ?? undefined,
    featured: row.is_featured === 1,
    sortOrder: row.sort_order,
  };
}

function newsRowToDto(row: NewsRow, related: string[] = []): NewsDTO {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    title: row.title,
    summary: row.summary,
    body: row.body,
    author: row.author,
    imageUrl: row.image_url,
    sourceUrl: row.source_url,
    ticker: row.ticker,
    breaking: row.breaking === 1,
    featured: row.is_featured === 1,
    published: row.is_published === 1,
    publishedAt: row.published_at,
    relatedSymbols: related,
  };
}

async function tableExists(db: D1Database, name: string): Promise<boolean> {
  const row = await db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`)
    .bind(name)
    .first<{ name: string }>();
  return Boolean(row?.name);
}

export async function ensureFinanceSeeded(db: D1Database): Promise<void> {
  if (!(await tableExists(db, "instruments"))) return;
  const existing = await db.prepare(`SELECT COUNT(*) AS n FROM instruments`).first<{ n: number }>();
  if ((existing?.n ?? 0) > 0) return;

  const now = Date.now();
  const statements: D1PreparedStatement[] = [];

  for (const item of INSTRUMENT_CATALOG) {
    statements.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO instruments (
            id, symbol, yahoo_symbol, name, name_tr, type, region, exchange, currency, sector,
            description, description_tr, market_cap, pe_ratio, dividend_yield, week52_high, week52_low,
            avg_volume, is_featured, is_active, sort_order, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        )
        .bind(
          item.id,
          item.symbol,
          item.yahooSymbol,
          item.name,
          item.nameTr,
          item.type,
          item.region,
          item.exchange,
          item.currency,
          item.sector,
          item.description,
          item.descriptionTr,
          item.marketCap ?? null,
          item.peRatio ?? null,
          item.dividendYield ?? null,
          item.week52High ?? null,
          item.week52Low ?? null,
          item.avgVolume ?? null,
          item.featured ? 1 : 0,
          item.sortOrder ?? 100,
          now,
          now,
        ),
    );
    const q = simulateQuote(item, now);
    statements.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO quotes (
            instrument_id, price, change_abs, change_pct, open, high, low, prev_close, volume, source, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(item.id, q.price, q.changeAbs, q.changePct, q.open, q.high, q.low, q.prevClose, q.volume, q.source, now),
    );
  }

  for (const news of NEWS_CATALOG) {
    statements.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO finance_news (
            id, slug, category, title, summary, body, author, image_url, source_url, ticker,
            breaking, is_published, is_featured, published_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          news.id,
          news.slug,
          news.category,
          news.title,
          news.summary,
          news.body,
          news.author,
          news.imageUrl,
          news.sourceUrl,
          news.ticker,
          news.breaking ? 1 : 0,
          news.published ? 1 : 0,
          news.featured ? 1 : 0,
          news.publishedAt,
          now,
          now,
        ),
    );
    for (const symbol of news.relatedSymbols) {
      statements.push(
        db.prepare(`INSERT OR IGNORE INTO finance_news_instruments (news_id, instrument_id) VALUES (?, ?)`).bind(news.id, symbol),
      );
    }
  }

  for (const video of VIDEO_CATALOG) {
    statements.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO finance_videos (
            id, title, channel, youtube_id, duration, category, is_published, is_featured, sort_order, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          video.id,
          video.title,
          video.channel,
          video.youtubeId,
          video.duration,
          video.category,
          video.published ? 1 : 0,
          video.featured ? 1 : 0,
          video.sortOrder,
          now,
          now,
        ),
    );
  }

  for (let i = 0; i < statements.length; i += 40) {
    await db.batch(statements.slice(i, i + 40));
  }
}

function ensureMemorySeeded() {
  if (memorySeeded) return;
  const now = Date.now();
  for (const item of INSTRUMENT_CATALOG) {
    const q = simulateQuote(item, now);
    memoryQuotes.set(item.id, {
      instrument_id: item.id,
      price: q.price,
      change_abs: q.changeAbs,
      change_pct: q.changePct,
      open: q.open,
      high: q.high,
      low: q.low,
      prev_close: q.prevClose,
      volume: q.volume,
      source: q.source,
      updated_at: now,
    });
  }
  memorySeeded = true;
}

async function tryDb<T>(fn: (db: D1Database) => Promise<T>): Promise<T | null> {
  try {
    const { getDb } = await import("@/lib/db");
    const db = getDb();
    await ensureFinanceSeeded(db);
    return await fn(db);
  } catch {
    return null;
  }
}

function quoteFromSeedAndRow(seed: InstrumentSeed, row?: QuoteRow | null): QuoteDTO {
  if (!row || Date.now() - row.updated_at >= LIVE_TTL_MS) return seedToQuote(seed);
  return seedToQuote(
    seed,
    {
      price: row.price,
      changeAbs: row.change_abs,
      changePct: row.change_pct,
      open: row.open ?? seed.basePrice,
      high: row.high ?? seed.basePrice,
      low: row.low ?? seed.basePrice,
      prevClose: row.prev_close ?? seed.basePrice,
      volume: row.volume ?? seed.avgVolume ?? 0,
      source: row.source,
      updatedAt: row.updated_at,
    },
    row.source,
  );
}

async function hydrateQuotes(seeds: InstrumentSeed[]): Promise<QuoteDTO[]> {
  ensureMemorySeeded();
  const fromDb = await tryDb(async (db) => {
    if (seeds.length === 0) return [] as QuoteDTO[];
    const placeholders = seeds.map(() => "?").join(",");
    const rows = await db
      .prepare(`SELECT * FROM quotes WHERE instrument_id IN (${placeholders})`)
      .bind(...seeds.map((s) => s.id))
      .all<QuoteRow>();
    const map = new Map(rows.results.map((row) => [row.instrument_id, row]));
    return seeds.map((seed) => quoteFromSeedAndRow(seed, map.get(seed.id)));
  });
  if (fromDb) return fromDb;
  return seeds.map((seed) => quoteFromSeedAndRow(seed, memoryQuotes.get(seed.id)));
}

export async function listQuotes(filter?: {
  type?: InstrumentSeed["type"];
  region?: InstrumentSeed["region"];
  category?: MarketCategory;
  featured?: boolean;
  ids?: string[];
}): Promise<QuoteDTO[]> {
  const fromDb = await tryDb(async (db) => {
    let sql = `SELECT * FROM instruments WHERE is_active = 1`;
    const binds: Array<string | number> = [];
    if (filter?.type) {
      sql += ` AND type = ?`;
      binds.push(filter.type);
    }
    if (filter?.region) {
      sql += ` AND region = ?`;
      binds.push(filter.region);
    }
    if (filter?.featured) sql += ` AND is_featured = 1`;
    if (filter?.ids?.length) {
      sql += ` AND id IN (${filter.ids.map(() => "?").join(",")})`;
      binds.push(...filter.ids);
    }
    sql += ` ORDER BY sort_order ASC, symbol ASC`;
    const rows = await db.prepare(sql).bind(...binds).all<InstrumentRow>();
    return rows.results.map(rowToSeed);
  });

  let seeds = fromDb ?? memoryInstruments.filter((item) => {
    if (filter?.type && item.type !== filter.type) return false;
    if (filter?.region && item.region !== filter.region) return false;
    if (filter?.featured && !item.featured) return false;
    if (filter?.ids?.length && !filter.ids.includes(item.id)) return false;
    return true;
  });

  if (filter?.category) seeds = applyCategory(seeds, filter.category);
  return hydrateQuotes(seeds);
}

function applyCategory(seeds: InstrumentSeed[], category: MarketCategory): InstrumentSeed[] {
  switch (category) {
    case "indexes":
      return seeds.filter((s) => s.type === "index");
    case "stocks":
      return seeds.filter((s) => s.type === "stock");
    case "bist":
      return seeds.filter((s) => s.region === "tr" && (s.type === "stock" || s.type === "index"));
    case "us":
      return seeds.filter((s) => s.region === "us");
    case "europe":
      return seeds.filter((s) => s.region === "eu");
    case "asia":
      return seeds.filter((s) => s.region === "asia");
    case "currencies":
      return seeds.filter((s) => s.type === "fx");
    case "crypto":
      return seeds.filter((s) => s.type === "crypto");
    case "commodities":
      return seeds.filter((s) => s.type === "commodity");
    case "etfs":
      return seeds.filter((s) => s.type === "etf");
    default:
      return seeds;
  }
}

export async function getQuote(symbol: string): Promise<QuoteDTO | null> {
  const seed =
    getInstrumentSeed(symbol) ??
    (await tryDb(async (db) => {
      const row = await db
        .prepare(`SELECT * FROM instruments WHERE id = ? OR symbol = ? COLLATE NOCASE LIMIT 1`)
        .bind(symbol.toUpperCase(), symbol)
        .first<InstrumentRow>();
      return row ? rowToSeed(row) : null;
    }));
  if (!seed) return null;

  const cached = await tryDb(async (db) => {
    return db.prepare(`SELECT * FROM quotes WHERE instrument_id = ?`).bind(seed.id).first<QuoteRow>();
  });
  const stale = !cached || Date.now() - cached.updated_at > LIVE_TTL_MS;

  if (stale) {
    const live = await fetchYahooChart(seed.yahooSymbol, "1d");
    if (live) {
      const last = live.candles[live.candles.length - 1];
      const quote = {
        price: live.price,
        changeAbs: live.price - live.prevClose,
        changePct: ((live.price - live.prevClose) / live.prevClose) * 100,
        open: live.candles[0]?.o ?? live.price,
        high: Math.max(...live.candles.map((c) => c.h), live.price),
        low: Math.min(...live.candles.map((c) => c.l), live.price),
        prevClose: live.prevClose,
        volume: last?.v ?? seed.avgVolume ?? 0,
        source: "live" as const,
        updatedAt: Date.now(),
      };
      await persistQuote(seed.id, quote);
      return seedToQuote(seed, quote, "live");
    }
  }

  return quoteFromSeedAndRow(seed, cached ?? memoryQuotes.get(seed.id));
}

async function persistQuote(instrumentId: string, quote: QuoteSnapshot) {
  memoryQuotes.set(instrumentId, {
    instrument_id: instrumentId,
    price: quote.price,
    change_abs: quote.changeAbs,
    change_pct: quote.changePct,
    open: quote.open,
    high: quote.high,
    low: quote.low,
    prev_close: quote.prevClose,
    volume: quote.volume,
    source: quote.source,
    updated_at: quote.updatedAt,
  });
  await tryDb(async (db) => {
    await db
      .prepare(
        `INSERT INTO quotes (instrument_id, price, change_abs, change_pct, open, high, low, prev_close, volume, source, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(instrument_id) DO UPDATE SET
           price = excluded.price, change_abs = excluded.change_abs, change_pct = excluded.change_pct,
           open = excluded.open, high = excluded.high, low = excluded.low, prev_close = excluded.prev_close,
           volume = excluded.volume, source = excluded.source, updated_at = excluded.updated_at`,
      )
      .bind(
        instrumentId,
        quote.price,
        quote.changeAbs,
        quote.changePct,
        quote.open,
        quote.high,
        quote.low,
        quote.prevClose,
        quote.volume,
        quote.source,
        quote.updatedAt,
      )
      .run();
  });
}

export async function getChart(symbol: string, range: ChartRange): Promise<{ quote: QuoteDTO; candles: CandlePoint[] } | null> {
  const quote = await getQuote(symbol);
  if (!quote) return null;
  const seed = getInstrumentSeed(quote.instrumentId);
  if (!seed) {
    return {
      quote,
      candles: simulateCandles(
        {
          id: quote.instrumentId,
          symbol: quote.symbol,
          yahooSymbol: quote.yahooSymbol,
          name: quote.name,
          nameTr: quote.nameTr,
          type: quote.type,
          region: quote.region,
          exchange: quote.exchange,
          currency: quote.currency,
          sector: quote.sector,
          description: quote.description,
          descriptionTr: quote.descriptionTr,
          basePrice: quote.price,
        },
        range,
      ),
    };
  }

  const live = await fetchYahooChart(seed.yahooSymbol, range);
  if (live?.candles.length) return { quote, candles: live.candles };
  return { quote, candles: simulateCandles(seed, range) };
}

export async function searchInstruments(query: string): Promise<QuoteDTO[]> {
  const seeds = searchCatalog(query, 16);
  const extra = await tryDb(async (db) => {
    const q = `%${query.trim().toLowerCase()}%`;
    const rows = await db
      .prepare(
        `SELECT * FROM instruments WHERE is_active = 1 AND (
          lower(symbol) LIKE ? OR lower(name) LIKE ? OR lower(name_tr) LIKE ? OR lower(id) LIKE ?
        ) LIMIT 16`,
      )
      .bind(q, q, q, q)
      .all<InstrumentRow>();
    return rows.results.map(rowToSeed);
  });
  const merged = new Map<string, InstrumentSeed>();
  for (const item of [...seeds, ...(extra ?? [])]) merged.set(item.id, item);
  return hydrateQuotes([...merged.values()].slice(0, 16));
}

export async function listNews(options?: { category?: string; ticker?: string; includeUnpublished?: boolean }): Promise<NewsDTO[]> {
  const fromDb = await tryDb(async (db) => {
    let sql = `SELECT * FROM finance_news`;
    const binds: string[] = [];
    const where: string[] = [];
    if (!options?.includeUnpublished) where.push(`is_published = 1`);
    if (options?.category) {
      where.push(`category = ?`);
      binds.push(options.category);
    }
    if (options?.ticker) {
      where.push(`ticker = ?`);
      binds.push(options.ticker);
    }
    if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
    sql += ` ORDER BY published_at DESC LIMIT 50`;
    const rows = await db.prepare(sql).bind(...binds).all<NewsRow>();
    const related = await db.prepare(`SELECT news_id, instrument_id FROM finance_news_instruments`).all<{
      news_id: string;
      instrument_id: string;
    }>();
    const map = new Map<string, string[]>();
    for (const row of related.results) {
      const list = map.get(row.news_id) ?? [];
      list.push(row.instrument_id);
      map.set(row.news_id, list);
    }
    return rows.results.map((row) => newsRowToDto(row, map.get(row.id) ?? []));
  });
  if (fromDb) return fromDb;
  return memoryNews.filter((item) => {
    if (!options?.includeUnpublished && !item.published) return false;
    if (options?.category && item.category !== options.category) return false;
    if (options?.ticker && item.ticker !== options.ticker && !item.relatedSymbols.includes(options.ticker)) return false;
    return true;
  });
}

export async function getNewsBySlug(slug: string): Promise<NewsDTO | null> {
  const all = await listNews({ includeUnpublished: true });
  return all.find((item) => item.slug === slug || item.id === slug) ?? null;
}

export async function listVideos(includeUnpublished = false): Promise<VideoDTO[]> {
  const fromDb = await tryDb(async (db) => {
    const sql = includeUnpublished
      ? `SELECT * FROM finance_videos ORDER BY sort_order ASC`
      : `SELECT * FROM finance_videos WHERE is_published = 1 ORDER BY sort_order ASC`;
    const rows = await db.prepare(sql).all<VideoRow>();
    return rows.results.map((row) => ({
      id: row.id,
      title: row.title,
      channel: row.channel,
      youtubeId: row.youtube_id,
      duration: row.duration,
      category: row.category,
      featured: row.is_featured === 1,
      published: row.is_published === 1,
      sortOrder: row.sort_order,
    }));
  });
  if (fromDb) return fromDb;
  return includeUnpublished ? memoryVideos : memoryVideos.filter((v) => v.published);
}

export async function getOverview(): Promise<MarketOverviewDTO> {
  const all = await listQuotes();
  const sortedByChange = [...all].sort((a, b) => b.changePct - a.changePct);
  const sortedByVolume = [...all].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
  const [news, videos] = await Promise.all([listNews(), listVideos()]);
  return {
    ticker: all.filter((q) => q.featured).slice(0, 8),
    featured: all.filter((q) => q.type === "index" || q.featured).slice(0, 8),
    gainers: sortedByChange.filter((q) => q.changePct > 0).slice(0, 6),
    losers: [...sortedByChange].reverse().filter((q) => q.changePct < 0).slice(0, 6),
    mostActive: sortedByVolume.slice(0, 6),
    news,
    videos,
  };
}

export async function upsertInstrument(input: InstrumentSeed & { active?: boolean }): Promise<void> {
  const now = Date.now();
  const idx = memoryInstruments.findIndex((i) => i.id === input.id);
  if (idx >= 0) memoryInstruments[idx] = input;
  else memoryInstruments.push(input);
  await tryDb(async (db) => {
    await db
      .prepare(
        `INSERT INTO instruments (
          id, symbol, yahoo_symbol, name, name_tr, type, region, exchange, currency, sector,
          description, description_tr, market_cap, pe_ratio, dividend_yield, week52_high, week52_low,
          avg_volume, is_featured, is_active, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          symbol = excluded.symbol, yahoo_symbol = excluded.yahoo_symbol, name = excluded.name,
          name_tr = excluded.name_tr, type = excluded.type, region = excluded.region, exchange = excluded.exchange,
          currency = excluded.currency, sector = excluded.sector, description = excluded.description,
          description_tr = excluded.description_tr, market_cap = excluded.market_cap, pe_ratio = excluded.pe_ratio,
          dividend_yield = excluded.dividend_yield, week52_high = excluded.week52_high, week52_low = excluded.week52_low,
          avg_volume = excluded.avg_volume, is_featured = excluded.is_featured, is_active = excluded.is_active,
          sort_order = excluded.sort_order, updated_at = excluded.updated_at`,
      )
      .bind(
        input.id,
        input.symbol,
        input.yahooSymbol,
        input.name,
        input.nameTr,
        input.type,
        input.region,
        input.exchange,
        input.currency,
        input.sector,
        input.description,
        input.descriptionTr,
        input.marketCap ?? null,
        input.peRatio ?? null,
        input.dividendYield ?? null,
        input.week52High ?? null,
        input.week52Low ?? null,
        input.avgVolume ?? null,
        input.featured ? 1 : 0,
        input.active === false ? 0 : 1,
        input.sortOrder ?? 100,
        now,
        now,
      )
      .run();
  });
}

export async function upsertNews(news: NewsDTO): Promise<void> {
  const idx = memoryNews.findIndex((item) => item.id === news.id);
  if (idx >= 0) memoryNews[idx] = news;
  else memoryNews.unshift(news);
  const now = Date.now();
  await tryDb(async (db) => {
    await db
      .prepare(
        `INSERT INTO finance_news (
          id, slug, category, title, summary, body, author, image_url, source_url, ticker,
          breaking, is_published, is_featured, published_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          slug = excluded.slug, category = excluded.category, title = excluded.title, summary = excluded.summary,
          body = excluded.body, author = excluded.author, image_url = excluded.image_url, source_url = excluded.source_url,
          ticker = excluded.ticker, breaking = excluded.breaking, is_published = excluded.is_published,
          is_featured = excluded.is_featured, published_at = excluded.published_at, updated_at = excluded.updated_at`,
      )
      .bind(
        news.id,
        news.slug,
        news.category,
        news.title,
        news.summary,
        news.body,
        news.author,
        news.imageUrl,
        news.sourceUrl,
        news.ticker,
        news.breaking ? 1 : 0,
        news.published ? 1 : 0,
        news.featured ? 1 : 0,
        news.publishedAt,
        now,
        now,
      )
      .run();
    await db.prepare(`DELETE FROM finance_news_instruments WHERE news_id = ?`).bind(news.id).run();
    for (const symbol of news.relatedSymbols) {
      await db
        .prepare(`INSERT OR IGNORE INTO finance_news_instruments (news_id, instrument_id) VALUES (?, ?)`)
        .bind(news.id, symbol)
        .run();
    }
  });
}

export async function deleteNews(id: string): Promise<void> {
  const idx = memoryNews.findIndex((item) => item.id === id);
  if (idx >= 0) memoryNews.splice(idx, 1);
  await tryDb(async (db) => {
    await db.prepare(`DELETE FROM finance_news WHERE id = ?`).bind(id).run();
  });
}

export async function upsertVideo(video: VideoDTO): Promise<void> {
  const idx = memoryVideos.findIndex((item) => item.id === video.id);
  if (idx >= 0) memoryVideos[idx] = video;
  else memoryVideos.push(video);
  const now = Date.now();
  await tryDb(async (db) => {
    await db
      .prepare(
        `INSERT INTO finance_videos (
          id, title, channel, youtube_id, duration, category, is_published, is_featured, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title, channel = excluded.channel, youtube_id = excluded.youtube_id,
          duration = excluded.duration, category = excluded.category, is_published = excluded.is_published,
          is_featured = excluded.is_featured, sort_order = excluded.sort_order, updated_at = excluded.updated_at`,
      )
      .bind(
        video.id,
        video.title,
        video.channel,
        video.youtubeId,
        video.duration,
        video.category,
        video.published ? 1 : 0,
        video.featured ? 1 : 0,
        video.sortOrder,
        now,
        now,
      )
      .run();
  });
}

export async function deleteVideo(id: string): Promise<void> {
  const idx = memoryVideos.findIndex((item) => item.id === id);
  if (idx >= 0) memoryVideos.splice(idx, 1);
  await tryDb(async (db) => {
    await db.prepare(`DELETE FROM finance_videos WHERE id = ?`).bind(id).run();
  });
}

export async function adminStats() {
  const [quotes, news, videos] = await Promise.all([listQuotes(), listNews({ includeUnpublished: true }), listVideos(true)]);
  return {
    instruments: quotes.length,
    publishedNews: news.filter((n) => n.published).length,
    draftNews: news.filter((n) => !n.published).length,
    videos: videos.length,
    featured: quotes.filter((q) => q.featured).length,
  };
}
