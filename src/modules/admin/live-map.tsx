"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MapPinnedIcon, RadioIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLocationShell } from "@/components/layout/admin-location-shell";
import { useLiveMap, type LiveMapStatus } from "@/hooks/use-live-map";
import { SITE_URL } from "@/lib/site-config";
import { formatRelative } from "@/lib/utils";

const LiveMapCanvas = dynamic(() => import("@/modules/admin/live-map-canvas"), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
});

const STATUS_LABEL: Record<LiveMapStatus, string> = {
  connecting: "Bağlanıyor…",
  live: "Canlı",
  reconnecting: "Yeniden bağlanıyor…",
};

export function LiveMapModule() {
  const { sessions, status, snapshotLoading, refetchSnapshot } = useLiveMap(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const active = useMemo(() => {
    const withPos = sessions.filter((s) => s.lat != null && s.lng != null);
    if (selectedId) {
      const picked = withPos.find((s) => s.session.id === selectedId);
      if (picked) return picked;
    }
    return withPos[0] ?? sessions[0] ?? null;
  }, [sessions, selectedId]);

  const addressMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sessions) {
      if (s.session.lastAddress) map.set(s.session.id, s.session.lastAddress);
    }
    return map;
  }, [sessions]);

  useEffect(() => {
    if (!active && sessions.length > 0) {
      setSelectedId(sessions[0]!.session.id);
    }
  }, [active, sessions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchSnapshot();
    } finally {
      setRefreshing(false);
    }
  };

  const address = active?.session.lastAddress;
  const hasCoords = active?.lat != null && active?.lng != null;

  return (
    <AdminLocationShell onRefresh={() => void handleRefresh()} refreshing={refreshing}>
      <div className="absolute inset-0">
        <LiveMapCanvas
          sessions={sessions.filter((s) => s.lat != null && s.lng != null)}
          selectedId={active?.session.id ?? null}
          onSelect={setSelectedId}
          addresses={addressMap}
        />
      </div>

      {/* Üst durum */}
      <div className="pointer-events-none absolute left-3 top-3 z-[1000]">
        <Badge variant={status === "live" ? "success" : "warning"} className="pointer-events-auto shadow-md">
          <RadioIcon className="size-3" />
          {STATUS_LABEL[status]}
          {sessions.length > 0 && ` · ${sessions.length} kişi`}
        </Badge>
      </div>

      {/* Alt bilgi — sadece konum / adres */}
      <div className="absolute inset-x-0 bottom-0 z-[1000] border-t bg-background/95 p-4 shadow-lg backdrop-blur">
        {snapshotLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : active && hasCoords ? (
          <div>
            <p className="text-xs text-muted-foreground">
              {active.session.userName || active.session.userEmail || "Ziyaretçi"}
              {" · "}
              {formatRelative(active.lastUpdateAt)}
            </p>
            {address ? (
              <p className="mt-1 text-base font-medium leading-snug">{address}</p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Adres çözümleniyor…</p>
            )}
            {sessions.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {sessions.map((s) => (
                  <button
                    key={s.session.id}
                    type="button"
                    onClick={() => setSelectedId(s.session.id)}
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${
                      active.session.id === s.session.id
                        ? "border-amber-500 bg-amber-500/10 text-amber-700"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {s.session.userName || "Ziyaretçi"}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <MapPinnedIcon className="size-5 shrink-0" />
            <div className="text-sm">
              <p>Henüz konum yok.</p>
              <p className="text-xs">
                Ziyaretçi{" "}
                <a href={SITE_URL} className="text-amber-600 underline" target="_blank" rel="noreferrer">
                  {SITE_URL.replace("https://", "")}
                </a>{" "}
                sitesinde izin vermeli.
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLocationShell>
  );
}
