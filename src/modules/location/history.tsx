"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, ChevronRightIcon, MapPinnedIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/client-api";
import { cn, formatAccuracy, formatDateTime, formatDuration } from "@/lib/utils";
import type { LocationPointDTO, LocationSessionDTO, Paginated } from "@/types";

const TrackMap = dynamic(() => import("@/modules/location/track-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

interface SessionsResponse {
  history: Paginated<LocationSessionDTO>;
  active: LocationSessionDTO | null;
}

interface SessionDetailResponse {
  session: LocationSessionDTO;
  points: LocationPointDTO[];
}

const END_REASON_LABEL: Record<string, string> = {
  user: "Stopped by you",
  admin: "Stopped by an administrator",
  timeout: "Timed out",
  account_deleted: "Account deletion",
};

export function HistoryModule({ initialSessionId }: { initialSessionId: string | null }) {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(initialSessionId);
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);

  useEffect(() => {
    setPlaybackIndex(null);
  }, [selectedId]);

  const listQuery = useQuery({
    queryKey: ["location-sessions", "history", page],
    queryFn: () => apiGet<SessionsResponse>(`/api/location/sessions?page=${page}&pageSize=10`),
  });

  const detailQuery = useQuery({
    queryKey: ["location-session", selectedId],
    queryFn: () => apiGet<SessionDetailResponse>(`/api/location/sessions/${selectedId}`),
    enabled: Boolean(selectedId),
  });

  const totalPages = listQuery.data ? Math.max(1, Math.ceil(listQuery.data.history.total / 10)) : 1;
  const detail = detailQuery.data;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Session history</CardTitle>
          <CardDescription>Every sharing session you have ever started, with full detail.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {listQuery.isLoading ? (
            Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14" />)
          ) : listQuery.data && listQuery.data.history.items.length > 0 ? (
            <>
              {listQuery.data.history.items.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedId(session.id)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent/50 cursor-pointer",
                    selectedId === session.id && "border-primary bg-accent/60",
                  )}
                >
                  <div>
                    <p className="font-medium">{session.label || "Location session"}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(session.startedAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {session.status === "active" ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">{formatDuration(session.startedAt, session.endedAt)}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{session.pointsCount} points</span>
                  </div>
                </button>
              ))}
              <div className="mt-2 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  <ChevronLeftIcon /> Prev
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next <ChevronRightIcon />
                </Button>
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No sessions recorded yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden lg:col-span-3">
        {selectedId ? (
          detailQuery.isLoading || !detail ? (
            <Skeleton className="h-full min-h-[420px] w-full rounded-none" />
          ) : (
            <div className="flex h-full min-h-[420px] flex-col">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b p-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Started</p>
                  <p className="font-medium">{formatDateTime(detail.session.startedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {formatDuration(detail.session.startedAt, detail.session.endedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Points</p>
                  <p className="font-medium">{detail.session.pointsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last accuracy</p>
                  <p className="font-medium">{formatAccuracy(detail.session.lastAccuracy)}</p>
                </div>
                {detail.session.endReason && (
                  <div>
                    <p className="text-xs text-muted-foreground">Ended by</p>
                    <p className="font-medium">
                      {END_REASON_LABEL[detail.session.endReason] ?? detail.session.endReason}
                    </p>
                  </div>
                )}
              </div>
              {detail.points.length > 1 && (
                <div className="border-b px-4 py-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Route playback</span>
                    <span>
                      {playbackIndex != null
                        ? formatDateTime(detail.points[playbackIndex]?.recordedAt ?? null)
                        : "Full route"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={detail.points.length - 1}
                    value={playbackIndex ?? detail.points.length - 1}
                    onChange={(e) => setPlaybackIndex(Number.parseInt(e.target.value, 10))}
                    className="mt-2 w-full accent-[var(--color-primary)]"
                    aria-label="Session playback timeline"
                  />
                </div>
              )}
              <div className="min-h-0 flex-1">
                {detail.points.length > 0 ? (
                  <TrackMap points={detail.points} playbackIndex={playbackIndex} />
                ) : (
                  <EmptyDetail text="No location points were recorded in this session." />
                )}
              </div>
            </div>
          )
        ) : (
          <EmptyDetail text="Select a session to inspect its route and details." />
        )}
      </Card>
    </div>
  );
}

function EmptyDetail({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-accent">
        <MapPinnedIcon className="size-6 text-primary" />
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
