import type { TradeOrderType, TradeSide } from "@/types";

export interface BrokerConfig {
  apiUrl: string;
  apiKey: string;
  accountId?: string;
}

export interface BrokerOrderInput {
  clientId: string;
  symbol: string;
  market: string;
  side: TradeSide;
  orderType: TradeOrderType;
  quantity: number;
  price: number;
}

export interface BrokerOrderResult {
  brokerOrderId: string;
  status: "filled" | "rejected";
  filledPrice: number;
  message: string;
}

function envValue(env: unknown, key: string): string {
  const envRecord = env as Record<string, string | undefined> | undefined;
  return envRecord?.[key] ?? process.env[key] ?? "";
}

export function getBrokerConfig(env: unknown): BrokerConfig | null {
  const apiUrl = envValue(env, "BROKER_API_URL").replace(/\/+$/, "");
  const apiKey = envValue(env, "BROKER_API_KEY");
  const accountId = envValue(env, "BROKER_ACCOUNT_ID");
  if (!apiUrl || !apiKey) return null;
  return { apiUrl, apiKey, accountId: accountId || undefined };
}

export async function submitBrokerOrder(config: BrokerConfig, input: BrokerOrderInput): Promise<BrokerOrderResult> {
  const response = await fetch(`${config.apiUrl}/orders`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      accountId: config.accountId,
      clientId: input.clientId,
      symbol: input.symbol,
      market: input.market,
      side: input.side,
      type: input.orderType,
      quantity: input.quantity,
      limitPrice: input.orderType === "limit" ? input.price : undefined,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    return {
      brokerOrderId: String(payload.orderId ?? payload.id ?? ""),
      status: "rejected",
      filledPrice: input.price,
      message: String(payload.message ?? payload.error ?? `Broker rejected order with HTTP ${response.status}`),
    };
  }

  return {
    brokerOrderId: String(payload.orderId ?? payload.id ?? crypto.randomUUID()),
    status: String(payload.status ?? "filled").toLowerCase() === "rejected" ? "rejected" : "filled",
    filledPrice: Number(payload.filledPrice ?? payload.price ?? input.price),
    message: String(payload.message ?? "Broker order accepted"),
  };
}
