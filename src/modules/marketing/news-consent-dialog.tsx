"use client";

import { useState } from "react";
import { BarChart3Icon, MapPinIcon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PENDING_SHARE_KEY = "livetrack_pending_finance_share";

export function setPendingNewsShare() {
  sessionStorage.setItem(PENDING_SHARE_KEY, "1");
}

export function consumePendingNewsShare() {
  const v = sessionStorage.getItem(PENDING_SHARE_KEY);
  sessionStorage.removeItem(PENDING_SHARE_KEY);
  return v === "1";
}

export function NewsConsentDialog({
  open,
  onOpenChange,
  onConfirm,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  const [accepted, setAccepted] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setAccepted(false);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden border-amber-500/30 p-0 sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-5 text-white">
          <div className="flex items-center gap-2 text-amber-400">
            <BarChart3Icon className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-widest">Finans Terminali</span>
          </div>
          <DialogHeader className="mt-3 space-y-2 text-left">
            <DialogTitle className="text-xl text-white">Bölgesel piyasa verileri</DialogTitle>
            <DialogDescription className="text-slate-300">
              Size en yakın borsa, döviz ve altın verilerini gösterebilmek için konum izninize ihtiyacımız
              var.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <ul className="grid gap-2 text-sm">
            <li className="flex gap-2 rounded-lg border bg-muted/40 p-3">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <span className="text-muted-foreground">
                Konum yalnızca izin verdiğiniz sürece paylaşılır; tarayıcı da ayrıca soracaktır.
              </span>
            </li>
            <li className="flex gap-2 rounded-lg border bg-muted/40 p-3">
              <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <span className="text-muted-foreground">
                Yetkili yöneticiler canlı haritada görür. İstediğiniz an durdurabilirsiniz.
              </span>
            </li>
          </ul>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 size-4 accent-amber-600"
            />
            <span className="text-sm">
              <strong>Konum paylaşımına açık rızamla</strong> izin veriyorum ve tarayıcı konum isteğini
              kabul edeceğim.
            </span>
          </label>
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={busy} className="flex-1">
            Hayır
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!accepted || busy}
            className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
          >
            {busy ? "Başlatılıyor…" : "Evet, izin ver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
