import {
  apiHandler,
  assertSameOrigin,
  badRequest,
  forbidden,
  getPermissions,
  jsonOk,
  requirePermission,
} from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { createTradeOrderSchema } from "@/lib/validators";
import { getBrokerConfig, submitBrokerOrder } from "@/services/broker";
import { createTradeOrder, getTradingWorkspace } from "@/services/trading";

export const GET = apiHandler(async (request: Request) => {
  const { db, env } = await requirePermission("trading.access");
  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId");
  const brokerConfig = getBrokerConfig(env);
  return jsonOk({
    workspace: await getTradingWorkspace(db, clientId, {
      configured: Boolean(brokerConfig),
      provider: brokerConfig ? new URL(brokerConfig.apiUrl).host : "Broker bağlanmadı",
      message: brokerConfig
        ? "Canlı broker API yapılandırıldı"
        : "Gerçek borsa emirleri için BROKER_API_URL ve BROKER_API_KEY gerekli",
    }),
  });
});

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user: actor, db, env, meta } = await requirePermission("trading.access");
  const permissions = await getPermissions(db, actor.role);
  if (!permissions.has("trading.order")) throw forbidden();

  const parsed = createTradeOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid order data");
  }

  try {
    const brokerConfig = getBrokerConfig(env);
    if (!brokerConfig) {
      throw new Error("Gerçek broker bağlantısı yapılandırılmadı. BROKER_API_URL ve BROKER_API_KEY ayarlanmalı.");
    }
    const brokerResult = await submitBrokerOrder(brokerConfig, parsed.data);
    const order = await createTradeOrder(db, {
      ...parsed.data,
      price: brokerResult.filledPrice,
      status: brokerResult.status,
      brokerOrderId: brokerResult.brokerOrderId,
      brokerMessage: brokerResult.message,
      actorId: actor.id,
      actorEmail: actor.email,
    });
    await logAudit(db, {
      actorId: actor.id,
      actorEmail: actor.email,
      action: "trading.order_created",
      targetType: "trade_order",
      targetId: order.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
      metadata: {
        clientId: order.clientId,
        clientNumericId: order.clientNumericId,
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: order.price,
        notional: order.notional,
        brokerOrderId: order.brokerOrderId,
        brokerMessage: order.brokerMessage,
      },
    });
    return jsonOk({ order }, { status: 201 });
  } catch (error) {
    throw badRequest(error instanceof Error ? error.message : "Order could not be created");
  }
});
