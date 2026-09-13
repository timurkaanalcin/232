"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BellIcon, MapPinIcon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiPatch } from "@/lib/client-api";
import {
  emptyFirstLaunchChoices,
  hasCompletedFirstLaunchConsent,
  writeFirstLaunchConsent,
  type FirstLaunchChoices,
} from "@/lib/first-launch-consent";
import { requestAcceptedRuntimePermissions } from "@/lib/runtime-permissions";

async function syncNotificationPreferences(notifications: boolean) {
  try {
    await apiPatch("/api/privacy/preferences", {
      notifySession: notifications,
      notifySecurity: notifications,
      notifyConsent: notifications,
      marketingOptIn: false,
    });
  } catch {
    /* logged-out / guest — localStorage is the source of truth */
  }
}

export function FirstLaunchConsentGate() {
  const [needed, setNeeded] = useState(false);
  const [choices, setChoices] = useState<FirstLaunchChoices>(emptyFirstLaunchChoices);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setNeeded(!hasCompletedFirstLaunchConsent());
  }, []);

  const persist = async (next: FirstLaunchChoices) => {
    setBusy(true);
    writeFirstLaunchConsent(next);
    setNeeded(false);
    void syncNotificationPreferences(next.notifications);
    void requestAcceptedRuntimePermissions(next);
  };

  if (!needed) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-launch-title"
      aria-describedby="first-launch-desc"
    >
      <div className="max-h-[min(100dvh,40rem)] w-full max-w-lg overflow-y-auto rounded-xl border bg-card p-6 shadow-2xl">
        <p className="hud-label mb-2">İlk açılış</p>
        <h2 id="first-launch-title" className="text-xl font-semibold tracking-tight">
          İzinler — gizli değil
        </h2>
        <p id="first-launch-desc" className="mt-2 text-sm text-muted-foreground">
          Uygulamaya ilk girerken hangi izinlerin isteneceğini burada listeliyoruz. Her madde kapalı başlar;
          tek tek açabilir veya hepsini kapalı bırakıp devam edebilirsiniz. Pazarlama kapalı kalır.
        </p>

        <ul className="mt-5 grid gap-3">
          <li className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Konum (LiveTrack / CanlıSite)</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Canlı konum paylaşımı için cihaz konumu. Kabul ederseniz tarayıcı veya Android konum izni
                    sorulur. Paylaşım oturumu ayrıca başlatılmadan konum sunucuya gitmez.
                  </p>
                </div>
              </div>
              <Switch
                checked={choices.location}
                onCheckedChange={(location) => setChoices((current) => ({ ...current, location }))}
                aria-label="Konum iznini kabul et"
                disabled={busy}
              />
            </div>
          </li>
          <li className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <BellIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Bildirimler</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Oturum ve güvenlik uyarıları. Kabul ederseniz sistem bildirimi (Android 13+) istenebilir.
                    Pazarlama iletileri bu ekrandan açılmaz.
                  </p>
                </div>
              </div>
              <Switch
                checked={choices.notifications}
                onCheckedChange={(notifications) => setChoices((current) => ({ ...current, notifications }))}
                aria-label="Bildirim iznini kabul et"
                disabled={busy}
              />
            </div>
          </li>
        </ul>

        <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0" />
          <span>
            İstediğiniz an Ayarlar’dan kapatabilir, cihazınızın sistem ayarlarından da geri alabilirsiniz. Ekran
            kaydı, tuş kaydı, kamera veya mikrofon istenmez.
          </span>
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void persist({ location: false, notifications: false })}
          >
            İkisini de reddet
          </Button>
          <Button type="button" disabled={busy} onClick={() => void persist(choices)}>
            {busy ? "Kaydediliyor…" : "Seçtiklerimle devam et"}
          </Button>
        </div>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Ayrıntılar Ayarlar → Gizlilik ve /gizlilik sayfasında.
        </p>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
