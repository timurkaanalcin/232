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
import { createTradeOrder, getTradingWorkspace } from "@/services/trading";

export const GET = apiHandler(async (request: Request) => {
  const { db } = await requirePermission("trading.access");
  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId");
  return jsonOk({ workspace: await getTradingWorkspace(db, clientId) });
});

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user: actor, db, meta } = await requirePermission("trading.access");
  const permissions = await getPermissions(db, actor.role);
  if (!permissions.has("trading.order")) throw forbidden();

  const parsed = createTradeOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid order data");
  }

  try {
    const order = await createTradeOrder(db, {
      ...parsed.data,
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
      },
    });
    return jsonOk({ order }, { status: 201 });
  } catch (error) {
    throw badRequest(error instanceof Error ? error.message : "Order could not be created");
  }
});
