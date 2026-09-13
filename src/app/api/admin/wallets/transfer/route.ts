import { apiHandler, assertSameOrigin, badRequest, jsonOk, requirePermission } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { walletTransferSchema } from "@/lib/validators";
import { createWalletTransfer } from "@/services/wallets";

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user: actor, db, meta } = await requirePermission("wallets.manage");
  const parsed = walletTransferSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid transfer");

  let transfer;
  try {
    transfer = await createWalletTransfer(db, { ...parsed.data, actorId: actor.id });
  } catch (error) {
    throw badRequest(error instanceof Error ? error.message : "Wallet transfer could not be created");
  }

  await logAudit(db, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: AUDIT_ACTIONS.ADMIN_WALLET_TRANSFER_CREATED,
    targetType: "wallet_transfer",
    targetId: transfer.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: {
      fromWalletId: transfer.fromWalletId,
      toWalletId: transfer.toWalletId,
      amountMinor: transfer.amountMinor,
      currency: transfer.currency,
      memo: transfer.memo,
    },
  });

  return jsonOk({ transfer }, { status: 201 });
});
