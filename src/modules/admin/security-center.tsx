"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertTriangleIcon, ChevronLeftIcon, ChevronRightIcon, ShieldAlertIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/client-api";
import { formatDateTime } from "@/lib/utils";
import type { Paginated, SecurityEventDTO, SecuritySeverity } from "@/types";

const SEVERITY_TONE: Record<SecuritySeverity, "secondary" | "warning" | "destructive"> = {
  info: "secondary",
  warning: "warning",
  critical: "destructive",
};

export function SecurityCenter() {
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState<string>("all");

  const statsQuery = useQuery({
    queryKey: ["admin", "security-stats"],
    queryFn: () =>
      apiGet<{
        stats: {
          failedLoginsToday: number;
          rateLimitedToday: number;
          criticalToday: number;
          warningsToday: number;
        };
      }>("/api/admin/security/stats"),
    refetchInterval: 15_000,
  });

  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (severity !== "all") params.set("severity", severity);

  const eventsQuery = useQuery({
    queryKey: ["admin", "security-events", params.toString()],
    queryFn: () => apiGet<Paginated<SecurityEventDTO>>(`/api/admin/security/events?${params.toString()}`),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  });

  const stats = statsQuery.data?.stats;
  const totalPages = eventsQuery.data ? Math.max(1, Math.ceil(eventsQuery.data.total / 20)) : 1;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Security center</h1>
        <p className="text-sm text-muted-foreground">
          Failed logins, rate limits and suspicious activity — updates every 15s.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Failed logins today" value={stats?.failedLoginsToday} loading={statsQuery.isLoading} />
        <StatCard label="Rate limited today" value={stats?.rateLimitedToday} loading={statsQuery.isLoading} />
        <StatCard label="Warnings today" value={stats?.warningsToday} loading={statsQuery.isLoading} accent />
        <StatCard label="Critical today" value={stats?.criticalToday} loading={statsQuery.isLoading} danger />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Security events</CardTitle>
          <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="grid gap-1">
          {eventsQuery.isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)
          ) : eventsQuery.data && eventsQuery.data.items.length > 0 ? (
            eventsQuery.data.items.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-1 rounded-lg border-l-2 border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-2">
                  <ShieldAlertIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={SEVERITY_TONE[event.severity]}>{event.severity}</Badge>
                      <span className="text-sm font-medium">{event.eventType}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.actorEmail || "system"}
                      {event.ip ? ` · ${event.ip}` : ""}
                    </p>
                  </div>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</time>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <AlertTriangleIcon className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No security events match your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{eventsQuery.data?.total ?? 0} events</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>
            <ChevronLeftIcon /> Prev
          </Button>
          <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((v) => v + 1)}>
            Next <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  accent,
  danger,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <Card className={danger ? "border-destructive/40" : accent ? "border-amber-500/30" : undefined}>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-12" />
        ) : (
          <p className={`mt-1 text-3xl font-semibold tabular-nums ${danger ? "text-destructive" : ""}`}>
            {value ?? 0}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
