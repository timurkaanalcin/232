"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CircleStopIcon,
  GaugeIcon,
  LocateFixedIcon,
  NavigationIcon,
  RadioIcon,
  TimerIcon,
  WifiIcon,
  WifiOffIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocationSharing } from "@/hooks/use-location-sharing";
import { ConsentDialog } from "@/modules/location/consent-dialog";
import { apiGet } from "@/lib/client-api";
import { formatAccuracy, formatCoord, formatDateTime, formatDuration } from "@/lib/utils";
import type { LocationSessionDTO, Paginated } from "@/types";

const SelfMap = dynamic(() => import("@/modules/location/self-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

interface SessionsResponse {
  history: Paginated<LocationSessionDTO>;
  active: LocationSessionDTO | null;
}

export function DashboardModule() {
  const queryClient = useQueryClient();
  const sharing = useLocationSharing();
  const [consentOpen, setConsentOpen] = useState(false);
  const [, forceTick] = useState(0);
  const resumedRef = useRef(false);

  const sessionsQuery = useQuery({
    queryKey: ["location-sessions", 1],
    queryFn: () => apiGet<SessionsResponse>("/api/location/sessions?page=1&pageSize=5"),
  });

  // Resume an active session after a reload (consent is still in force).
  useEffect(() => {
    const active = sessionsQuery.data?.active;
    if (active && !resumedRef.current && sharing.state === "idle" && !sharing.error) {
      resumedRef.current = true;
      sharing.resume(active);
    }
  }, [sessionsQuery.data, sharing]);

  // Live duration ticker while sharing.
  useEffect(() => {
    if (sharing.state !== "sharing") return;
    const id = setInterval(() => forceTick((n) => n + 1), 1_000);
    return () => clearInterval(id);
  }, [sharing.state]);

  const refreshSessions = () => void queryClient.invalidateQueries({ queryKey: ["location-sessions"] });

  const handleStart = async (label: string) => {
    await sharing.start(label);
    setConsentOpen(false);
    refreshSessions();
  };

  const handleStop = async () => {
    await sharing.stop();
    toast.success("Konum paylaşımı durdu", {
      description: "Yayın kesildi ve oturum kapatıldı.",
    });
    refreshSessions();
  };

  const isSharing = sharing.state === "sharing";
  const busy = sharing.state === "starting" || sharing.state === "stopping";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-5">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div>
          <p className="hud-label mb-1">İstasyon</p>
          <h1 className="text-xl font-semibold tracking-tight">Konum komutası</h1>
        </div>
        {/* Sharing control card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Konum paylaşımı</CardTitle>
              {isSharing ? (
                <Badge variant="success">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  Canlı
                </Badge>
              ) : (
                <Badge variant="secondary">Kapalı</Badge>
              )}
            </div>
            <CardDescription>
              {isSharing
                ? "Canlı konumunuz yetkili operatörlere görünür."
                : "Açık bir oturum başlatmadan hiçbir şey paylaşılmaz."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {sharing.error && (
              <Alert variant="destructive">
                <AlertTitle>Paylaşım sorunu</AlertTitle>
                <AlertDescription>{sharing.error}</AlertDescription>
              </Alert>
            )}

            {isSharing && sharing.session ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Stat icon={TimerIcon} label="Süre" value={formatDuration(sharing.session.startedAt, null)} />
                  <Stat
                    icon={LocateFixedIcon}
                    label="Doğruluk"
                    value={formatAccuracy(sharing.position?.accuracy)}
                  />
                  <Stat
                    icon={NavigationIcon}
                    label="Koordinat"
                    value={
                      sharing.position
                        ? `${formatCoord(sharing.position.lat)}, ${formatCoord(sharing.position.lng)}`
                        : "Alınıyor…"
                    }
                  />
                  <Stat
                    icon={GaugeIcon}
                    label="Hız"
                    value={sharing.position?.speed != null ? `${(sharing.position.speed * 3.6).toFixed(0)} km/h` : "—"}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {sharing.connectionMode === "websocket" ? (
                    <>
                      <WifiIcon className="size-3.5 text-emerald-500" /> Gerçek zamanlı kanal bağlı
                    </>
                  ) : (
                    <>
                      <WifiOffIcon className="size-3.5 text-amber-500" /> Gerçek zamanlı kanal yok — güvenli
                      yedek kullanılıyor
                    </>
                  )}
                </div>
                <Button variant="destructive" size="lg" className="w-full" onClick={handleStop} disabled={busy}>
                  <CircleStopIcon /> Paylaşımı şimdi durdur
                </Button>
              </>
            ) : (
              <Button size="lg" className="w-full" onClick={() => setConsentOpen(true)} disabled={busy}>
                <RadioIcon /> {busy ? "İşleniyor…" : "Paylaşımı başlat"}
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Paylaşım açık izninizi ve tarayıcı konum iznini gerektirir. İlk açılışta reddettiyseniz burada
              oturum onayıyla tekrar açabilirsiniz. İstediğiniz an durdurabilirsiniz — yayın hem cihazda hem
              sunucuda hemen kesilir.
            </p>
          </CardContent>
        </Card>

        {/* Recent sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Son oturumlar</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/history">Tümü</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            {sessionsQuery.isLoading ? (
              <>
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </>
            ) : sessionsQuery.data && sessionsQuery.data.history.items.length > 0 ? (
              sessionsQuery.data.history.items.map((session) => (
                <Link
                  key={session.id}
                  href={`/history?session=${session.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-accent/50"
                >
                  <div>
                    <p className="font-medium">{session.label || "Konum oturumu"}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(session.startedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{session.pointsCount} nokta</span>
                    {session.status === "active" ? (
                      <Badge variant="success">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Bitti</Badge>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Henüz oturum yok. İlk kaydı oluşturmak için paylaşımı başlatın.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live map */}
      <Card className="min-h-[420px] overflow-hidden lg:col-span-3">
        <div className="h-full min-h-[420px]">
          {isSharing || sharing.position ? (
            <SelfMap position={sharing.position} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-accent">
                <LocateFixedIcon className="size-6 text-primary" />
              </div>
              <p className="font-medium">Haritanız gizli</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Harita yalnızca paylaşım oturumu başladığında açılır. O ana kadar konum verisi cihazınızdan
                çıkmaz.
              </p>
            </div>
          )}
        </div>
      </Card>

      <ConsentDialog
        open={consentOpen}
        onOpenChange={setConsentOpen}
        onConfirm={(label) => void handleStart(label)}
        busy={sharing.state === "starting"}
      />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TimerIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-1 truncate font-medium tabular-nums">{value}</p>
    </div>
  );
}
