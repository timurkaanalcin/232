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
    toast.success("Location sharing stopped", {
      description: "Transmission ended and the session was closed.",
    });
    refreshSessions();
  };

  const isSharing = sharing.state === "sharing";
  const busy = sharing.state === "starting" || sharing.state === "stopping";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-5">
      <div className="flex flex-col gap-4 lg:col-span-2">
        {/* Sharing control card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Location sharing</CardTitle>
              {isSharing ? (
                <Badge variant="success">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </Badge>
              ) : (
                <Badge variant="secondary">Off</Badge>
              )}
            </div>
            <CardDescription>
              {isSharing
                ? "Your live position is visible to authorized staff."
                : "Nothing is shared until you explicitly start a session."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {sharing.error && (
              <Alert variant="destructive">
                <AlertTitle>Sharing issue</AlertTitle>
                <AlertDescription>{sharing.error}</AlertDescription>
              </Alert>
            )}

            {isSharing && sharing.session ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Stat icon={TimerIcon} label="Duration" value={formatDuration(sharing.session.startedAt, null)} />
                  <Stat
                    icon={LocateFixedIcon}
                    label="Accuracy"
                    value={formatAccuracy(sharing.position?.accuracy)}
                  />
                  <Stat
                    icon={NavigationIcon}
                    label="Coordinates"
                    value={
                      sharing.position
                        ? `${formatCoord(sharing.position.lat)}, ${formatCoord(sharing.position.lng)}`
                        : "Acquiring…"
                    }
                  />
                  <Stat
                    icon={GaugeIcon}
                    label="Speed"
                    value={sharing.position?.speed != null ? `${(sharing.position.speed * 3.6).toFixed(0)} km/h` : "—"}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {sharing.connectionMode === "websocket" ? (
                    <>
                      <WifiIcon className="size-3.5 text-emerald-500" /> Realtime channel connected
                    </>
                  ) : (
                    <>
                      <WifiOffIcon className="size-3.5 text-amber-500" /> Realtime unavailable — using secure
                      fallback
                    </>
                  )}
                </div>
                <Button variant="destructive" size="lg" className="w-full" onClick={handleStop} disabled={busy}>
                  <CircleStopIcon /> Stop sharing now
                </Button>
              </>
            ) : (
              <Button size="lg" className="w-full" onClick={() => setConsentOpen(true)} disabled={busy}>
                <RadioIcon /> {busy ? "Working…" : "Start sharing"}
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Sharing requires your explicit consent and your browser&apos;s location permission. You can stop
              at any moment — transmission halts immediately, server-side too.
            </p>
          </CardContent>
        </Card>

        {/* Recent sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent sessions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/history">View all</Link>
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
                    <p className="font-medium">{session.label || "Location session"}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(session.startedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{session.pointsCount} pts</span>
                    {session.status === "active" ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Ended</Badge>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No sessions yet. Start sharing to create your first one.
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
              <p className="font-medium">Your map is private</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                The map activates when you start a sharing session. Until then no location data leaves your
                device.
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
