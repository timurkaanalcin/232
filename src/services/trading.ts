import type {
  TradeOrderType,
  TradeSide,
  TradingClientDTO,
  TradingOrderDTO,
  TradingPositionDTO,
  TradingSymbolDTO,
  TradingWorkspaceDTO,
} from "@/types";

export const TRADING_SYMBOLS: TradingSymbolDTO[] = [
  { symbol: "TCELL", name: "Turkcell", market: "BIST", price: 107.5, change: 3.14 },
  { symbol: "AAPL", name: "Apple", market: "US", price: 227.73, change: 0.84 },
  { symbol: "TSLA", name: "Tesla", market: "US", price: 183.92, change: -1.18 },
  { symbol: "NVDA", name: "NVIDIA", market: "US", price: 121.44, change: 2.08 },
  { symbol: "US500", name: "S&P 500 CFD", market: "CFD", price: 7432.18, change: -0.07 },
  { symbol: "EURUSD", name: "Euro / US Dollar", market: "FX", price: 1.0824, change: 0.12 },
  { symbol: "XAUUSD", name: "Gold Spot", market: "FX", price: 2338.6, change: 0.42 },
  { symbol: "BTCUSD", name: "Bitcoin", market: "CRYPTO", price: 67420, change: 1.76 },
];

const symbolPrice = new Map(TRADING_SYMBOLS.map((symbol) => [symbol.symbol, symbol.price]));

interface CreateTradeOrderInput {
  clientId: string;
  actorId: string;
  actorEmail: string;
  symbol: string;
  market: string;
  side: TradeSide;
  orderType: TradeOrderType;
  quantity: number;
  price: number;
}

interface TradeOrderRow {
  id: string;
  client_id: string;
  client_name: string;
  client_numeric_id: string;
  actor_email: string;
  symbol: string;
  market: string;
  side: TradeSide;
  order_type: TradeOrderType;
  quantity: number;
  price: number;
  status: "filled" | "rejected";
  notional: number;
  pnl: number;
  created_at: number;
}

interface PositionRow {
  client_id: string;
  client_name: string;
  client_numeric_id: string;
  symbol: string;
  quantity: number;
  buy_notional: number;
  buy_quantity: number;
}

function toOrderDTO(row: TradeOrderRow): TradingOrderDTO {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    clientNumericId: row.client_numeric_id,
    actorEmail: row.actor_email,
    symbol: row.symbol,
    market: row.market,
    side: row.side,
    orderType: row.order_type,
    quantity: row.quantity,
    price: row.price,
    status: row.status,
    notional: row.notional,
    pnl: row.pnl,
    createdAt: row.created_at,
  };
}

function toPositionDTO(row: PositionRow): TradingPositionDTO {
  const quantity = row.quantity;
  const averagePrice = row.buy_quantity > 0 ? row.buy_notional / row.buy_quantity : 0;
  const currentPrice = symbolPrice.get(row.symbol) ?? averagePrice;
  const marketValue = quantity * currentPrice;
  const unrealizedPnl = quantity * (currentPrice - averagePrice);
  return {
    clientId: row.client_id,
    clientName: row.client_name,
    clientNumericId: row.client_numeric_id,
    symbol: row.symbol,
    quantity,
    averagePrice,
    currentPrice,
    marketValue,
    unrealizedPnl,
  };
}

export async function getTradingClients(db: D1Database): Promise<TradingClientDTO[]> {
  const rows = await db
    .prepare(
      `SELECT u.id, u.client_numeric_id, u.name, u.email, u.phone, u.ad_source, u.sale_status,
              u.retention_status, m.name AS manager_name
       FROM users u
       LEFT JOIN users m ON m.id = u.manager_id
       WHERE u.role_id = 'user'
       ORDER BY u.created_at DESC
       LIMIT 200`,
    )
    .all<{
      id: string;
      client_numeric_id: string;
      name: string;
      email: string;
      phone: string;
      ad_source: string;
      sale_status: TradingClientDTO["saleStatus"];
      retention_status: TradingClientDTO["retentionStatus"];
      manager_name: string | null;
    }>();

  return rows.results.map((row) => ({
    id: row.id,
    clientNumericId: row.client_numeric_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    adSource: row.ad_source,
    saleStatus: row.sale_status,
    retentionStatus: row.retention_status,
    managerName: row.manager_name,
  }));
}

