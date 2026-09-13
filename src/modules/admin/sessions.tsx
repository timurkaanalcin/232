"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { CircleStopIcon, RadioIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost, ClientApiError } from "@/lib/client-api";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import { formatDateTime, formatDuration, formatRelative } from "@/lib/utils";
import type { LocationSessionDTO, RoleId } from "@/types";

export function AdminSessionsModule() {
  const queryClient = useQueryClient();
  const session = useSession();
  const role = (session.data?.user?.role ?? "viewer") as RoleId;
  const canStop = (ROLE_PERMISSIONS[role] ?? []).includes("sessions.manage");

  const query = useQuery({
    queryKey: ["admin", "sessions", "active"],
    queryFn: () => apiGet<{ sessions: LocationSessionDTO[] }>("/api/admin/sessions/active"),
    refetchInterval: 8_000,
  });

  const stop = useMutation({
    mutationFn: (id: string) => apiPost(`/api/location/sessions/${id}/stop`),
    onSuccess: () => {
      toast.success("Oturum durduruldu", { description: "Kullanıcının paylaşımı kesildi ve audit’e yazıldı." });
      void queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
    },
    onError: (error) =>
      toast.error(error instanceof ClientApiError ? error.message : "Oturum durdurulamadı"),
  });

  const items = query.data?.sessions ?? [];

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4">
      <div>
        <p className="hud-label mb-1">Operasyon</p>
        <h1 className="text-xl font-semibold tracking-tight">Açık konum oturumları</h1>
        <p className="text-sm text-muted-foreground">
          Yalnızca kullanıcının açık rızasıyla başlamış paylaşımlar. Gizli izleme yoktur.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RadioIcon className="size-4" /> Aktif paylaşımlar
          </CardTitle>
          <CardDescription>
            {items.length} oturum · her kayıtta izin zamanı vardır · 8 sn yenileme
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {query.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16" />)
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Şu anda izinli aktif paylaşım yok.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {item.userName || item.userEmail || item.userId}
                    {item.label ? <span className="text-muted-foreground"> · {item.label}</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    İzin {formatDateTime(item.consentGrantedAt)} · başladı {formatRelative(item.startedAt)} ·{" "}
                    {formatDuration(item.startedAt, null)}
                    {item.lastAddress ? ` · ${item.lastAddress}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Canlı</Badge>
                  {canStop && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => stop.mutate(item.id)}
                      disabled={stop.isPending}
                    >
                      <CircleStopIcon /> Durdur
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
