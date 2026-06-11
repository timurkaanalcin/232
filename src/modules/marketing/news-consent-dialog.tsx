"use client";

import { useState } from "react";
import { MapPinIcon, ShieldCheckIcon, StopCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PENDING_SHARE_KEY = "livetrack_pending_news_share";

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
  requiresLogin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  busy: boolean;
  requiresLogin: boolean;
}) {
  const [accepted, setAccepted] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setAccepted(false);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Konum paylaşım izni</DialogTitle>
          <DialogDescription>
            Bölgenize özel içerik ve canlı hizmetler için konum bilginiz isteniyor. Devam etmeden önce
            lütfen aşağıdaki bilgileri okuyun.
          </DialogDescription>
        </DialogHeader>

        <ul className="grid gap-3 text-sm">
          <li className="flex gap-3 rounded-lg border p-3">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Ne paylaşılır?</p>
              <p className="text-muted-foreground">
                Yalnızca izin verdiğiniz süre boyunca GPS konumunuz, doğruluk ve zaman bilgisi.
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-lg border p-3">
            <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Kim görür?</p>
              <p className="text-muted-foreground">
                Yetkili operatör ve yöneticiler canlı haritada görür. Tüm erişimler kayıt altına alınır.
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-lg border p-3">
            <StopCircleIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Nasıl durdurulur?</p>
              <p className="text-muted-foreground">
                İstediğiniz an ekrandaki &quot;Paylaşımı Durdur&quot; ile veya tarayıcı iznini kapatarak.
              </p>
            </div>
          </li>
        </ul>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-primary/40 bg-accent/40 p-3">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 size-4 accent-[var(--color-primary)]"
          />
          <span className="text-sm">
            Konumumun <strong>açık rızamla</strong> paylaşılmasını kabul ediyorum. Tarayıcı konum izni
            isteyecektir; reddederseniz paylaşım başlamaz.
          </span>
        </label>

        {requiresLogin && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Canlı paylaşım için hesabınıza giriş yapmanız gerekiyor. Onay sonrası giriş sayfasına
            yönlendirileceksiniz.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
            Reddet
          </Button>
          <Button onClick={onConfirm} disabled={!accepted || busy}>
            {busy ? "Başlatılıyor…" : requiresLogin ? "Kabul et ve giriş yap" : "Kabul et ve başlat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
