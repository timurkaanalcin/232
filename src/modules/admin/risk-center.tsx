"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  BotIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ShieldAlertIcon,
  SirenIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost, ClientApiError } from "@/lib/client-api";
import { formatDateTime } from "@/lib/utils";
import type { Paginated, RiskEventDTO, RiskEventSeverity, RiskEventStatus } from "@/types";

type BadgeTone = "secondary" | "warning" | "destructive" | "success" | "outline";

interface RiskStats {
  open: number;
  acknowledged: number;
  criticalOpen: number;
  warningsOpen: number;
  resolvedToday: number;
  highScoreOpen: number;
}

const SEVERITY_TONE: Record<RiskEventSeverity, BadgeTone> = {
  info: "secondary",
  warning: "warning",
  critical: "destructive",
};

const STATUS_TONE: Record<RiskEventStatus, BadgeTone> = {
  open: "warning",
  acknowledged: "secondary",
  resolved: "success",
};

function errorMessage(error: unknown): string {
  return error instanceof ClientApiError ? error.message : "Something went wrong";
}

export function RiskCenter() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState<string>("all");
  const [status, setStatus] = useState<string>("open");
  const [subject, setSubject] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<RiskEventDTO | null>(null);

  const statsQuery = useQuery({
    queryKey: ["admin", "risk-stats"],
    queryFn: () => apiGet<{ stats: RiskStats }>("/api/admin/risk/stats"),
    refetchInterval: 10_000,
  });

  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (severity !== "all") params.set("severity", severity);
  if (status !== "all") params.set("status", status);
  if (subject.trim()) params.set("subject", subject.trim());

  const eventsQuery = useQuery({
    queryKey: ["admin", "risk-events", params.toString()],
    queryFn: () => apiGet<Paginated<RiskEventDTO>>(`/api/admin/risk/events?${params.toString()}`),
    placeholderData: keepPreviousData,
    refetchInterval: 10_000,
  });

  const refreshRisk = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "risk-events"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "risk-stats"] });
  };

  const acknowledge = useMutation({
    mutationFn: (id: number) =>
      apiPost<{ event: RiskEventDTO; changed: boolean }>(`/api/admin/risk/events/${id}/acknowledge`, {}),
    onSuccess: ({ changed }) => {
      toast.success(changed ? "Risk event acknowledged" : "Risk event was already handled");
      refreshRisk();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const resolve = useMutation({
    mutationFn: (id: number) =>
      apiPost<{ event: RiskEventDTO; changed: boolean }>(`/api/admin/risk/events/${id}/resolve`, {}),
    onSuccess: ({ changed }) => {
      toast.success(changed ? "Risk event resolved" : "Risk event was already resolved");
      refreshRisk();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const stats = statsQuery.data?.stats;
  const totalPages = eventsQuery.data ? Math.max(1, Math.ceil(eventsQuery.data.total / 20)) : 1;
  const actionPending = acknowledge.isPending || resolve.isPending;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 p-4 sm:p-6">
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlertIcon className="size-5 text-amber-600" />
          <h1 className="text-xl font-semibold tracking-tight">Risk & compliance center</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          AI, wallet, trading, liquidation and market-control alerts — updates every 10s.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open risks" value={stats?.open} loading={statsQuery.isLoading} accent />
        <StatCard label="Critical open" value={stats?.criticalOpen} loading={statsQuery.isLoading} danger />
        <StatCard label="High score open" value={stats?.highScoreOpen} loading={statsQuery.isLoading} danger />
        <StatCard label="Resolved today" value={stats?.resolvedToday} loading={statsQuery.isLoading} success />
      </div>

      <Card>
        <CardHeader className="gap-3">
          <div>
            <CardTitle className="text-base">Live risk events</CardTitle>
            <CardDescription>Filter by workflow status, severity or subject identifier.</CardDescription>
          </div>
          <div className="grid gap-2 sm:grid-cols-[160px_160px_1fr]">
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={severity}
              onValueChange={(value) => {
                setSeverity(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setPage(1);
              }}
              placeholder="Search subject, title, account, wallet..."
            />
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          {eventsQuery.isLoading ? (
            Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-24" />)
          ) : eventsQuery.data && eventsQuery.data.items.length > 0 ? (
            eventsQuery.data.items.map((event) => (
              <RiskEventCard
                key={event.id}
                event={event}
                onView={() => setSelectedEvent(event)}
                onAcknowledge={() => acknowledge.mutate(event.id)}
                onResolve={() => resolve.mutate(event.id)}
                actionPending={actionPending}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <AlertTriangleIcon className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No risk events match your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{eventsQuery.data?.total ?? 0} events</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            <ChevronLeftIcon /> Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
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
      </div>

      <RiskEventDialog event={selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)} />
    </div>
  );
}

function RiskEventCard({
  event,
  onView,
  onAcknowledge,
  onResolve,
  actionPending,
}: {
  event: RiskEventDTO;
  onView: () => void;
  onAcknowledge: () => void;
  onResolve: () => void;
  actionPending: boolean;
}) {
  return (
    <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={SEVERITY_TONE[event.severity]}>{event.severity}</Badge>
          <Badge variant={STATUS_TONE[event.status]}>{event.status}</Badge>
          <span className="truncate text-sm font-medium">{event.title}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{event.description || event.eventType}</p>
        <div className="mt-3 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
          <span>
            Source <span className="font-medium text-foreground">{event.source}</span>
          </span>
          <span>
            Type <span className="font-medium text-foreground">{event.eventType}</span>
          </span>
          <span>
            Subject{" "}
            <span className="font-medium text-foreground">
              {event.subjectType || "n/a"}
              {event.subjectId ? `:${event.subjectId}` : ""}
            </span>
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <RiskScore value={event.riskScore} />
          <time className="text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</time>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button variant="outline" size="sm" onClick={onView}>
          <EyeIcon /> Details
        </Button>
        {event.status === "open" && (
          <Button variant="secondary" size="sm" disabled={actionPending} onClick={onAcknowledge}>
            <BotIcon /> Acknowledge
          </Button>
        )}
        {event.status !== "resolved" && (
          <Button size="sm" disabled={actionPending} onClick={onResolve}>
            <CheckCircle2Icon /> Resolve
          </Button>
        )}
      </div>
    </div>
  );
}

function RiskScore({ value }: { value: number }) {
  const tone = value >= 80 ? "bg-destructive" : value >= 50 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex min-w-40 items-center gap-2">
      <span className="text-xs font-medium tabular-nums">Risk {value}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function RiskEventDialog({
  event,
  onOpenChange,
}: {
  event: RiskEventDTO | null;
  onOpenChange: (open: boolean) => void;
}) {
  const metadataEntries = event ? Object.entries(event.metadata) : [];
  return (
    <Dialog open={Boolean(event)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SirenIcon className="size-5 text-amber-600" />
            {event?.title ?? "Risk event"}
          </DialogTitle>
          <DialogDescription>{event?.eventType}</DialogDescription>
        </DialogHeader>
        {event && (
          <div className="grid max-h-[60dvh] gap-4 overflow-y-auto pr-1 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant={SEVERITY_TONE[event.severity]}>{event.severity}</Badge>
              <Badge variant={STATUS_TONE[event.status]}>{event.status}</Badge>
              <Badge variant="outline">risk {event.riskScore}</Badge>
            </div>
            <p className="text-muted-foreground">{event.description || "No description provided."}</p>
            <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
              <Detail label="Source" value={event.source} />
              <Detail label="Subject" value={`${event.subjectType || "n/a"}${event.subjectId ? `:${event.subjectId}` : ""}`} />
              <Detail label="Created" value={formatDateTime(event.createdAt)} />
              <Detail label="Updated" value={formatDateTime(event.updatedAt)} />
              <Detail label="Acknowledged" value={event.acknowledgedAt ? formatDateTime(event.acknowledgedAt) : "—"} />
              <Detail label="Resolved" value={event.resolvedAt ? formatDateTime(event.resolvedAt) : "—"} />
            </div>
            {event.operatorNote && (
              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Operator note</p>
                <p className="mt-1 whitespace-pre-wrap">{event.operatorNote}</p>
              </div>
            )}
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Metadata</p>
              {metadataEntries.length > 0 ? (
                <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
                  {JSON.stringify(event.metadata, null, 2)}
                </pre>
              ) : (
                <p className="mt-1 text-muted-foreground">No metadata.</p>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words">{value}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  accent,
  danger,
  success,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  accent?: boolean;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <Card
      className={
        danger
          ? "border-destructive/40"
          : success
            ? "border-emerald-500/30"
            : accent
              ? "border-amber-500/30"
              : undefined
      }
    >
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-12" />
        ) : (
          <p
            className={`mt-1 text-3xl font-semibold tabular-nums ${
              danger ? "text-destructive" : success ? "text-emerald-600" : ""
            }`}
          >
            {value ?? 0}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
