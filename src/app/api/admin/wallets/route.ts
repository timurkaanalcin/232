import { apiHandler, assertSameOrigin, badRequest, jsonOk, requirePermission } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { createWalletSchema, walletQuerySchema } from "@/lib/validators";
import { createWallet, listWallets } from "@/services/wallets";

export const GET = apiHandler(async (request: Request) => {
  const { db } = await requirePermission("wallets.view");
  const url = new URL(request.url);
  const parsed = walletQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    userId: url.searchParams.get("userId") ?? undefined,
    type: url.searchParams.get("type") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    currency: url.searchParams.get("currency") ?? undefined,
  });

  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid wallet query");
  return jsonOk(await listWallets(db, parsed.data));
});

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user: actor, db, meta } = await requirePermission("wallets.manage");
  const parsed = createWalletSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid wallet");

  let wallet;
  try {
    wallet = await createWallet(db, { ...parsed.data, actorId: actor.id });
  } catch (error) {
    throw badRequest(error instanceof Error ? error.message : "Wallet could not be created");
  }

  await logAudit(db, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: AUDIT_ACTIONS.ADMIN_WALLET_CREATED,
    targetType: "wallet",
    targetId: wallet.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: {
      userId: wallet.userId,
      walletType: wallet.walletType,
      currency: wallet.currency,
    },
  });

  return jsonOk({ wallet }, { status: 201 });
});
