"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ActivityIcon,
  GaugeIcon,
  GlobeIcon,
  LaptopIcon,
  MapIcon,
  RadioIcon,
  ServerIcon,
  TimerIcon,
  UserPlusIcon,
  UsersIcon,
  WifiIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/client-api";
import { formatRelative } from "@/lib/utils";
import { ACTION_LABELS } from "@/modules/admin/action-labels";
import { formatDuration } from "@/lib/utils";
import type { AdminAnalyticsDTO, AdminStatsDTO, AuditLogDTO } from "@/types";

export function AdminDashboard() {
  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiGet<{ stats: AdminStatsDTO }>("/api/admin/stats"),
    refetchInterval: 10_000,
  });

  const activityQuery = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: () => apiGet<{ activity: AuditLogDTO[] }>("/api/admin/activity"),
    refetchInterval: 10_000,
  });

  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: () => apiGet<{ status: string; checks: Record<string, string> }>("/api/health"),
    refetchInterval: 30_000,
  });

  const analyticsQuery = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => apiGet<{ analytics: AdminAnalyticsDTO }>("/api/admin/analytics"),
    refetchInterval: 15_000,
  });

  const stats = statsQuery.data?.stats;
  const analytics = analyticsQuery.data?.analytics;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Command center</h1>
          <p className="text-sm text-muted-foreground">Live operational overview · updates every 10s</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/map">
              <MapIcon /> Live map
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users">
              <UsersIcon /> Manage users
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={RadioIcon}
          label="Active sessions"
          value={stats?.activeSessions}
          loading={statsQuery.isLoading}
          accent
        />
        <StatCard icon={UsersIcon} label="Active users" value={stats?.activeUsers} loading={statsQuery.isLoading} />
        <StatCard
          icon={WifiIcon}
          label="Realtime connections"
          value={stats?.realtimeConnections}
          loading={statsQuery.isLoading}
        />
        <StatCard
          icon={ActivityIcon}
          label="Sessions today"
          value={stats?.sessionsToday}
          loading={statsQuery.isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Daily metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Today at a glance</CardTitle>
            <CardDescription>Key activity since midnight (local time).</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MiniStat icon={UserPlusIcon} label="New users" value={stats?.newUsersToday} loading={statsQuery.isLoading} />
            <MiniStat icon={GaugeIcon} label="Logins" value={stats?.loginsToday} loading={statsQuery.isLoading} />
            <MiniStat icon={RadioIcon} label="Sessions" value={stats?.sessionsToday} loading={statsQuery.isLoading} />
            <MiniStat icon={ActivityIcon} label="Points logged" value={stats?.pointsToday} loading={statsQuery.isLoading} />
          </CardContent>
        </Card>

        {/* System health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ServerIcon className="size-4" /> System health
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {healthQuery.isLoading ? (
              <Skeleton className="h-20" />
            ) : (
              <>
                <HealthRow label="Overall" ok={healthQuery.data?.status === "healthy"} />
                {healthQuery.data &&
                  Object.entries(healthQuery.data.checks).map(([key, value]) => (
                    <HealthRow key={key} label={key} ok={value === "ok"} />
                  ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics widgets */}
      <div className="grid gap-4 lg:grid-cols-3">
        <BreakdownCard
          title="Browsers"
          icon={GlobeIcon}
          items={analytics?.browserBreakdown}
          loading={analyticsQuery.isLoading}
        />
        <BreakdownCard
          title="Devices (OS)"
          icon={LaptopIcon}
          items={analytics?.deviceBreakdown}
          loading={analyticsQuery.isLoading}
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TimerIcon className="size-4" /> Session metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {analyticsQuery.isLoading ? (
              <Skeleton className="h-16" />
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. duration today</span>
                  <span className="font-medium tabular-nums">
                    {analytics?.avgSessionDurationMs
                      ? formatDuration(0, analytics.avgSessionDurationMs)
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active now</span>
                  <span className="font-medium tabular-nums">{analytics?.activeSessionCount ?? 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {analytics && analytics.geoRegions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Geographic distribution (active)</CardTitle>
            <CardDescription>Grouped by approximate coordinates of live sessions.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analytics.geoRegions.map((region) => (
              <Badge key={region.label} variant="secondary" className="gap-1.5 px-3 py-1">
                {region.label}
                <span className="rounded-full bg-primary/15 px-1.5 text-xs font-semibold text-primary">
                  {region.count}
                </span>
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent activity feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/audit">View audit log</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-1">
          {activityQuery.isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)
          ) : activityQuery.data && activityQuery.data.activity.length > 0 ? (
            activityQuery.data.activity.map((entry) => {
              const meta = ACTION_LABELS[entry.action] ?? { label: entry.action, tone: "secondary" as const };
              return (
                <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-accent/40">
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge variant={meta.tone}>{meta.label}</Badge>
                    <span className="truncate text-sm text-muted-foreground">
                      {entry.actorEmail || "system"}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(entry.createdAt)}</span>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  accent,
}: {
  icon: typeof UsersIcon;
  label: string;
  value: number | undefined;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "border-primary/40 bg-primary/5" : undefined}>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p className="mt-1 text-3xl font-semibold tabular-nums">{value ?? 0}</p>
          )}
        </div>
        <div className={`flex size-10 items-center justify-center rounded-lg ${accent ? "bg-primary text-primary-foreground" : "bg-accent text-primary"}`}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof UsersIcon;
  label: string;
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border p-4">
      <Icon className="size-4 text-muted-foreground" />
      {loading ? (
        <Skeleton className="mt-2 h-7 w-12" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tabular-nums">{value ?? 0}</p>
      )}
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function BreakdownCard({
  title,
  icon: Icon,
  items,
  loading,
}: {
  title: string;
  icon: typeof GlobeIcon;
  items?: { label: string; count: number }[];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {loading ? (
          <Skeleton className="h-20" />
        ) : items && items.length > 0 ? (
          items.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="truncate text-muted-foreground">{item.label}</span>
              <span className="font-medium tabular-nums">{item.count}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function HealthRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="capitalize">{label}</span>
      <span className="flex items-center gap-1.5">
        <span className={`size-2 rounded-full ${ok ? "bg-emerald-500" : "bg-destructive"}`} />
        <span className={ok ? "text-emerald-600" : "text-destructive"}>{ok ? "Operational" : "Degraded"}</span>
      </span>
    </div>
  );
}
