"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost, ClientApiError } from "@/lib/client-api";
import { formatRelative } from "@/lib/utils";
import type { ClientSupportMessageDTO } from "@/types";

interface SupportResponse {
  client: {
    id: string;
    name: string;
    clientNumericId: string;
    managerName: string | null;
  };
  messages: ClientSupportMessageDTO[];
}

function errorMessage(error: unknown): string {
  return error instanceof ClientApiError ? error.message : "Mesaj gönderilemedi";
}

export function SupportCenter() {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const supportQuery = useQuery({
    queryKey: ["support"],
    queryFn: () => apiGet<SupportResponse>("/api/support"),
    refetchInterval: 5_000,
  });

  const send = useMutation({
    mutationFn: () => apiPost("/api/support", { body }),
    onSuccess: () => {
      setBody("");
      void queryClient.invalidateQueries({ queryKey: ["support"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Canlı Destek</h1>
        <p className="text-sm text-muted-foreground">
          Sorumlu çalışanınız ve takım lideri ile güvenli CRM mesajlaşması.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquareIcon className="size-4" />
            {supportQuery.data?.client.name ?? "Client destek hattı"}
          </CardTitle>
          {supportQuery.data?.client ? (
            <p className="text-sm text-muted-foreground">
              Client ID #{supportQuery.data.client.clientNumericId || "-"} · Sorumlu:{" "}
              {supportQuery.data.client.managerName || "Atanmadı"}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid max-h-[460px] min-h-[300px] gap-3 overflow-y-auto rounded-xl border bg-muted/30 p-4">
            {supportQuery.isLoading ? (
              <>
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </>
            ) : supportQuery.data && supportQuery.data.messages.length > 0 ? (
              supportQuery.data.messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[82%] rounded-2xl border p-3 text-sm shadow-sm ${
                    message.mine ? "ml-auto bg-primary text-primary-foreground" : "bg-background"
                  }`}
                >
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-medium">{message.senderName || message.senderEmail}</span>
                    <span className={message.mine ? "text-xs text-primary-foreground/70" : "text-xs text-muted-foreground"}>
                      {formatRelative(message.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                </div>
              ))
            ) : (
              <div className="grid place-items-center text-center text-sm text-muted-foreground">
                <div>
                  <MessageSquareIcon className="mx-auto mb-2 size-8" />
                  Henüz mesaj yok. İlk mesajı gönderin.
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="min-h-24 rounded-lg border bg-background p-3 text-sm outline-none ring-ring focus:ring-2"
              placeholder="Mesajınızı yazın..."
            />
            <Button className="w-fit" disabled={send.isPending || !body.trim()} onClick={() => send.mutate()}>
              <SendIcon /> Mesaj gönder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
