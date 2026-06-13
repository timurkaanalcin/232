import { apiHandler, assertSameOrigin, badRequest, jsonOk, notFound, requirePermission } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { reverseWalletTransferSchema } from "@/lib/validators";
import { reverseWalletTransfer } from "@/services/wallets";

export const POST = apiHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    await assertSameOrigin(request);
    const { user: actor, db, meta } = await requirePermission("wallets.manage");
    const { id } = await params;
    const parsed = reverseWalletTransferSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid reversal");

    let transfer;
    try {
      transfer = await reverseWalletTransfer(db, id, { actorId: actor.id, memo: parsed.data.memo });
    } catch (error) {
      throw badRequest(error instanceof Error ? error.message : "Wallet transfer could not be reversed");
    }
    if (!transfer) throw notFound("Wallet transfer");

    await logAudit(db, {
      actorId: actor.id,
      actorEmail: actor.email,
      action: AUDIT_ACTIONS.ADMIN_WALLET_TRANSFER_REVERSED,
      targetType: "wallet_transfer",
      targetId: transfer.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
      metadata: {
        fromWalletId: transfer.fromWalletId,
        toWalletId: transfer.toWalletId,
        amountMinor: transfer.amountMinor,
        currency: transfer.currency,
        memo: parsed.data.memo,
      },
    });

    return jsonOk({ transfer });
  },
);
