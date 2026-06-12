"use client";

import { MapPinIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Küçük köşe pop-up — tarayıcı konum izni bu tıklamayla tetiklenir */
export function NewsConsentDialog({
  open,
  onClose,
  onConfirm,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[min(100vw-2rem,300px)] rounded-xl border border-amber-500/60 bg-card p-4 shadow-2xl"
      role="dialog"
      aria-label="Konum izni"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
          <MapPinIcon className="size-4" />
          Konum izni gerekli
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-muted-foreground hover:bg-muted"
          aria-label="Kapat"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Devam etmek için aşağıdaki butona basın. Tarayıcınız konum izni soracak —{" "}
        <strong className="text-foreground">İzin ver</strong> seçin.
      </p>

      <Button
        type="button"
        size="sm"
        className="mt-3 h-9 w-full bg-amber-600 text-sm text-white hover:bg-amber-700"
        disabled={busy}
        onClick={onConfirm}
      >
        {busy ? "Konum alınıyor…" : "Konum izni ver"}
      </Button>

      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        iPhone: Ayarlar → Safari → Konum Servisleri açık olmalı
      </p>
    </div>
  );
}
