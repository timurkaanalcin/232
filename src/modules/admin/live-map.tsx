"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ExpandIcon, MapPinnedIcon, RadioIcon, SearchIcon, ShrinkIcon, UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveMap, type LiveMapStatus } from "@/hooks/use-live-map";
import { cn, formatAccuracy, formatDuration, formatRelative } from "@/lib/utils";

const LiveMapCanvas = dynamic(() => import("@/modules/admin/live-map-canvas"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

const STATUS_LABEL: Record<LiveMapStatus, { label: string; tone: "success" | "warning" }> = {
  connecting: { label: "Connecting…", tone: "warning" },
  live: { label: "Live", tone: "success" },
  reconnecting: { label: "Reconnecting…", tone: "warning" },
};

export function LiveMapModule() {
  const { sessions, status, snapshotLoading } = useLiveMap(true);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    const el = mapContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? sessions.filter(
          (entry) =>
            entry.session.userName?.toLowerCase().includes(q) ||
            entry.session.userEmail?.toLowerCase().includes(q) ||
            entry.session.label.toLowerCase().includes(q),
        )
      : sessions;
    return [...list].sort((a, b) => (b.lastUpdateAt ?? 0) - (a.lastUpdateAt ?? 0));
  }, [sessions, query]);

  const selected = filtered.find((entry) => entry.session.id === selectedId) ?? null;
  const statusMeta = STATUS_LABEL[status];

  return (
    <div className="mx-auto flex h-[calc(100dvh-7rem)] w-full max-w-6xl flex-col gap-4 lg:flex-row">
      {/* Session list */}
      <Card className="flex w-full shrink-0 flex-col lg:w-80">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold">Live sessions</h1>
            <Badge variant={statusMeta.tone}>
              <RadioIcon className="size-3" /> {statusMeta.label}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {sessions.length} active {sessions.length === 1 ? "session" : "sessions"}
          </p>
          <div className="relative mt-3">
            <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search user or label"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {snapshotLoading ? (
            <div className="grid gap-2 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((entry) => (
              <button
                key={entry.session.id}
                onClick={() => setSelectedId(entry.session.id)}
                className={cn(
                  "mb-1 flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent/50 cursor-pointer",
                  selectedId === entry.session.id && "bg-accent",
                )}
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                  <UserIcon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {entry.session.userName || entry.session.userEmail || "User"}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {entry.session.label || entry.session.userEmail}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {entry.lastUpdateAt ? `Updated ${formatRelative(entry.lastUpdateAt)}` : "Awaiting fix…"}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <MapPinnedIcon className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {sessions.length === 0 ? "No active sessions right now." : "No sessions match your search."}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Map + detail */}
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <Card className="relative min-h-0 flex-1 overflow-hidden">
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-3 top-3 z-[1000] size-8 shadow-md"
            onClick={() => void toggleFullscreen()}
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {fullscreen ? <ShrinkIcon className="size-4" /> : <ExpandIcon className="size-4" />}
          </Button>
          <div ref={mapContainerRef} className="h-full min-h-[320px] bg-muted">
            <LiveMapCanvas sessions={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </Card>

        {selected && (
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
              <Detail label="User" value={selected.session.userName || "—"} />
              <Detail label="Email" value={selected.session.userEmail || "—"} />
              <Detail label="Duration" value={formatDuration(selected.session.startedAt, null)} />
              <Detail label="Accuracy" value={formatAccuracy(selected.accuracy)} />
              <Detail label="Points" value={String(selected.session.pointsCount)} />
              <Detail
                label="Coordinates"
                value={
                  selected.lat != null && selected.lng != null
                    ? `${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`
                    : "—"
                }
              />
              <Detail label="Last update" value={formatRelative(selected.lastUpdateAt)} />
              <Detail label="Consent" value="Explicit · granted" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}
