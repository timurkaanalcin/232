"use client";

import { useState } from "react";
import { MapPinIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const PENDING_SHARE_KEY = "livetrack_pending_finance_share";

export function setPendingNewsShare() {
  sessionStorage.setItem(PENDING_SHARE_KEY, "1");
}

export function consumePendingNewsShare() {
  const v = sessionStorage.getItem(PENDING_SHARE_KEY);
  sessionStorage.removeItem(PENDING_SHARE_KEY);
  return v === "1";
}

/** Küçük köşe pop-up — tam ekran dialog değil */
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
  const [accepted, setAccepted] = useState(false);

  if (!open) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[min(100vw-2rem,280px)] rounded-lg border border-amber-500/50 bg-card p-3 shadow-xl"
      role="dialog"
      aria-label="Konum izni"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <MapPinIcon className="size-3.5" />
          Konum izni
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-muted-foreground hover:bg-muted"
          aria-label="Kapat"
        >
          <XIcon className="size-3.5" />
        </button>
      </div>

      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
        Bölgesel finans verileri için konum gerekli. Tarayıcı da ayrıca soracak.
      </p>

      <label className="mt-2 flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 size-3 accent-amber-600"
        />
        <span className="text-[11px] leading-tight">İzin veriyorum</span>
      </label>

      <div className="mt-2.5 flex gap-2">
        <Button variant="outline" size="sm" className="h-7 flex-1 text-xs" onClick={onClose} disabled={busy}>
          Hayır
        </Button>
        <Button
          size="sm"
          className="h-7 flex-1 bg-amber-600 text-xs text-white hover:bg-amber-700"
          disabled={!accepted || busy}
          onClick={onConfirm}
        >
          {busy ? "…" : "İzin ver"}
        </Button>
      </div>
    </div>
  );
}
