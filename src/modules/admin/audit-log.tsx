"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, ChevronRightIcon, ScrollTextIcon, SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/client-api";
import { formatDateTime } from "@/lib/utils";
import { ACTION_LABELS } from "@/modules/admin/action-labels";
import type { AuditLogDTO, Paginated } from "@/types";

const ACTION_OPTIONS = Object.entries(ACTION_LABELS).map(([value, meta]) => ({ value, label: meta.label }));

export function AuditLogModule() {
  const [page, setPage] = useState(1);
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("all");

  const params = new URLSearchParams({ page: String(page), pageSize: "25" });
  if (actor.trim()) params.set("actor", actor.trim());
  if (action !== "all") params.set("action", action);

  const query = useQuery({
    queryKey: ["admin", "audit", params.toString()],
    queryFn: () => apiGet<Paginated<AuditLogDTO>>(`/api/admin/audit?${params.toString()}`),
    placeholderData: keepPreviousData,
  });

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / 25)) : 1;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Audit logs</h1>
        <p className="text-sm text-muted-foreground">
          Append-only record of every security and location event in the system.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by actor email"
              value={actor}
              onChange={(e) => {
                setActor(e.target.value);
                setPage(1);
              }}
              className="pl-8"
            />
          </div>
          <Select
            value={action}
            onValueChange={(value) => {
              setAction(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {ACTION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2 sm:p-4">
          {query.isLoading ? (
            <div className="grid gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : query.data && query.data.items.length > 0 ? (
            <ol className="relative grid gap-1">
              {query.data.items.map((entry) => {
                const meta = ACTION_LABELS[entry.action] ?? { label: entry.action, tone: "secondary" as const };
                return (
                  <li
                    key={entry.id}
                    className="flex flex-col gap-1 rounded-lg border-l-2 border-border px-3 py-2.5 transition-colors hover:bg-accent/40 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex items-center gap-2 sm:w-48 sm:shrink-0">
                      <Badge variant={meta.tone}>{meta.label}</Badge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <span className="font-medium">{entry.actorEmail || "system"}</span>
                        {entry.targetType && (
                          <span className="text-muted-foreground">
                            {" "}
                            · {entry.targetType}
                            {entry.targetId ? ` ${entry.targetId.slice(0, 8)}` : ""}
                          </span>
                        )}
                      </p>
                      {entry.ip && <p className="truncate text-xs text-muted-foreground">IP {entry.ip}</p>}
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground">
                      {formatDateTime(entry.createdAt)}
                    </time>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <ScrollTextIcon className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No audit entries match your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{query.data?.total ?? 0} entries</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>
            <ChevronLeftIcon /> Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((v) => v + 1)}
          >
            Next <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