export async function createTradeOrder(db: D1Database, input: CreateTradeOrderInput): Promise<TradingOrderDTO> {
  const client = await db
    .prepare(`SELECT id, role_id FROM users WHERE id = ?`)
    .bind(input.clientId)
    .first<{ id: string; role_id: string }>();
  if (!client || client.role_id !== "user") {
    throw new Error("Client account not found");
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  const notional = input.quantity * input.price;
  const referencePrice = symbolPrice.get(input.symbol) ?? input.price;
  const pnl = input.side === "buy" ? (referencePrice - input.price) * input.quantity : 0;

  await db
    .prepare(
      `INSERT INTO crm_trade_orders (
         id, client_id, actor_id, actor_email, symbol, market, side, order_type,
         quantity, price, status, notional, pnl, created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'filled', ?, ?, ?)`,
    )
    .bind(
      id,
      input.clientId,
      input.actorId,
      input.actorEmail,
      input.symbol,
      input.market,
      input.side,
      input.orderType,
      input.quantity,
      input.price,
      notional,
      pnl,
      now,
    )
    .run();

  if (input.side === "buy") {
    await db
      .prepare(
        `UPDATE users
         SET sale_status = 'depositor',
             retention_status = 'active',
             updated_at = ?
         WHERE id = ?`,
      )
      .bind(now, input.clientId)
      .run();
  }

  const order = await getTradeOrderById(db, id);
  if (!order) throw new Error("Failed to create order");
  return order;
}

export async function getTradeOrderById(db: D1Database, id: string): Promise<TradingOrderDTO | null> {
  const row = await db
    .prepare(
      `SELECT o.*, u.name AS client_name, u.client_numeric_id
       FROM crm_trade_orders o
       JOIN users u ON u.id = o.client_id
       WHERE o.id = ?`,
    )
    .bind(id)
    .first<TradeOrderRow>();
  return row ? toOrderDTO(row) : null;
}

export async function getTradingWorkspace(db: D1Database, clientId?: string | null): Promise<TradingWorkspaceDTO> {
  const clients = await getTradingClients(db);
  const selectedClientId = clientId || clients[0]?.id || null;
  const clientWhere = selectedClientId ? "WHERE o.client_id = ?" : "";
  const clientBinds = selectedClientId ? [selectedClientId] : [];

  const [ordersResult, positionsResult] = await Promise.all([
    db
      .prepare(
        `SELECT o.*, u.name AS client_name, u.client_numeric_id
         FROM crm_trade_orders o
         JOIN users u ON u.id = o.client_id
         ${clientWhere}
         ORDER BY o.created_at DESC
         LIMIT 50`,
      )
      .bind(...clientBinds)
      .all<TradeOrderRow>(),
    db
      .prepare(
        `SELECT o.client_id, u.name AS client_name, u.client_numeric_id, o.symbol,
                SUM(CASE WHEN o.side = 'buy' THEN o.quantity ELSE -o.quantity END) AS quantity,
                SUM(CASE WHEN o.side = 'buy' THEN o.notional ELSE 0 END) AS buy_notional,
                SUM(CASE WHEN o.side = 'buy' THEN o.quantity ELSE 0 END) AS buy_quantity
         FROM crm_trade_orders o
         JOIN users u ON u.id = o.client_id
         ${clientWhere}
         GROUP BY o.client_id, u.name, u.client_numeric_id, o.symbol
         HAVING ABS(quantity) > 0.000001
         ORDER BY o.symbol ASC`,
      )
      .bind(...clientBinds)
      .all<PositionRow>(),
  ]);

  const orders = ordersResult.results.map(toOrderDTO);
  const positions = positionsResult.results.map(toPositionDTO);
  const usedMargin = positions.reduce((sum, position) => sum + position.marketValue * 0.1, 0);
  const dailyPnl = orders.reduce((sum, order) => sum + order.pnl, 0) + positions.reduce((sum, position) => sum + position.unrealizedPnl, 0);
  const equity = 10_000 + dailyPnl;

  return {
    clients,
    symbols: TRADING_SYMBOLS,
    orders,
    positions,
    summary: {
      equity,
      availableMargin: Math.max(0, equity - usedMargin),
      usedMargin,
      openPositions: positions.length,
      dailyPnl,
    },
  };
}
