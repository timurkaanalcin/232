import { DEFAULT_WATCHLIST } from "@/lib/finance/catalog";
import { getQuote, listQuotes } from "@/services/finance";
import type { QuoteDTO } from "@/lib/finance/types";

const memoryWatchlists = new Map<string, string[]>();

async function tryDb<T>(fn: (db: D1Database) => Promise<T>): Promise<T | null> {
  try {
    const { getDb } = await import("@/lib/db");
    const db = getDb();
    return await fn(db);
  } catch {
    return null;
  }
}

async function ensureUserWatchlist(db: D1Database, userId: string): Promise<string> {
  const existing = await db.prepare(`SELECT id FROM watchlists WHERE user_id = ?`).bind(userId).first<{ id: string }>();
  if (existing?.id) return existing.id;
  const id = crypto.randomUUID();
  await db
    .prepare(`INSERT INTO watchlists (id, user_id, name, created_at) VALUES (?, ?, 'İzleme listem', ?)`)
    .bind(id, userId, Date.now())
    .run();
  for (const symbol of DEFAULT_WATCHLIST) {
    await db
      .prepare(`INSERT OR IGNORE INTO watchlist_items (watchlist_id, instrument_id, added_at) VALUES (?, ?, ?)`)
      .bind(id, symbol, Date.now())
      .run();
  }
  return id;
}

export async function getWatchlistQuotes(userId?: string | null, localSymbols?: string[]): Promise<QuoteDTO[]> {
  if (userId) {
    const ids = await tryDb(async (db) => {
      const watchlistId = await ensureUserWatchlist(db, userId);
      const rows = await db
        .prepare(`SELECT instrument_id FROM watchlist_items WHERE watchlist_id = ? ORDER BY added_at ASC`)
        .bind(watchlistId)
        .all<{ instrument_id: string }>();
      return rows.results.map((row) => row.instrument_id);
    });
    if (ids) return listQuotes({ ids });
    const mem = memoryWatchlists.get(userId) ?? DEFAULT_WATCHLIST;
    return listQuotes({ ids: mem });
  }
  return listQuotes({ ids: localSymbols?.length ? localSymbols : DEFAULT_WATCHLIST });
}

export async function addToWatchlist(userId: string, symbol: string): Promise<QuoteDTO[]> {
  const quote = await getQuote(symbol);
  if (!quote) return getWatchlistQuotes(userId);
  const saved = await tryDb(async (db) => {
    const watchlistId = await ensureUserWatchlist(db, userId);
    await db
      .prepare(`INSERT OR IGNORE INTO watchlist_items (watchlist_id, instrument_id, added_at) VALUES (?, ?, ?)`)
      .bind(watchlistId, quote.instrumentId, Date.now())
      .run();
    return true;
  });
  if (!saved) {
    const current = memoryWatchlists.get(userId) ?? [...DEFAULT_WATCHLIST];
    if (!current.includes(quote.instrumentId)) current.push(quote.instrumentId);
    memoryWatchlists.set(userId, current);
  }
  return getWatchlistQuotes(userId);
}

export async function removeFromWatchlist(userId: string, symbol: string): Promise<QuoteDTO[]> {
  const quote = await getQuote(symbol);
  const id = quote?.instrumentId ?? symbol.toUpperCase();
  await tryDb(async (db) => {
    const watchlistId = await ensureUserWatchlist(db, userId);
    await db
      .prepare(`DELETE FROM watchlist_items WHERE watchlist_id = ? AND instrument_id = ?`)
      .bind(watchlistId, id)
      .run();
    return true;
  });
  const current = memoryWatchlists.get(userId) ?? [...DEFAULT_WATCHLIST];
  memoryWatchlists.set(
    userId,
    current.filter((item) => item !== id),
  );
  return getWatchlistQuotes(userId);
}
