"use client";

import { useState } from "react";
import { EyeIcon, MapPinIcon, ShieldCheckIcon, TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { markLocationConsentAccepted } from "@/lib/first-launch-consent";

const CONSENT_POINTS = [
  {
    icon: MapPinIcon,
    title: "Ne toplanır",
    text: "Oturum açıkken GPS koordinatları, doğruluk, hız, yön ve zaman damgası. Oturum kapalıyken hiçbir konum kaydı tutulmaz.",
  },
  {
    icon: EyeIcon,
    title: "Kim görür",
    text: "Yetkili operatör ve yöneticiler canlı haritada görebilir. Her görüntüleme audit kaydına yazılır.",
  },
  {
    icon: TimerIcon,
    title: "Ne zaman durur",
    text: "Durdur’a bastığınız anda, çıkış yaptığınızda veya 5 dakika güncelleme gelmezse otomatik kapanır.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Haklarınız",
    text: "İstediğiniz an durdurabilir, verilerinizi dışa aktarabilir ve hesabınızı kalıcı silebilirsiniz (GDPR/KVKK).",
  },
];

export function ConsentDialog({
  open,
  onOpenChange,
  onConfirm,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (label: string) => void;
  busy: boolean;
}) {
  const [accepted, setAccepted] = useState(false);
  const [label, setLabel] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) setAccepted(false);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Canlı konum paylaş</DialogTitle>
          <DialogDescription>
            CanlıSite konumunuzu yalnızca açık izninizle paylaşır. Başlamadan önce paylaşımın ne anlama
            geldiğini gözden geçirin.
          </DialogDescription>
        </DialogHeader>

        <ul className="grid gap-3">
          {CONSENT_POINTS.map((point) => (
            <li key={point.title} className="flex gap-3 rounded-lg border p-3">
              <point.icon className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">{point.title}</p>
                <p className="text-sm text-muted-foreground">{point.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="grid gap-2">
          <Label htmlFor="session-label">Oturum etiketi (isteğe bağlı)</Label>
          <Input
            id="session-label"
            placeholder="ör. Saha ziyareti, teslimat"
            value={label}
            maxLength={80}
            onChange={(event) => setLabel(event.target.value)}
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-primary/40 bg-accent/40 p-3">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-0.5 size-4 accent-[var(--color-primary)]"
          />
          <span className="text-sm">
            Yukarıda anlatıldığı şekilde gerçek zamanlı konumumu paylaşmayı açıkça kabul ediyorum. İstediğim
            an <strong>Paylaşımı durdur</strong> veya Ayarlar’dan iptal edebileceğimi biliyorum.
          </span>
        </label>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
            Vazgeç
          </Button>
          <Button
            onClick={() => {
              markLocationConsentAccepted();
              onConfirm(label);
            }}
            disabled={!accepted || busy}
          >
            {busy ? "Başlatılıyor…" : "Paylaşımı başlat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
