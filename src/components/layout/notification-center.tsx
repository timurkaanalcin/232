"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellIcon, CheckCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiGet, apiPost } from "@/lib/client-api";
import { formatRelative } from "@/lib/utils";
import type { NotificationDTO, Paginated } from "@/types";

interface NotificationsResponse extends Paginated<NotificationDTO> {
  unread: number;
}

export function NotificationCenter() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiGet<NotificationsResponse>("/api/notifications?page=1&pageSize=12"),
    refetchInterval: 30_000,
  });

  const markAll = useMutation({
    mutationFn: () => apiPost("/api/notifications/read", { all: true }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = query.data?.unread ?? 0;
  const items = query.data?.items ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <BellIcon className="size-4" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              <CheckCheckIcon className="size-3" /> Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-72 overflow-y-auto">
          {query.isLoading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className={`border-b px-3 py-2.5 last:border-0 ${item.readAt ? "opacity-70" : "bg-accent/30"}`}
              >
                <p className="text-sm font-medium leading-snug">{item.title}</p>
                {item.body && <p className="mt-0.5 text-xs text-muted-foreground">{item.body}</p>}
                <p className="mt-1 text-[11px] text-muted-foreground">{formatRelative(item.createdAt)}</p>
              </div>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
