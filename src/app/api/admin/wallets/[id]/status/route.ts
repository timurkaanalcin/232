import { apiHandler, assertSameOrigin, badRequest, jsonOk, notFound, requirePermission } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { updateWalletStatusSchema } from "@/lib/validators";
import { updateWalletStatus } from "@/services/wallets";

export const POST = apiHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    await assertSameOrigin(request);
    const { user: actor, db, meta } = await requirePermission("wallets.manage");
    const { id } = await params;
    const parsed = updateWalletStatusSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid wallet status");

    let wallet;
    try {
      wallet = await updateWalletStatus(db, id, {
        status: parsed.data.status,
        memo: parsed.data.memo,
        actorId: actor.id,
      });
    } catch (error) {
      throw badRequest(error instanceof Error ? error.message : "Wallet status could not be updated");
    }
    if (!wallet) throw notFound("Wallet");

    await logAudit(db, {
      actorId: actor.id,
      actorEmail: actor.email,
      action: AUDIT_ACTIONS.ADMIN_WALLET_STATUS_CHANGED,
      targetType: "wallet",
      targetId: wallet.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
      metadata: {
        status: wallet.status,
        memo: parsed.data.memo,
      },
    });

    return jsonOk({ wallet });
  },
);
