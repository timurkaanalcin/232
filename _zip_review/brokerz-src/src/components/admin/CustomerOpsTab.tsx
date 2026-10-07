import { useMemo, useState } from "react";
import {
  adminResolveWithdraw,
  adminSetKycStatus,
  closeSupportTicket,
  listAllKyc,
  listPendingWithdrawals,
  listSupportTickets,
  replySupportTicket,
  setAccountFrozen,
  listAllCustomers,
} from "@/lib/adminOps";

export default function CustomerOpsTab() {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  useMemo(() => tick, [tick]);

  const kyc = listAllKyc().filter((k) => k.status === "pending" || k.status === "draft");
  const withdraws = listPendingWithdrawals();
  const tickets = listSupportTickets().filter((t) => t.status !== "closed");
  const customers = listAllCustomers();
  const [reply, setReply] = useState<Record<string, string>>({});

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-lg font-bold text-white">KYC onay / red</h3>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-white/50">
              <tr>
                <th className="px-3 py-2">Müşteri</th>
                <th className="px-3 py-2">TCKN</th>
                <th className="px-3 py-2">Durum</th>
                <th className="px-3 py-2">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {kyc.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-white/40">
                    Bekleyen KYC yok
                  </td>
                </tr>
              )}
              {kyc.map((k) => (
                <tr key={k.customerId} className="border-t border-white/5">
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{k.name || k.fullName}</div>
                    <div className="text-xs text-white/40">{k.email}</div>
                  </td>
                  <td className="px-3 py-2 font-mono text-white/80">{k.nationalId || "—"}</td>
                  <td className="px-3 py-2 text-amber-300">{k.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold"
                        onClick={() => {
                          adminSetKycStatus(k.customerId, "approved");
                          refresh();
                        }}
                      >
                        Onayla
                      </button>
                      <button
                        type="button"
                        className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold"
                        onClick={() => {
                          adminSetKycStatus(k.customerId, "rejected");
                          refresh();
                        }}
                      >
                        Reddet
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold text-white">Çekim onayları</h3>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-white/50">
              <tr>
                <th className="px-3 py-2">Tutar</th>
                <th className="px-3 py-2">Not</th>
                <th className="px-3 py-2">Tarih</th>
                <th className="px-3 py-2">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {withdraws.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-white/40">
                    Bekleyen çekim yok
                  </td>
                </tr>
              )}
              {withdraws.map((w) => (
                <tr key={w.id} className="border-t border-white/5">
                  <td className="px-3 py-2 font-mono text-white">${w.amount.toFixed(2)}</td>
                  <td className="px-3 py-2 text-white/60">{w.note || w.method}</td>
                  <td className="px-3 py-2 text-white/50">{new Date(w.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold"
                        onClick={() => {
                          adminResolveWithdraw(w.id, "completed");
                          refresh();
                        }}
                      >
                        Onayla
                      </button>
                      <button
                        type="button"
                        className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold"
                        onClick={() => {
                          adminResolveWithdraw(w.id, "rejected");
                          refresh();
                        }}
                      >
                        Reddet / iade
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold text-white">Destek talepleri (insan agent)</h3>
        <div className="space-y-3">
          {tickets.length === 0 && <div className="text-sm text-white/40">Açık ticket yok</div>}
          {tickets.map((t) => (
            <div key={t.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-white">{t.subject}</div>
                  <div className="text-xs text-white/45">
                    {t.name || t.email || t.customerId} · {t.status}
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded bg-white/10 px-2 py-1 text-xs"
                  onClick={() => {
                    closeSupportTicket(t.id);
                    refresh();
                  }}
                >
                  Kapat
                </button>
              </div>
              <div className="mt-3 max-h-40 space-y-1 overflow-y-auto text-xs text-white/70">
                {t.messages.map((m, i) => (
                  <div key={i}>
                    <span className="font-semibold text-white/90">{m.role}:</span> {m.text}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={reply[t.id] || ""}
                  onChange={(e) => setReply((r) => ({ ...r, [t.id]: e.target.value }))}
                  placeholder="Agent yanıtı…"
                  className="min-w-0 flex-1 rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                />
                <button
                  type="button"
                  className="rounded bg-[#E60000] px-3 text-sm font-semibold"
                  onClick={() => {
                    const text = reply[t.id]?.trim();
                    if (!text) return;
                    replySupportTicket(t.id, text, "agent");
                    setReply((r) => ({ ...r, [t.id]: "" }));
                    refresh();
                  }}
                >
                  Gönder
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold text-white">Hesap dondur / aç</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {customers.slice(0, 24).map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">{c.name || c.email}</div>
                <div className="text-[11px] text-white/40">${c.balance.toFixed(2)}</div>
              </div>
              <button
                type="button"
                className={`rounded px-2 py-1 text-[11px] font-semibold ${c.frozen ? "bg-emerald-600" : "bg-amber-600"}`}
                onClick={() => {
                  setAccountFrozen(c.id, !c.frozen);
                  refresh();
                }}
              >
                {c.frozen ? "Aç" : "Dondur"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
